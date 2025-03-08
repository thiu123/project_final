import axios from "axios";

export default {
  namespaced: true,
  state: () => ({
    books: [],
  }),
  mutations: {
    setBooks(state, books) {
      state.books = books;
    },
    clearBooks(state) {
      state.books = [];
    }
  },
  getters: {
    getTitleBooks(state) {
      return state.books.map((book) => ({
        title: book.title,
        cover_url: book.cover_url,
        price: book.price
      }))
    }
  },
  actions: {
    async getAllBooks({ commit }, subject) {
      commit("clearBooks");
      try {
        const response = await axios.get(`http://localhost:5000/api/books`, {
          params: { subject }
        });
        commit("setBooks", response.data);
      } catch (error) {
        console.error("Failed to fetch books", error);
      }
    },
  },
};