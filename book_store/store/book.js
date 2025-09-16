import {
  getBooksBySubject,
  deleteBookById,
  createBook,
  updateBook,
} from "@/api/bookApi";

export default {
  namespaced: true,
  state: () => ({
    books: [],
    fictionBooks: [],
    mangaBooks: [],
    romanceBooks: [],
    loading: false,
  }),
  mutations: {
    setBooks(state, books) {
      state.books = books;
    },
    setFictionBooks(state, books) {
      state.fictionBooks = books;
    },
    setMangaBooks(state, books) {
      state.mangaBooks = books;
    },
    setRomanceBooks(state, books) {
      state.romanceBooks = books;
    },
    clearBooks(state) {
      state.books = [];
    },
    removeBookById(state, id) {
      state.books = state.books.filter((book) => book._id !== id);
    },
    addBook(state, book) {
      state.books.unshift(book);
    },
    updateBookInList(state, updatedBook) {
      const index = state.books.findIndex(
        (book) => book._id === updatedBook._id
      );
      if (index !== -1) {
        state.books.splice(index, 1, updatedBook);
      }
    },
    setLoading(state, loading) {
      state.loading = loading;
    },
  },
  getters: {
    getTitleBooks(state) {
      return state.books.map((book) => ({
        title: book.title,
        cover_url: book.cover_url,
        price: book.price,
        first_publish_year: book.first_publish_year,
      }));
    },
  },
  actions: {
    async getAllBooks({ commit }, { subject, half = false }) {
      commit("clearBooks");
      try {
        const response = await getBooksBySubject(subject, half);
        commit("setBooks", response.data);
      } catch (error) {
        console.error("Failed to fetch books", error);
      }
    },
    async getFictionBooks({ commit }, { subject, half = false }) {
      commit("clearBooks");
      try {
        const response = await getBooksBySubject(subject, half);
        commit("setFictionBooks", response.data);
      } catch (error) {
        console.error("Failed to fetch books", error);
      }
    },
    async getMangaBooks({ commit }, { subject, half = false }) {
      commit("clearBooks");
      try {
        const response = await getBooksBySubject(subject, half);
        commit("setMangaBooks", response.data);
      } catch (error) {
        console.error("Failed to fetch books", error);
      }
    },
    async getRomanceBooks({ commit }, { subject, half = false }) {
      commit("clearBooks");
      try {
        const response = await getBooksBySubject(subject, half);
        commit("setRomanceBooks", response.data);
      } catch (error) {
        console.error("Failed to fetch books", error);
      }
    },
    async deleteBookById({ commit }, { id }) {
      try {
        await deleteBookById(id);
        commit("removeBookById", id);
      } catch (error) {
        console.error("Failed to delete book", error);
        throw error;
      }
    },
    async createBook({ commit }, bookData) {
      commit("setLoading", true);
      try {
        const response = await createBook(bookData);
        commit("addBook", response.data);
        return response.data;
      } catch (error) {
        console.error("Failed to create book", error);
        throw error;
      } finally {
        commit("setLoading", false);
      }
    },
    async updateBook({ commit }, { id, bookData }) {
      commit("setLoading", true);
      try {
        const response = await updateBook(id, bookData);
        commit("updateBookInList", response.data);
        return response.data;
      } catch (error) {
        console.error("Failed to update book", error);
        throw error;
      } finally {
        commit("setLoading", false);
      }
    },
  },
};
