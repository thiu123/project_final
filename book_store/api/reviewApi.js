import axios from "axios";

const API_URL = "http://localhost:5000/api/reviews";
const token = () => `Bearer ${localStorage.getItem("accessToken")}`;

export const fetchReviews = (id) => {
  return axios.get(`${API_URL}/${id}`, {
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
