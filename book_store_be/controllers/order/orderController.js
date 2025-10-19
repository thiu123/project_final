const Order = require("../../model/Order");
const Cart = require("../../model/Cart");
const Voucher = require("../../model/Voucher");
const vnpayController = require("../vnpay/vnpayController");
const momoController = require("../momo/momoController");

const orderController = {
  getCartPreview: async (req, res) => {
    try {
      const userId = req.user.id;

      const cart = await Cart.findOne({ userId }).populate("items.bookId");
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ msg: "Cart is empty" });
      }

      const exchange_rate = 24;
      const totalAmount = cart.items.reduce((sum, item) => {
        // Apply pricing based on product type
        const price =
          item.productType === "ebook"
            ? item.bookId.price * 0.8 // 80% of original price for ebook (20% off)
            : item.bookId.price; // Full price for hardbook
        return sum + price * item.quantity * exchange_rate;
      }, 0);

      return res.status(200).json({
        items: cart.items,
        total: totalAmount,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

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

      const exchange_rate = 24000;

      // Calculate subtotal
      let subtotal = cart.items.reduce((sum, item) => {
        const price =
          item.productType === "ebook"
            ? item.bookId.price * 0.8
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

      const order = await Order.findOne({ orderId: vnp_TxnRef });
      if (order) {
        order.status = vnp_ResponseCode === "00" ? "Paid" : "Failed";
        await order.save();

        if (order.status === "Paid") {
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

      // Tính tổng tiền
      const exchange_rate = 24000;

      // Calculate subtotal
      let subtotal = cart.items.reduce((sum, item) => {
        const price =
          item.productType === "ebook"
            ? item.bookId.price * 0.8
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

      const order = await Order.findOne({ orderId });
      if (order) {
        // MoMo trả về resultCode có thể là string "0" hoặc number 0
        // Dùng == để check cả 2 cases (loose equality)
        order.status = resultCode == 0 ? "Paid" : "Failed";
        await order.save();

        console.log(`✅ Order ${orderId} updated to status: ${order.status}`);

        if (order.status === "Paid") {
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

      // Tìm order đã paid và có ebook
      const order = await Order.findOne({
        userId,
        status: "Paid",
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
