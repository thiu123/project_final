import axios from "axios";

const API_URL = "http://localhost:5000/api/reviews";
const token = () => `Bearer ${localStorage.getItem("accessToken")}`;

export const fetchReviews = (id) => {
  return axios.get(`${API_URL}/${id}`, {
    headers: { token: token() },
  });
};

export const fetchUserReviews = () => {
  return axios.get(`${API_URL}/user/reviews`, {
    headers: { token: token() },
  });
};

export const createReview = (bookId, rating, comment) => {
  return axios.post(
    `${API_URL}/create`,
    { bookId, rating, comment },
    { headers: { token: token() } }
  );
};

export const deleteReview = (id) => {
  return axios.delete(`${API_URL}/${id}`, {
    headers: { token: token() },
  });
};

export const getAverageRating = (bookId) => {
  return axios.get(`${API_URL}/average/${bookId}`);
};

// ========== ADMIN REPLY API ==========
export const createReply = (reviewId, content) => {
  return axios.post(
    `${API_URL}/${reviewId}/reply`,
    { content },
    { headers: { token: token() } }
  );
};

export const updateReply = (reviewId, replyId, content) => {
  return axios.put(
    `${API_URL}/${reviewId}/reply/${replyId}`,
    { content },
    { headers: { token: token() } }
  );
};

export const deleteReply = (reviewId, replyId) => {
  return axios.delete(`${API_URL}/${reviewId}/reply/${replyId}`, {
    headers: { token: token() },
  });
};

// ========== ADMIN REVIEW MANAGEMENT API ==========
export const getAllReviewsAdmin = () => {
  return axios.get(`${API_URL}/admin/all`, {
    headers: { token: token() },
  });
};
