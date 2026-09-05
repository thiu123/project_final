import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";

const BASE_URL = API_ENDPOINTS.CHATBOT;

export interface SmartReviewPayload {
  bookTitle?: string;
  rating?: number;
  keywords?: string;
  [key: string]: unknown;
}

export const getBookSuggestions = async (userPreferences: string) => {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/suggestions`, {
      userPreferences,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const generateSmartReview = async (reviewData: SmartReviewPayload) => {
  try {
    const response = await axiosInstance.post(
      `${BASE_URL}/review/generate`,
      reviewData
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};
