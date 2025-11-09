import axios from "axios";

const API_URL = "http://localhost:5000/api/books";
const token = () => `Bearer ${localStorage.getItem("accessToken")}`;

export const getBooksBySubject = (subject) => {
  return axios.get(API_URL, {
    params: {
      subject,
    },
  });
};

export const searchBooksByTitle = (title) => {
  return axios.get(`${API_URL}/search`, {
    params: { title },
  });
};

export const createBook = (bookData) => {
  return axios.post(API_URL, bookData, {
    headers: { token: token() },
  });
};

export const updateBook = (id, bookData) => {
  return axios.put(`${API_URL}/${id}`, bookData, {
    headers: { token: token() },
  });
};

export const deleteBookById = (id) => {
  return axios.delete(`${API_URL}/${id}`, {
    headers: { token: token() },
  });
};
