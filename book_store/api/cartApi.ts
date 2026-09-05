import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type { Cart, ProductType } from "@/types";

const API_URL = API_ENDPOINTS.CARTS;

export const fetchCart = () => {
  return axiosInstance.get<Cart>(API_URL);
};

export const addToCart = (
  bookId: string,
  quantity: number,
  productType: ProductType
) => {
  return axiosInstance.post(`${API_URL}/add`, {
    bookId,
    quantity,
    productType,
  });
};

export const updateCartItem = (bookId: string, quantity: number) => {
  return axiosInstance.put(`${API_URL}/update`, { bookId, quantity });
};

export const removeCartItem = (bookId: string) => {
  return axiosInstance.delete(`${API_URL}/delete`, {
    data: { bookId },
  });
};
