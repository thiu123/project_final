import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";

const API_URL = API_ENDPOINTS.BOOKS;

export const getBooksBySubject = (subject) => {
  return axiosInstance.get(API_URL, {
    params: {
      subject,
    },
  });
};

export const getHomeBooks = () => {
  return axiosInstance.get(`${API_URL}/home`);
};

export const getBookById = (id) => {
  return axiosInstance.get(`${API_URL}/${id}`);
};

export const searchBooksByTitle = (title) => {
  return axiosInstance.get(`${API_URL}/search`, {
    params: { title },
  });
};

export const createBook = (bookData) => {
  return axiosInstance.post(API_URL, bookData);
};

export const updateBook = (id, bookData) => {
  return axiosInstance.put(`${API_URL}/${id}`, bookData);
};

export const deleteBookById = (id) => {
  return axiosInstance.delete(`${API_URL}/${id}`);
};
