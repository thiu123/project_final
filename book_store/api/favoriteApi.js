import axios from "axios";

const BASE_URL = "http://localhost:5000/api/favorite";

const token = () => `Bearer ${localStorage.getItem("accessToken")}`;

export const toggleFavorites = (bookId) => {
  return axios.post(
    `${BASE_URL}/toggle`,
    { bookId },
    { headers: { token: token() } }
  );
};

export const getFavoritesForEachUser = () => {
  return axios.get(`${BASE_URL}`, {
    headers: { token: token() },
  });
};
