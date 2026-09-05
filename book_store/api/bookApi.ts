import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type {
  Book,
  BookQuery,
  CategoryNode,
  HomePayload,
  Paginated,
} from "@/types";

const API_URL = API_ENDPOINTS.BOOKS;

/** Drops empty values so the URL only carries filters that are actually set. */
function toParams(query: BookQuery): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params[key] = value as string | number | boolean;
  }
  return params;
}

/**
 * Paginated catalogue. Pagination, filtering and sorting are all resolved by
 * the API, so the response only ever contains the rows for the current page.
 */
export const getBooks = (query: BookQuery = {}) => {
  return axiosInstance.get<Paginated<Book>>(API_URL, {
    params: toParams(query),
  });
};

/** Category tree with live book counts and a cover per category. */
export const getCategories = () => {
  return axiosInstance.get<CategoryNode[]>(`${API_URL}/categories`);
};

/** Everything the home page renders, in one request. */
export const getHomeBooks = () => {
  return axiosInstance.get<HomePayload>(`${API_URL}/home`);
};

export const getBookById = (id: string) => {
  return axiosInstance.get<Book>(`${API_URL}/${id}`);
};

/**
 * Capped suggestions for the search box. Use `getBooks({ search })` when the
 * full, paginated result set is needed.
 */
export const searchBooksByTitle = (title: string, limit = 8) => {
  return axiosInstance.get<Book[]>(`${API_URL}/search`, {
    params: { title, limit },
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
