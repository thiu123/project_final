import axios from "axios";

const API_URL = "http://localhost:5000/api/order";

const token = () => `Bearer ${localStorage.getItem("accessToken")}`;

const orderApi = {
  getCartPreview: async () => {
    const res = await axios.get(`${API_URL}/preview`, {
      headers: { token: token() },
    });
    return res.data;
  },

  getUserOrders: async () => {
    const res = await axios.get(`${API_URL}/user`, {
      headers: { token: token() },
    });
    return res.data;
  },

  getOrderById: async (orderId) => {
    const res = await axios.get(`${API_URL}/${orderId}`, {
      headers: { token: token() },
    });
    if (!res.data) {
      throw new Error("Order not found");
    }
    return res.data;
  },

  createOrderFromCart: async () => {
    const res = await axios.post(`${API_URL}/checkout`, null, {
      headers: { token: token() },
    });
    return res.data;
  },
};

export default orderApi;
