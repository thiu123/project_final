import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";

const API_URL = API_ENDPOINTS.REVIEWS;

export const fetchReviews = (id) => {
  return axiosInstance.get(`${API_URL}/${id}`);
};

export const fetchUserReviews = () => {
  return axiosInstance.get(`${API_URL}/user/reviews`);
};

export const createReview = (bookId, rating, comment) => {
  return axiosInstance.post(`${API_URL}/create`, { bookId, rating, comment });
};

export const editReview = (reviewId, rating, comment) => {
  return axiosInstance.put(`${API_URL}/edit/${reviewId}`, { rating, comment });
};

export const deleteReview = (id) => {
  return axiosInstance.delete(`${API_URL}/${id}`);
};

export const getAverageRating = (bookId) => {
  return axiosInstance.get(`${API_URL}/average/${bookId}`);
};

// ========== ADMIN REPLY API ==========
export const createReply = (reviewId, content) => {
  return axiosInstance.post(`${API_URL}/${reviewId}/reply`, { content });
};

export const updateReply = (reviewId, replyId, content) => {
  return axiosInstance.put(`${API_URL}/${reviewId}/reply/${replyId}`, {
    content,
  });
};

export const deleteReply = (reviewId, replyId) => {
  return axiosInstance.delete(`${API_URL}/${reviewId}/reply/${replyId}`);
};

// ========== ADMIN REVIEW MANAGEMENT API ==========
export const getAllReviewsAdmin = () => {
  return axiosInstance.get(`${API_URL}/admin/all`);
};
