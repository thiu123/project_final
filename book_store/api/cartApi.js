import axios from "axios";

const API_URL = "http://localhost:5000/api/carts";
const token = () => `Bearer ${localStorage.getItem("accessToken")}`;

export const fetchCart = () => {
  return axios.get(API_URL, {
    headers: { token: token() },
  });
};

export const addToCart = (bookId, quantity) => {
  return axios.post(
    `${API_URL}/add`,
    { bookId, quantity },
    { headers: { token: token() } }
  );
};

export const updateCartItem = (bookId, quantity) => {
  return axios.put(`${API_URL}/update`, { bookId, quantity }, {
    headers: { token: token() },
  });
};

export const removeCartItem = (bookId) => {
  return axios.delete(`${API_URL}/delete`, {
    data: { bookId },
    headers: { token: token() },
  });
};
