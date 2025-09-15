import { getBooksBySubject } from "@/api/bookApi";

export default {
  namespaced: true,
  state: () => ({
    books: [],
    fictionBooks: [],
    mangaBooks: [],
    romanceBooks: [],
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
  },
};
