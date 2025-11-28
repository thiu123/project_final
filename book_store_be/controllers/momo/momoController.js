const crypto = require("crypto");
const axios = require("axios");

// MoMo Configuration
const MOMO_CONFIG = {
  partnerCode: "MOMO",
  accessKey: "F8BBA842ECF85",
  secretKey: "K951B6PE1waDMi640xX08PD3vg6EkVlz",
  endpoint: "https://test-payment.momo.vn/v2/gateway/api",
  redirectUrl: "http://localhost:5000/api/order/momo_return",
  ipnUrl: "http://localhost:5000/api/order/momo_return",
};

const momoController = {
  buildPaymentUrl: async ({ orderId, amount }) => {
    try {
      const requestId = orderId + new Date().getTime();
      const requestType = "payWithMethod";
      const extraData = "";
      const orderInfo = `Thanh toán đơn hàng ${orderId}`;
      const lang = "vi";

      // Tạo raw signature theo đúng format của MoMo
      const rawSignature =
        `accessKey=${MOMO_CONFIG.accessKey}` +
        `&amount=${amount}` +
        `&extraData=${extraData}` +
        `&ipnUrl=${MOMO_CONFIG.ipnUrl}` +
        `&orderId=${orderId}` +
        `&orderInfo=${orderInfo}` +
        `&partnerCode=${MOMO_CONFIG.partnerCode}` +
        `&redirectUrl=${MOMO_CONFIG.redirectUrl}` +
        `&requestId=${requestId}` +
        `&requestType=${requestType}`;

      // console.log("--------------------RAW SIGNATURE----------------");
      // console.log(rawSignature);

      // Tạo signature bằng HMAC SHA256
      const signature = crypto
        .createHmac("sha256", MOMO_CONFIG.secretKey)
        .update(rawSignature)
        .digest("hex");

      // console.log("--------------------SIGNATURE----------------");
      // console.log(signature);

      // Chuẩn bị request body
      const requestBody = {
        partnerCode: MOMO_CONFIG.partnerCode,
        accessKey: MOMO_CONFIG.accessKey,
        requestId: requestId,
        amount: amount.toString(),
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: MOMO_CONFIG.redirectUrl,
        ipnUrl: MOMO_CONFIG.ipnUrl,
        extraData: extraData,
        requestType: requestType,
        signature: signature,
        lang: lang,
      };

      // console.log("MoMo Request:", JSON.stringify(requestBody, null, 2));

      // Gửi request đến MoMo
      const response = await axios.post(
        `${MOMO_CONFIG.endpoint}/create`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // console.log("MoMo Response:", response.data);

      if (response.data.resultCode === 0) {
        return response.data.payUrl;
      } else {
        throw new Error(
          response.data.message ||
            `MoMo payment creation failed with code: ${response.data.resultCode}`
        );
      }
    } catch (error) {
      console.error(
        "MoMo Create Payment Error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};

module.exports = momoController;
