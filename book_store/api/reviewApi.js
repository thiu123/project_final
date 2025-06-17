import axios from "axios";

const API_URL = "http://localhost:5000/api/reviews";
const token = () => `Bearer ${localStorage.getItem("accessToken")}`;

export const fetchReviews = () => {
  return axios.get(API_URL, {
    headers: { token: token() },
  });
};

export const createReview = (bookId, rating, comment) => {
  return axios.post(
    API_URL,
    { bookId, rating, comment },
    { headers: { token: token() } }
  );
};

export const deleteReview = (id) => {
  return axios.delete(`${API_URL}/${id}`, {
    headers: { token: token() },
  });
};
