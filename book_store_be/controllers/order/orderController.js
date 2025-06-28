const Order = require("../../model/Order");
const Cart = require("../../model/Cart");
const vnpayController = require("../vnpay/vnpayController");

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
        return sum + item.bookId.price * item.quantity * exchange_rate;
      }, 0);

      return res.status(200).json({
        items: cart.items,
        total: totalAmount,
      });
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

      const cart = await Cart.findOne({ userId }).populate("items.bookId");
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ msg: "Cart is empty" });
      }

      const exchange_rate = 24;
      const totalAmount = cart.items.reduce((sum, item) => {
        return sum + item.bookId.price * item.quantity * exchange_rate;
      }, 0);

      const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

      const newOrder = new Order({
        userId,
        orderId,
        items: cart.items,
        total: totalAmount,
        paymentMethod: "Vnpay",
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
        order.vnpayData = queryData;
        await order.save();

        if (order.status === "Paid") {
          await Cart.findOneAndDelete({ userId: order.userId });
        }
      }
      return res.redirect(`http://localhost:3000/order/status/${vnp_TxnRef}`);
    } catch (err) {
      console.error("Payment processing error:", err);
      return res.redirect(`http://localhost:3000/order/status/unknown`);
    }
  },
};

module.exports = orderController;
