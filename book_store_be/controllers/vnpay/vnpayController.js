const {
  VNPay,
  ignoreLogger,
  dateFormat,
  ProductCode,
  VnpLocale,
} = require("vnpay");

const vnpay = new VNPay({
  tmnCode: "PLQTSFX0",
  secureSecret: "QJII36JEMAK9961SUTIL54JLJG9IY58H",
  vnpayHost: "https://sandbox.vnpayment.vn",
  testMode: true, // This will override vnpayHost to sandbox
  hashAlgorithm: "SHA512",
  enableLog: true,
});

console.log("=== VNPay Configuration ===");
console.log("TMN Code:", "RGD2QXQ2");
console.log("Hash Algorithm:", "SHA512");
console.log("VNPay Host:", "https://sandbox.vnpayment.vn");
console.log("Test Mode:", true);

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

  buildPaymentUrl: async ({ orderId, amount }) => {
    // console.log("\n=== VNPay Payment URL Builder ===");
    // console.log("Input Data:", { orderId, amount });
    // console.log("Amount type:", typeof amount, "Value:", amount);

    // Đảm bảo amount là số nguyên
    const vnpAmount = Math.round(Number(amount));

    const currentDate = new Date();
    const formattedDate = dateFormat(currentDate);

    const paymentData = {
      vnp_Amount: vnpAmount,
      vnp_Command: "pay",
      vnp_CreateDate: formattedDate,
      vnp_CurrCode: "VND",
      vnp_IpAddr: "127.0.0.1",
      vnp_Locale: VnpLocale.VN,
      vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: "http://localhost:5000/api/order/vnpay_return",
      vnp_TxnRef: orderId,
    };

    // console.log("Payment Data to VNPay:");
    // console.log(JSON.stringify(paymentData, null, 2));
    // console.log("CreateDate format:", formattedDate);

    try {
      const paymentUrl = await vnpay.buildPaymentUrl(paymentData);
      // console.log("✅ SUCCESS - Generated Payment URL:");
      // console.log(paymentUrl);

      // Log URL params để debug
      // const urlObj = new URL(paymentUrl);
      // console.log("\nURL Parameters:");
      // urlObj.searchParams.forEach((value, key) => {
      //   console.log(`  ${key}: ${value}`);
      // });

      // console.log("=== End VNPay Payment URL Builder ===\n");
      return paymentUrl;
    } catch (error) {
      console.error("❌ VNPay Error:", error.message);
      console.error("Error Stack:", error.stack);
      // console.log("=== End VNPay Payment URL Builder (ERROR) ===\n");
      throw error;
    }
  },
};

module.exports = vnpayController;
