// src/api/orderApi.js

import axios from "axios";

const API_URL = "http://localhost:5000/api/orders";

const token = () => `Bearer ${localStorage.getItem("accessToken")}`;

const orderApi = {
  getCartPreview: async () => {
    const res = await axios.get(`${API_URL}/preview`, {
      headers: {
        Authorization: token(),
      },
    });
    return res.data;
  },

  createOrderFromCart: async () => {
    const res = await axios.post(`${API_URL}/checkout`, null, {
      headers: {
        Authorization: token(),
      },
    });
    return res.data;
  },

  handleVnpayReturn: async (query) => {
    const res = await axios.get(`${API_URL}/vnpay_return`, {
      headers: {
        Authorization: token(),
      },
      params: query,
    });
    return res.data;
  },
};

export default orderApi;
