import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type { Favorite } from "@/types";

const BASE_URL = API_ENDPOINTS.FAVORITE;

// The backend returns favorite documents with bookId populated as a Book
export const toggleFavorites = (bookId: string) => {
  return axiosInstance.post<Favorite[]>(`${BASE_URL}/toggle`, { bookId });
};

export const getFavoritesForEachUser = () => {
  return axiosInstance.get<Favorite[]>(BASE_URL);
};
