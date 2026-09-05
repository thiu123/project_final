import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type { Book } from "@/types";

const API_URL = API_ENDPOINTS.BOOKS;

export interface HomeBooksResponse {
  all: Book[];
  subjects: Record<string, Book[]>;
}

export const getBooksBySubject = (subject?: string) => {
  return axiosInstance.get<Book[]>(API_URL, {
    params: {
      subject,
    },
  });
};

export const getHomeBooks = () => {
  return axiosInstance.get<HomeBooksResponse>(`${API_URL}/home`);
};

export const getBookById = (id: string) => {
  return axiosInstance.get<Book>(`${API_URL}/${id}`);
};

export const searchBooksByTitle = (title: string) => {
  return axiosInstance.get<Book[]>(`${API_URL}/search`, {
    params: { title },
  });
};

export const createBook = (bookData: Partial<Book>) => {
  return axiosInstance.post<Book>(API_URL, bookData);
};

export const updateBook = (id: string, bookData: Partial<Book>) => {
  return axiosInstance.put<Book>(`${API_URL}/${id}`, bookData);
};

export const deleteBookById = (id: string) => {
  return axiosInstance.delete(`${API_URL}/${id}`);
};
