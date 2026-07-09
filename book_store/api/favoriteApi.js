import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";

const BASE_URL = API_ENDPOINTS.FAVORITE;

export const toggleFavorites = (bookId) => {
  return axiosInstance.post(`${BASE_URL}/toggle`, { bookId });
};

export const getFavoritesForEachUser = () => {
  return axiosInstance.get(BASE_URL);
};
