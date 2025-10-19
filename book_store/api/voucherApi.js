import axios from "axios";

const BASE_URL = "http://localhost:5000/api/voucher";
const token = () => `Bearer ${localStorage.getItem("accessToken")}`;

// Validate voucher code
export const validateVoucher = async (code, orderAmount) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/validate`,
      {
        code,
        orderAmount,
      },
      {
        headers: {
          token: token(),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Apply voucher (increment usage count)
export const applyVoucher = async (code) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/apply`,
      { code },
      {
        headers: {
          token: token(),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all active vouchers
export const getAllVouchers = async () => {
  try {
    const response = await axios.get(BASE_URL, {
      headers: {
        token: token(),
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
