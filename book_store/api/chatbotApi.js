import axios from "axios";

const BASE_URL = "http://localhost:5000/api/chatbot";


export const getBookSuggestions = async (userPreferences) => {
  try {
    const response = await axios.post(`${BASE_URL}/suggestions`, {
      userPreferences,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const generateSmartReview = async (reviewData, token) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/review/generate`,
      reviewData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const searchAndReviewBook = async (
  bookQuery,
  userThoughts = "",
  token
) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/review/generate`,
      {
        bookQuery,
        userThoughts,
        reviewType: "general",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const chatWithBot = async (message, context = "") => {
  try {
    const response = await axios.post(`${BASE_URL}/chat`, {
      message,
      context,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
