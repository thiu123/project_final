import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type { Review } from "@/types";

const API_URL = API_ENDPOINTS.REVIEWS;

export const fetchReviews = (id: string) => {
  return axiosInstance.get<Review[]>(`${API_URL}/${id}`);
};

export const fetchUserReviews = () => {
  return axiosInstance.get<Review[]>(`${API_URL}/user/reviews`);
};

export const createReview = (
  bookId: string,
  rating: number,
  comment: string
) => {
  return axiosInstance.post<Review>(`${API_URL}/create`, {
    bookId,
    rating,
    comment,
  });
};

export const editReview = (reviewId: string, rating: number, comment: string) => {
  return axiosInstance.put<Review>(`${API_URL}/edit/${reviewId}`, {
    rating,
    comment,
  });
};

export const deleteReview = (id: string) => {
  return axiosInstance.delete(`${API_URL}/${id}`);
};

export const getAverageRating = (bookId: string) => {
  return axiosInstance.get(`${API_URL}/average/${bookId}`);
};

// ========== ADMIN REPLY API ==========
export const createReply = (reviewId: string, content: string) => {
  return axiosInstance.post(`${API_URL}/${reviewId}/reply`, { content });
};

export const updateReply = (
  reviewId: string,
  replyId: string,
  content: string
) => {
  return axiosInstance.put(`${API_URL}/${reviewId}/reply/${replyId}`, {
    content,
  });
};

export const deleteReply = (reviewId: string, replyId: string) => {
  return axiosInstance.delete(`${API_URL}/${reviewId}/reply/${replyId}`);
};

// ========== ADMIN REVIEW MANAGEMENT API ==========
export const getAllReviewsAdmin = () => {
  return axiosInstance.get<Review[]>(`${API_URL}/admin/all`);
};
