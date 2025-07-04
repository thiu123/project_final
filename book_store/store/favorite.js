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
        const response = await getFavoritesForEachUser();
        commit("setFavorites", response.data);
      } catch (error) {
        console.error("Failed to fetch favorites for user", error);
      }
    },
  },
};
