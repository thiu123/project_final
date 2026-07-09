import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";

const API_URL = API_ENDPOINTS.CARTS;

export const fetchCart = () => {
  return axiosInstance.get(API_URL);
};

export const addToCart = (bookId, quantity, productType) => {
  return axiosInstance.post(`${API_URL}/add`, { bookId, quantity, productType });
};

export const updateCartItem = (bookId, quantity) => {
  return axiosInstance.put(`${API_URL}/update`, { bookId, quantity });
};

export const removeCartItem = (bookId) => {
  return axiosInstance.delete(`${API_URL}/delete`, {
    data: { bookId },
  });
};
