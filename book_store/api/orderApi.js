import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";

const API_URL = API_ENDPOINTS.ORDER;

const orderApi = {
  getUserOrders: async () => {
    const res = await axiosInstance.get(`${API_URL}/user`);
    return res.data;
  },

  getOrderById: async (orderId) => {
    const res = await axiosInstance.get(`${API_URL}/${orderId}`);
    if (!res.data) {
      throw new Error("Order not found");
    }
    return res.data;
  },

  // VNPAY checkout
  createOrderFromCart: async (voucherCode = null) => {
    const res = await axiosInstance.post(
      `${API_URL}/checkout`,
      voucherCode ? { voucherCode } : {}
    );
    return res.data;
  },

  // MoMo checkout
  createMomoOrderFromCart: async (voucherCode = null) => {
    const res = await axiosInstance.post(
      `${API_URL}/checkout_momo`,
      voucherCode ? { voucherCode } : {}
    );
    return res.data;
  },

  // ✅ Kiểm tra user đã mua ebook chưa
  checkEbookPurchase: async (bookId) => {
    const res = await axiosInstance.get(`${API_URL}/check-ebook`, {
      params: { bookId },
    });
    return res.data;
  },

  // Admin: Get all orders
  getAllOrders: async () => {
    const res = await axiosInstance.get(`${API_URL}/admin/all`);
    return res.data;
  },

  // Admin: Get dashboard statistics
  getDashboardStats: async () => {
    const res = await axiosInstance.get(`${API_URL}/admin/dashboard/stats`);
    return res.data;
  },

  // Admin: Update order status
  updateOrderStatus: async (orderId, status) => {
    const res = await axiosInstance.put(`${API_URL}/admin/${orderId}/status`, {
      status,
    });
    return res.data;
  },

  // Admin: Confirm order
  confirmOrder: async (orderId) => {
    const res = await axiosInstance.put(
      `${API_URL}/admin/${orderId}/confirm`,
      {}
    );
    return res.data;
  },

  // User: Cancel order
  cancelOrder: async (orderId) => {
    const res = await axiosInstance.put(`${API_URL}/${orderId}/cancel`, {});
    return res.data;
  },
};

export default orderApi;
