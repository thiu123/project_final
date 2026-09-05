import { defineStore } from "pinia";
import { ref } from "vue";
import {
  getBooks,
  getCategories as getCategoriesApi,
  getHomeBooks as getHomeBooksApi,
  deleteBookById as deleteBookByIdApi,
  createBook as createBookApi,
  updateBook as updateBookApi,
} from "@/api/bookApi";
import type {
  Book,
  BookQuery,
  CategoryNode,
  PaginationMeta,
} from "@/types";

const emptyMeta = (limit = 12): PaginationMeta => ({
  page: 1,
  limit,
  total: 0,
  totalPages: 0,
  hasPrev: false,
  hasNext: false,
});

export const useBookStore = defineStore("book", () => {
  /** Rows for the page currently being viewed. */
  const books = ref<Book[]>([]);
  /** Pagination for `books`, as reported by the API. */
  const pagination = ref<PaginationMeta>(emptyMeta());

  /** Home carousels, keyed by subject. */
  const homeSubjects = ref<Record<string, Book[]>>({});
  const bestSellers = ref<Book[]>([]);
  /** Category tree served by the API, including counts and covers. */
  const categories = ref<CategoryNode[]>([]);

  const loading = ref(false);

  /**
   * Loads one page of the catalogue. Filtering, sorting and paging are all
   * done by the API, so whatever comes back is exactly what gets rendered.
   */
  async function fetchBooks(query: BookQuery = {}) {
    loading.value = true;
    try {
      const response = await getBooks(query);
      books.value = response.data.items;
      pagination.value = response.data.meta;
      return response.data;
    } catch (error) {
      console.error("Failed to fetch books", error);
      books.value = [];
      pagination.value = emptyMeta(query.limit);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /** Single request that fills the hero, every carousel and the category list. */
  async function getHomeBooks() {
    loading.value = true;
    try {
      const { data } = await getHomeBooksApi();
      books.value = data.latest;
      homeSubjects.value = data.groups;
      bestSellers.value = data.bestSellers;
      categories.value = data.categories;
      return data;
    } catch (error) {
      console.error("Failed to fetch home books", error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /** Categories only. The home payload already includes them, so this is for other pages. */
  async function fetchCategories(force = false) {
    if (!force && categories.value.length > 0) return categories.value;
    try {
      const { data } = await getCategoriesApi();
      categories.value = data;
      return data;
    } catch (error) {
      console.error("Failed to fetch categories", error);
      return [];
    }
  }

  async function deleteBookById({ id }: { id: string }) {
    try {
      await deleteBookByIdApi(id);
      books.value = books.value.filter((book) => book._id !== id);
      pagination.value.total = Math.max(0, pagination.value.total - 1);
    } catch (error) {
      console.error("Failed to delete book", error);
      throw error;
    }
  }

  async function createBook(bookData: Partial<Book>) {
    loading.value = true;
    try {
      const response = await createBookApi(bookData);
      return response.data;
    } catch (error) {
      console.error("Failed to create book", error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function updateBook({
    id,
    bookData,
  }: {
    id: string;
    bookData: Partial<Book>;
  }) {
    loading.value = true;
    try {
      const response = await updateBookApi(id, bookData);
      return response.data;
    } catch (error) {
      console.error("Failed to update book", error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  return {
    books,
    pagination,
    homeSubjects,
    bestSellers,
    categories,
    loading,
    fetchBooks,
    getHomeBooks,
    fetchCategories,
    deleteBookById,
    createBook,
    updateBook,
  };
});
