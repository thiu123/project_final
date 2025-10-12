import axios from "axios";

const BASE_URL = "http://localhost:5000/api/chatbot";
const token = () => `Bearer ${localStorage.getItem("accessToken")}`;

export const getBookSuggestions = async (userPreferences) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/suggestions`,
      {
        userPreferences: userPreferences,
      },
      {
        headers: {
          token: token(),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const generateSmartReview = async (reviewData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/review/generate`,
      reviewData,
      {
        headers: {
          token: token(),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
