const Order = require("../../model/Order");
const Cart = require("../../model/Cart");
const Voucher = require("../../model/Voucher");
const Book = require("../../model/Book");
const vnpayController = require("../vnpay/vnpayController");
const momoController = require("../momo/momoController");

const orderController = {
  getUserOrders: async (req, res) => {
    try {
      const userId = req.user.id;
      const orders = await Order.find({ userId })
        .populate("items.bookId")
        .sort({ createdAt: -1 });
      return res.status(200).json(orders);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  // Admin: Get all orders
  getAllOrders: async (req, res) => {
    try {
      const orders = await Order.find()
        .populate("items.bookId")
        .populate("userId", "username email")
        .sort({ createdAt: -1 });
      return res.status(200).json(orders);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  // Admin: Get dashboard statistics
  getDashboardStats: async (req, res) => {
    try {
      // Total revenue (only paid orders)
      const revenueResult = await Order.aggregate([
        { $match: { status: "Paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]);
      const totalRevenue = revenueResult[0]?.total || 0;

      // Total orders by status
      const orderStats = await Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      // Recent orders (latest 10)
      const recentOrders = await Order.find()
        .populate("items.bookId", "title")
        .populate("userId", "username")
        .sort({ createdAt: -1 })
        .limit(10);

      return res.status(200).json({
        totalRevenue,
        orderStats,
        recentOrders,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  // Admin: Update order status
  updateOrderStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = [
        "Pending",
        "Paid",
        "Confirmed",
        "In Delivery",
        "Delivered",
        "Cancelled",
        "Failed",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ msg: "Invalid status" });
      }

      const order = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      ).populate("items.bookId");

      if (!order) {
        return res.status(404).json({ msg: "Order not found" });
      }

      return res.status(200).json(order);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  // Admin: Confirm order after payment
  confirmOrder: async (req, res) => {
    try {
      const { id } = req.params;

      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ msg: "Order not found" });
      }

      if (order.status !== "Paid") {
        return res.status(400).json({ msg: "Can only confirm paid orders" });
      }

      if (order.confirmedByAdmin) {
        return res.status(400).json({ msg: "Order already confirmed" });
      }

      order.confirmedByAdmin = true;
      order.confirmedAt = new Date();
      order.status = "Confirmed";
      await order.save();

      const populatedOrder = await Order.findById(id)
        .populate("items.bookId")
        .populate("userId", "username email");

      return res.status(200).json(populatedOrder);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  // User: Cancel order
  cancelOrder: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ msg: "Order not found" });
      }

      // Check if order belongs to user
      if (order.userId.toString() !== userId) {
        return res.status(403).json({ msg: "Unauthorized" });
      }

      // Check if order contains any ebooks
      const hasEbook = order.items.some((item) => item.productType === "ebook");
      if (hasEbook && order.status === "Paid") {
        return res.status(400).json({
          msg: "Cannot cancel order containing ebooks after payment",
        });
      }

      // Only allow cancellation for Pending or Paid orders (before Confirmed)
      if (!["Pending", "Paid"].includes(order.status)) {
        return res.status(400).json({
          msg: "Cannot cancel order. Only Pending or Paid orders can be cancelled.",
        });
      }

      // Check if order is already cancelled or failed
      if (order.status === "Cancelled" || order.status === "Failed") {
        return res
          .status(400)
          .json({ msg: "Order is already cancelled or failed" });
      }

      // If order was paid, we need to restore stock and voucher usage
      if (order.status === "Paid" || order.status === "Confirmed") {
        // Restore stock for hardbooks and decrement sold count
        for (const item of order.items) {
          const book = await Book.findById(item.bookId);
          if (book) {
            if (item.productType === "hardbook") {
              book.stock += item.quantity;
            }
            book.sold = Math.max(0, book.sold - item.quantity);
            await book.save();
          }
        }

        // Restore voucher usage
        if (order.voucher && order.voucher.code) {
          const voucher = await Voucher.findOne({ code: order.voucher.code });
          if (voucher && voucher.usedCount > 0) {
            voucher.usedCount -= 1;
            await voucher.save();
          }
        }
      }

      order.status = "Cancelled";
      await order.save();

      const populatedOrder = await Order.findById(id).populate("items.bookId");

      return res.status(200).json(populatedOrder);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  getOrderById: async (req, res) => {
    try {
      const { id } = req.params;
      console.log("Fetching order with ID:", id);
      const order = await Order.findOne({ orderId: id }).populate(
        "items.bookId"
      );
      if (!order) {
        return res.status(404).json({ msg: "Order not found" });
      }

      console.log("Order details:", order);
      return res.status(200).json(order);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  createOrderFromCart: async (req, res) => {
    try {
      const userId = req.user.id;
      const { voucherCode } = req.body;

      const cart = await Cart.findOne({ userId }).populate("items.bookId");
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ msg: "Cart is empty" });
      }

      // Check stock for hardbooks before creating order
      for (const item of cart.items) {
        if (item.productType === "hardbook") {
          if (item.bookId.stock < item.quantity) {
            return res.status(400).json({
              msg: `Insufficient stock for "${item.bookId.title}". Available: ${item.bookId.stock}, Requested: ${item.quantity}`,
            });
          }
        }
      }

      const exchange_rate = 24000;

      // Calculate subtotal
      let subtotal = cart.items.reduce((sum, item) => {
        const price =
          item.productType === "ebook"
            ? item.bookId.price * 0.7
            : item.bookId.price;
        return sum + price * item.quantity;
      }, 0);

      let discountAmount = 0;

      // Validate voucher if provided (but don't increment usedCount yet)
      if (voucherCode) {
        const voucher = await Voucher.findOne({
          code: voucherCode.toUpperCase(),
          isActive: true,
        });

        if (voucher) {
          // Check expiry
          if (new Date() > voucher.expiryDate) {
            return res.status(400).json({ msg: "Voucher has expired" });
          }

          // Check usage limit
          if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
            return res.status(400).json({ msg: "Voucher usage limit reached" });
          }

          // Check min order amount
          if (subtotal < voucher.minOrderAmount) {
            return res.status(400).json({
              msg: `Minimum order amount is $${voucher.minOrderAmount}`,
            });
          }

          // Calculate discount
          if (voucher.discountType === "percentage") {
            discountAmount = (subtotal * voucher.discountValue) / 100;
            if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
              discountAmount = voucher.maxDiscount;
            }
          } else {
            discountAmount = voucher.discountValue;
          }

          // Don't allow discount to exceed subtotal
          if (discountAmount > subtotal) {
            discountAmount = subtotal;
          }
        } else {
          return res.status(400).json({ msg: "Invalid voucher code" });
        }
      }

      // Calculate final total in VND
      const totalAmount = Math.round(
        (subtotal - discountAmount) * exchange_rate
      );

      const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

      const newOrder = new Order({
        userId,
        orderId,
        items: cart.items,
        total: totalAmount,
        paymentMethod: "Vnpay",
        voucher: voucherCode
          ? {
              code: voucherCode.toUpperCase(),
              discountAmount: Math.round(discountAmount * exchange_rate), // Store discount in VND
            }
          : undefined,
      });

      await newOrder.save();

      const paymentUrl = await vnpayController.buildPaymentUrl({
        orderId,
        amount: totalAmount,
      });

      return res.status(200).json({ paymentUrl });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  vnpayReturn: async (req, res) => {
    try {
      const queryData = req.query;
      const { vnp_ResponseCode, vnp_TxnRef } = queryData;

      const order = await Order.findOne({ orderId: vnp_TxnRef }).populate(
        "items.bookId"
      );
      if (order) {
        order.status = vnp_ResponseCode === "00" ? "Paid" : "Failed";
        await order.save();

        if (order.status === "Paid") {
          // Decrement stock for hardbooks and increment sold count
          for (const item of order.items) {
            const book = await Book.findById(item.bookId._id);
            if (book) {
              // Update stock for hardbooks
              if (
                item.productType === "hardbook" &&
                book.stock >= item.quantity
              ) {
                book.stock -= item.quantity;
                console.log(
                  `✅ Stock updated for "${book.title}": ${
                    book.stock + item.quantity
                  } → ${book.stock}`
                );
              }
              // Increment sold count for both hardbook and ebook
              book.sold += item.quantity;
              await book.save();
              console.log(
                `✅ Sold count updated for "${book.title}": ${
                  book.sold - item.quantity
                } → ${book.sold}`
              );
            }
          }

          // Increment voucher usage count on successful payment
          if (order.voucher && order.voucher.code) {
            const voucher = await Voucher.findOne({ code: order.voucher.code });
            if (voucher) {
              voucher.usedCount += 1;
              await voucher.save();
              console.log(
                `✅ Voucher ${order.voucher.code} usage incremented to ${voucher.usedCount}`
              );
            }
          }

          await Cart.findOneAndDelete({ userId: order.userId });
        }
      }
      return res.redirect(`http://localhost:3000/order/status/${vnp_TxnRef}`);
    } catch (err) {
      console.error("Payment processing error:", err);
      return res.redirect(`http://localhost:3000/order/status/unknown`);
    }
  },
  createMoMoOrderFromCart: async (req, res) => {
    try {
      const userId = req.user.id;
      const { voucherCode } = req.body;

      // Lấy giỏ hàng của user
      const cart = await Cart.findOne({ userId }).populate("items.bookId");
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ msg: "Cart is empty" });
      }

      // Check stock for hardbooks before creating order
      for (const item of cart.items) {
        if (item.productType === "hardbook") {
          if (item.bookId.stock < item.quantity) {
            return res.status(400).json({
              msg: `Insufficient stock for "${item.bookId.title}". Available: ${item.bookId.stock}, Requested: ${item.quantity}`,
            });
          }
        }
      }

      // Tính tổng tiền
      const exchange_rate = 24000;

      // Calculate subtotal
      let subtotal = cart.items.reduce((sum, item) => {
        const price =
          item.productType === "ebook"
            ? item.bookId.price * 0.7
            : item.bookId.price;
        return sum + price * item.quantity;
      }, 0);

      let discountAmount = 0;

      // Validate voucher if provided (but don't increment usedCount yet)
      if (voucherCode) {
        const voucher = await Voucher.findOne({
          code: voucherCode.toUpperCase(),
          isActive: true,
        });

        if (voucher) {
          // Check expiry
          if (new Date() > voucher.expiryDate) {
            return res.status(400).json({ msg: "Voucher has expired" });
          }

          // Check usage limit
          if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
            return res.status(400).json({ msg: "Voucher usage limit reached" });
          }

          // Check min order amount
          if (subtotal < voucher.minOrderAmount) {
            return res.status(400).json({
              msg: `Minimum order amount is $${voucher.minOrderAmount}`,
            });
          }

          // Calculate discount
          if (voucher.discountType === "percentage") {
            discountAmount = (subtotal * voucher.discountValue) / 100;
            if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
              discountAmount = voucher.maxDiscount;
            }
          } else {
            discountAmount = voucher.discountValue;
          }

          // Don't allow discount to exceed subtotal
          if (discountAmount > subtotal) {
            discountAmount = subtotal;
          }
        } else {
          return res.status(400).json({ msg: "Invalid voucher code" });
        }
      }

      // Calculate final total in VND
      const totalAmount = Math.round(
        (subtotal - discountAmount) * exchange_rate
      );

      // Tạo orderId
      const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

      // Tạo order mới trong database
      const newOrder = new Order({
        userId,
        orderId,
        items: cart.items,
        total: totalAmount,
        paymentMethod: "Momo",
        voucher: voucherCode
          ? {
              code: voucherCode.toUpperCase(),
              discountAmount: Math.round(discountAmount * exchange_rate), // Store discount in VND
            }
          : undefined,
      });

      await newOrder.save();

      // Tạo MoMo payment URL
      const paymentUrl = await momoController.buildPaymentUrl({
        orderId,
        amount: totalAmount,
      });

      return res.status(200).json({ paymentUrl });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  momoReturn: async (req, res) => {
    try {
      const queryData = req.query;
      const { resultCode, orderId } = queryData;

      console.log("MoMo Return Data:", queryData);
      console.log(
        "MoMo resultCode type:",
        typeof resultCode,
        "value:",
        resultCode
      );

      const order = await Order.findOne({ orderId }).populate("items.bookId");
      if (order) {
        // MoMo trả về resultCode có thể là string "0" hoặc number 0
        // Dùng == để check cả 2 cases (loose equality)
        order.status = resultCode == 0 ? "Paid" : "Failed";
        await order.save();

        console.log(`✅ Order ${orderId} updated to status: ${order.status}`);

        if (order.status === "Paid") {
          // Decrement stock for hardbooks and increment sold count
          for (const item of order.items) {
            const book = await Book.findById(item.bookId._id);
            if (book) {
              // Update stock for hardbooks
              if (
                item.productType === "hardbook" &&
                book.stock >= item.quantity
              ) {
                book.stock -= item.quantity;
                console.log(
                  `✅ Stock updated for "${book.title}": ${
                    book.stock + item.quantity
                  } → ${book.stock}`
                );
              }
              // Increment sold count for both hardbook and ebook
              book.sold += item.quantity;
              await book.save();
              console.log(
                `✅ Sold count updated for "${book.title}": ${
                  book.sold - item.quantity
                } → ${book.sold}`
              );
            }
          }

          // Increment voucher usage count on successful payment
          if (order.voucher && order.voucher.code) {
            const voucher = await Voucher.findOne({ code: order.voucher.code });
            if (voucher) {
              voucher.usedCount += 1;
              await voucher.save();
              console.log(
                `✅ Voucher ${order.voucher.code} usage incremented to ${voucher.usedCount}`
              );
            }
          }

          await Cart.findOneAndDelete({ userId: order.userId });
          console.log(`✅ Cart cleared for user ${order.userId}`);
        }
      } else {
        console.error(`❌ Order not found: ${orderId}`);
      }

      return res.redirect(`http://localhost:3000/order/status/${orderId}`);
    } catch (err) {
      console.error("MoMo payment processing error:", err);
      return res.redirect(`http://localhost:3000/order/status/unknown`);
    }
  },

  // ✅ API kiểm tra user đã mua ebook chưa
  checkEbookPurchase: async (req, res) => {
    try {
      const userId = req.user.id;
      const { bookId } = req.query;

      if (!bookId) {
        return res.status(400).json({ msg: "Book ID is required" });
      }

      // Ebook is available immediately after payment (Paid status)
      const order = await Order.findOne({
        userId,
        status: { $in: ["Paid", "Confirmed", "In Delivery", "Delivered"] },
        "items.bookId": bookId,
        "items.productType": "ebook",
      });

      return res.status(200).json({
        isPurchased: !!order,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = orderController;
