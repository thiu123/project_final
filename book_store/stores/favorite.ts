import { defineStore } from "pinia";
import { ref } from "vue";
import {
  toggleFavorites as toggleFavoritesApi,
  getFavoritesForEachUser as getFavoritesForEachUserApi,
} from "@/api/favoriteApi";
import type { Favorite } from "@/types";

export const useFavoriteStore = defineStore("favorite", () => {
  const favorites = ref<Favorite[]>([]);

  async function toggleFavorites(bookId: string) {
    try {
      const response = await toggleFavoritesApi(bookId);
      favorites.value = response.data;
    } catch (error) {
      console.error("Failed to toggle favorites", error);
    }
  }

  async function getFavoritesForEachUser() {
    try {
      // Check if user is logged in
      const token = import.meta.client
        ? localStorage.getItem("accessToken")
        : null;
      if (!token) {
        clearFavorites();
        return;
      }

      const response = await getFavoritesForEachUserApi();
      favorites.value = response.data || [];
    } catch (error) {
      console.error("Failed to fetch favorites for user", error);
      // Clear favorites on error (e.g., invalid token)
      clearFavorites();
    }
  }

  function clearFavorites() {
    favorites.value = [];
  }

  return {
    favorites,
    toggleFavorites,
    getFavoritesForEachUser,
    clearFavorites,
  };
});
