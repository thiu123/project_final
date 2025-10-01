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

      const cart = await Cart.findOne({ userId }).populate("items.bookId");
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ msg: "Cart is empty" });
      }

      const exchange_rate = 24000;
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
  createMoMoOrderFromCart: async (req, res) => {
    try {
      const userId = req.user.id;

      // Lấy giỏ hàng của user
      const cart = await Cart.findOne({ userId }).populate("items.bookId");
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ msg: "Cart is empty" });
      }

      // Tính tổng tiền
      const exchange_rate = 24000;
      const totalAmount = cart.items.reduce((sum, item) => {
        return sum + item.bookId.price * item.quantity * exchange_rate;
      }, 0);

      // Tạo orderId
      const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

      // Tạo order mới trong database
      const newOrder = new Order({
        userId,
        orderId,
        items: cart.items,
        total: totalAmount,
        paymentMethod: "MoMo",
      });

      await newOrder.save();

      // Tạo MoMo payment URL
      const paymentUrl = await orderController.buildMoMoPaymentUrl({
        orderId,
        amount: totalAmount,
      });

      return res.status(200).json({ paymentUrl });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
   buildMoMoPaymentUrl: async ({ orderId, amount }) => {
    try {
      const requestId = orderId + new Date().getTime();
      const requestType = 'payWithMethod';
      const extraData = '';
      const orderInfo = `Thanh toán đơn hàng ${orderId}`;
      const lang = 'vi';
      
      // Tạo raw signature
      const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${MOMO_CONFIG.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${MOMO_CONFIG.partnerCode}&redirectUrl=${MOMO_CONFIG.redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
      
      // Tạo signature
      const signature = crypto
        .createHmac('sha256', MOMO_CONFIG.secretKey)
        .update(rawSignature)
        .digest('hex');

      // Chuẩn bị request body
      const requestBody = {
        partnerCode: MOMO_CONFIG.partnerCode,
        partnerName: "BookStore",
        storeId: "BookStoreOnline",
        requestId: requestId,
        amount: amount,
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: MOMO_CONFIG.redirectUrl,
        ipnUrl: MOMO_CONFIG.ipnUrl,
        lang: lang,
        requestType: requestType,
        autoCapture: true,
        extraData: extraData,
        signature: signature
      };

      console.log('MoMo Request:', JSON.stringify(requestBody, null, 2));

      // Gửi request đến MoMo
      const response = await axios.post(`${MOMO_CONFIG.endpoint}/create`, requestBody, {
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('MoMo Response:', response.data);

      if (response.data.resultCode === 0) {
        return response.data.payUrl;
      } else {
        throw new Error(response.data.message || 'MoMo payment creation failed');
      }
    } catch (error) {
      console.error('MoMo Create Payment Error:', error);
      throw error;
    }
  },

};

module.exports = orderController;
