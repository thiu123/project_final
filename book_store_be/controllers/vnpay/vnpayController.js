const {
  VNPay,
  ignoreLogger,
  dateFormat,
  ProductCode,
  VnpLocale,
} = require("vnpay");

const vnpay = new VNPay({
  tmnCode: "5TRJ8O87",
  secureSecret: "QHI9W1B2Q2PD2UQ3TXBQ9BOGY9IRQBNQ",
  vnpayHost: "https://sandbox.vnpayment.vn",
  testMode: true,
  hashAlgorithm: "SHA512",
  loggerFn: ignoreLogger,
});

// ✅ Export đúng dạng object với hàm buildPaymentUrl
const vnpayController = {
  // createPaymentUrl: async (req, res) => {
  //   const vnpayResponse = await vnpay.buildPaymentUrl({
  //     vnp_Locale: VnpLocale.VN,
  //     vnp_CurrCode: "VND",
  //     vnp_TxnRef: "123456",
  //     vnp_OrderInfo: "123456",
  //     vnp_OrderType: ProductCode.Other,
  //     vnp_Amount: 100000,
  //     vnp_ReturnUrl: "http://localhost:5000/api/order/vnpay_return",
  //     vnp_IpAddr: "127.0.0.1",
  //     vnp_CreateDate: dateFormat(new Date()),
  //   });
  //   return res.status(200).json(vnpayResponse);
  // },

  // ✅ Đây là hàm bạn cần gọi từ orderController
  buildPaymentUrl: async ({ orderId, amount }) => {
    return vnpay.buildPaymentUrl({
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toán đơn hàng #${orderId}`,
      vnp_Amount: amount * 1000,
      vnp_Locale: VnpLocale.VN,
      vnp_CurrCode: "VND",
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: "http://localhost:5000/api/order/vnpay_return",
      vnp_IpAddr: "127.0.0.1",
      vnp_CreateDate: dateFormat(new Date()),
    });
  },
};

module.exports = vnpayController;
