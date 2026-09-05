import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type { Order, OrderStatus } from "@/types";

const API_URL = API_ENDPOINTS.ORDER;

export interface CheckoutResponse {
  paymentUrl: string;
}

export interface EbookPurchaseResponse {
  isPurchased: boolean;
}

export interface DashboardStats {
  [key: string]: unknown;
}

const orderApi = {
  getUserOrders: async (): Promise<Order[]> => {
    const res = await axiosInstance.get<Order[]>(`${API_URL}/user`);
    return res.data;
  },

  getOrderById: async (orderId: string): Promise<Order> => {
    const res = await axiosInstance.get<Order>(`${API_URL}/${orderId}`);
    if (!res.data) {
      throw new Error("Order not found");
    }
    return res.data;
  },

  // VNPAY checkout
  createOrderFromCart: async (
    voucherCode: string | null = null
  ): Promise<CheckoutResponse> => {
    const res = await axiosInstance.post<CheckoutResponse>(
      `${API_URL}/checkout`,
      voucherCode ? { voucherCode } : {}
    );
    return res.data;
  },

  // MoMo checkout
  createMomoOrderFromCart: async (
    voucherCode: string | null = null
  ): Promise<CheckoutResponse> => {
    const res = await axiosInstance.post<CheckoutResponse>(
      `${API_URL}/checkout_momo`,
      voucherCode ? { voucherCode } : {}
    );
    return res.data;
  },

  // Check whether the current user already purchased this ebook
  checkEbookPurchase: async (bookId: string): Promise<EbookPurchaseResponse> => {
    const res = await axiosInstance.get<EbookPurchaseResponse>(
      `${API_URL}/check-ebook`,
      {
        params: { bookId },
      }
    );
    return res.data;
  },

  // Admin: Get all orders
  getAllOrders: async (): Promise<Order[]> => {
    const res = await axiosInstance.get<Order[]>(`${API_URL}/admin/all`);
    return res.data;
  },

  // Admin: Get dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await axiosInstance.get<DashboardStats>(
      `${API_URL}/admin/dashboard/stats`
    );
    return res.data;
  },

  // Admin: Update order status
  updateOrderStatus: async (
    orderId: string,
    status: OrderStatus
  ): Promise<Order> => {
    const res = await axiosInstance.put<Order>(
      `${API_URL}/admin/${orderId}/status`,
      { status }
    );
    return res.data;
  },

  // Admin: Confirm order
  confirmOrder: async (orderId: string): Promise<Order> => {
    const res = await axiosInstance.put<Order>(
      `${API_URL}/admin/${orderId}/confirm`,
      {}
    );
    return res.data;
  },

  // User: Cancel order
  cancelOrder: async (orderId: string): Promise<Order> => {
    const res = await axiosInstance.put<Order>(
      `${API_URL}/${orderId}/cancel`,
      {}
    );
    return res.data;
  },
};

export default orderApi;
