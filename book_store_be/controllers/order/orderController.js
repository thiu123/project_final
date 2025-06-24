const Order = require("../../model/Order");
const Cart = require("../../model/Cart");
const vnpayController = require("../vnpay/vnpayController");

const orderController = {
  getCartPreview: async (req, res) => {
    try {
      const userId = req.user.id;

      const cart = await Cart.findOne({ userId }).populate("items.bookId");
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ msg: "Giỏ hàng trống" });
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

  createOrderFromCart: async (req, res) => {
    try {
      const userId = req.user.id;

      const cart = await Cart.findOne({ userId }).populate("items.bookId");
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ msg: "Giỏ hàng trống" });
      }

      const exchange_rate = 24;
      const totalAmount = cart.items.reduce((sum, item) => {
        return sum + item.bookId.price * item.quantity * exchange_rate;
      }, 0);

      const orderId = Date.now().toString();

      const newOrder = new Order({
        userId,
        items: cart.items,
        total: totalAmount,
        paymentMethod: "Vnpay",
      });
      await newOrder.save();

      const paymentUrl = await vnpayController.buildPaymentUrl({
        orderId,
        amount: totalAmount,
      });

      console.log("Payment URL:", newOrder);
      return res.status(200).json({ paymentUrl });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  vnpayReturn: async (req, res) => {
    try {
      const { vnp_ResponseCode, vnp_TxnRef } = req.query;

      const order = await Order.findOne({ orderId: vnp_TxnRef });
      if (!order) return res.status(404).send("Order not found");

      if (vnp_ResponseCode === "00") {
        order.status = "Paid";
      } else {
        order.status = "Failed";
      }

      await order.save();
      return res.send(
        vnp_ResponseCode === "00"
          ? "Thanh toán thành công!"
          : "Thanh toán thất bại!"
      );
    } catch (err) {
      return res.status(500).send("Lỗi xử lý thanh toán");
    }
  },
};

module.exports = orderController;
