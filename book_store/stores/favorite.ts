import { defineStore } from "pinia";
import { ref } from "vue";
import {
  toggleFavorites as toggleFavoritesApi,
  getFavoritesForEachUser as getFavoritesForEachUserApi,
} from "@/api/favoriteApi";
import type { Favorite } from "@/types";

export const useFavoriteStore = defineStore("favorite", () => {
  const favorites = ref<Favorite[]>([]);
  /** True once a successful fetch has populated `favorites` for the signed-in user. */
  const loaded = ref(false);
  /** Shared by concurrent callers so simultaneous mounts issue one request. */
  let inFlight: Promise<void> | null = null;

  function readToken(): string | null {
    return import.meta.client ? localStorage.getItem("accessToken") : null;
  }

  async function toggleFavorites(bookId: string) {
    try {
      const response = await toggleFavoritesApi(bookId);
      // The endpoint returns the user's full list, so the cache stays accurate.
      favorites.value = response.data;
      loaded.value = true;
    } catch (error) {
      console.error("Failed to toggle favorites", error);
    }
  }

  async function request(): Promise<void> {
    try {
      const response = await getFavoritesForEachUserApi();
      favorites.value = response.data || [];
      loaded.value = true;
    } catch (error) {
      console.error("Failed to fetch favorites for user", error);
      // Clear on error (e.g. an invalid token) so a later attempt retries.
      clearFavorites();
    }
  }

  async function getFavoritesForEachUser(options: { force?: boolean } = {}) {
    if (!readToken()) {
      clearFavorites();
      return;
    }

    if (inFlight) return inFlight;
    if (loaded.value && !options.force) return;

    inFlight = request().finally(() => {
      inFlight = null;
    });
    return inFlight;
  }

  function clearFavorites() {
    favorites.value = [];
    loaded.value = false;
  }

  return {
    favorites,
    loaded,
    toggleFavorites,
    getFavoritesForEachUser,
    clearFavorites,
  };
});
