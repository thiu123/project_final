import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";

const BASE_URL = API_ENDPOINTS.CHATBOT;

export const getBookSuggestions = async (userPreferences) => {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/suggestions`, {
      userPreferences: userPreferences,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const generateSmartReview = async (reviewData) => {
  try {
    const response = await axiosInstance.post(
      `${BASE_URL}/review/generate`,
      reviewData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
