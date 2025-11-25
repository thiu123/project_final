import { toggleFavorites, getFavoritesForEachUser } from "~/api/favoriteApi";

export default {
  namespaced: true,
  state: () => {
    return {
      favorites: [],
    };
  },
  mutations: {
    setFavorites(state, favorites) {
      state.favorites = favorites;
    },
    clearFavorites(state) {
      state.favorites = [];
    },
  },
  actions: {
    async toggleFavorites({ commit }, bookId) {
      try {
        const response = await toggleFavorites(bookId);
        commit("setFavorites", response.data);
      } catch (error) {
        console.error("Failed to toggle favorites", error);
      }
    },
    async getFavoritesForEachUser({ commit }) {
      try {
        // Check if user is logged in
        const token = localStorage.getItem("accessToken");
        if (!token) {
          // Clear favorites if no token
          commit("clearFavorites");
          return;
        }

        const response = await getFavoritesForEachUser();
        commit("setFavorites", response.data || []);
      } catch (error) {
        console.error("Failed to fetch favorites for user", error);
        // Clear favorites on error (e.g., invalid token)
        commit("clearFavorites");
      }
    },
    clearFavorites({ commit }) {
      commit("clearFavorites");
    },
  },
};
