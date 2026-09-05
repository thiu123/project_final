import { defineStore } from "pinia";
import { computed, ref } from "vue";
import {
  getBooksBySubject,
  getHomeBooks as getHomeBooksApi,
  deleteBookById as deleteBookByIdApi,
  createBook as createBookApi,
  updateBook as updateBookApi,
} from "@/api/bookApi";
import type { Book } from "@/types";

export const useBookStore = defineStore("book", () => {
  const books = ref<Book[]>([]);
  const homeSubjects = ref<Record<string, Book[]>>({});
  const fictionBooks = ref<Book[]>([]);
  const mangaBooks = ref<Book[]>([]);
  const romanceBooks = ref<Book[]>([]);
  const loading = ref(false);

  const getTitleBooks = computed(() =>
    books.value.map((book) => ({
      title: book.title,
      cover_url: book.cover_url,
      price: book.price,
      first_publish_year: book.first_publish_year,
    }))
  );

  const booksBySubject = computed(() => (subject?: string) => {
    if (!subject) return books.value;
    return books.value.filter((b) => b.subjects?.includes(subject));
  });

  async function getAllBooks({ subject }: { subject?: string }) {
    books.value = [];
    try {
      const response = await getBooksBySubject(subject);
      books.value = response.data;
    } catch (error) {
      console.error("Failed to fetch books", error);
    }
  }

  async function getHomeBooks() {
    try {
      const response = await getHomeBooksApi();
      books.value = response.data.all;
      homeSubjects.value = response.data.subjects;
    } catch (error) {
      console.error("Failed to fetch home books", error);
    }
  }

  async function getFictionBooks({ subject }: { subject: string }) {
    books.value = [];
    try {
      const response = await getBooksBySubject(subject);
      fictionBooks.value = response.data;
    } catch (error) {
      console.error("Failed to fetch books", error);
    }
  }

  async function getMangaBooks({ subject }: { subject: string }) {
    books.value = [];
    try {
      const response = await getBooksBySubject(subject);
      mangaBooks.value = response.data;
    } catch (error) {
      console.error("Failed to fetch books", error);
    }
  }

  async function getRomanceBooks({ subject }: { subject: string }) {
    books.value = [];
    try {
      const response = await getBooksBySubject(subject);
      romanceBooks.value = response.data;
    } catch (error) {
      console.error("Failed to fetch books", error);
    }
  }

  async function deleteBookById({ id }: { id: string }) {
    try {
      await deleteBookByIdApi(id);
      books.value = books.value.filter((book) => book._id !== id);
    } catch (error) {
      console.error("Failed to delete book", error);
      throw error;
    }
  }

  async function createBook(bookData: Partial<Book>) {
    loading.value = true;
    try {
      const response = await createBookApi(bookData);
      books.value.unshift(response.data);
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
      const index = books.value.findIndex(
        (book) => book._id === response.data._id
      );
      if (index !== -1) {
        books.value.splice(index, 1, response.data);
      }
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
    homeSubjects,
    fictionBooks,
    mangaBooks,
    romanceBooks,
    loading,
    getTitleBooks,
    booksBySubject,
    getAllBooks,
    getHomeBooks,
    getFictionBooks,
    getMangaBooks,
    getRomanceBooks,
    deleteBookById,
    createBook,
    updateBook,
  };
});
