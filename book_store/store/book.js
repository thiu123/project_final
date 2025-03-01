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
  },
  actions: {
    async getAllBooks({ commit }, user) {
      try {
        const respond = await axios.get("http://localhost:5000/api/books");
        commit("setBooks", respond.data);
      } catch {
        console.error("Failed to fetch books");
      }
    },
  },
};
