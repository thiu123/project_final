<template>
  <div>
    <HomeHeroSection :books="books" @add-to-cart="handleAddToCart" />
    <HomeServiceStrip />

    <HomeTopTen />
    <HomeCategoryShowcase />
    <HomeBookSearchPanel :trending-books="books" />

    <HomeBestSellingBooks @add-to-cart="handleAddToCart" />

    <BookCarouselSection
      :carousel="firstCarousel"
      @add-to-cart="handleAddToCart"
    />

    <HomeEbookPromo :books="promoBooks" />

    <HomeBestSellerTabs @show-snackbar="notifyFromPayload" />

    <BookCarouselSection
      v-for="carousel in otherCarousels"
      :key="carousel.subject"
      :carousel="carousel"
      @add-to-cart="handleAddToCart"
    />

    <HomeClosingCta :books="books" />

    <SnackbarAlert
      v-model="snackbar.show"
      :text="snackbar.message"
      :color="snackbar.color"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { useBookStore } from "@/stores/book";
import { useCartStore } from "@/stores/cart";
import { useFavoriteStore } from "@/stores/favorite";
import { useSnackbar } from "@/composables/useSnackbar";
import { HOME_CAROUSELS } from "@/constants/homeCarousels";
import type { User } from "@/types";

const bookStore = useBookStore();
const { books, homeSubjects } = storeToRefs(bookStore);

const [firstCarousel, ...otherCarousels] = HOME_CAROUSELS;

const promoBooks = computed(() => {
  const seen = new Set<string>();
  return Object.values(homeSubjects.value)
    .flatMap((group) => group.slice(0, 3))
    .filter((book) => !seen.has(book._id) && seen.add(book._id));
});

const favoriteStore = useFavoriteStore();
const cartStore = useCartStore();
const authStore = useAuthStore();

const { snackbar, notify, notifyError, notifyFromPayload } = useSnackbar();

onMounted(async () => {
  await handleGoogleAuthCallback();
  // Favorites are loaded by BaseNavigation in the default layout, which needs
  // them for its badge on every page — fetching again here would duplicate it.
  await bookStore.getHomeBooks();
});

/**
 * Google sign-in happens on the backend, which redirects back here with the
 * session on the query string.
 */
async function handleGoogleAuthCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("googleAuth") !== "success") return;

  const token = urlParams.get("token");
  const userStr = urlParams.get("user");
  if (!token || !userStr) return;

  try {
    const user = JSON.parse(decodeURIComponent(userStr)) as User;

    authStore.loginSuccess({ ...user, accessToken: token });

    // Signing in swaps the account, so both lists belong to someone new.
    await Promise.all([
      cartStore.fetchCart(),
      favoriteStore.getFavoritesForEachUser({ force: true }),
    ]);

    notify(`Welcome back, ${user.username}!`);
  } catch (error) {
    console.error("Google auth callback error:", error);
    notifyError("Login failed. Please try again.");
  } finally {
    // Drop the credentials from the address bar either way.
    const url = new URL(window.location.href);
    for (const key of ["googleAuth", "token", "user"]) {
      url.searchParams.delete(key);
    }
    window.history.replaceState({}, document.title, url.pathname);
  }
}

async function handleAddToCart(bookId: string, quantity: number) {
  try {
    await cartStore.addToCart({ bookId, quantity, productType: "hardbook" });
    notify("Add to cart successfully!");
  } catch (error) {
    console.error("Error adding to cart:", error);
    notifyError("Failed to add to cart.");
  }
}
</script>
