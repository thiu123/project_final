<template>
  <!-- Header -->
  <div>
    <!-- Hero Section -->
    <HomeHeroSection :book="books[0]" @add-to-cart="handleAddToCart" />

    <!-- Search Section -->
    <div class="container mx-auto px-4 py-16">
      <div class="mx-auto w-full lg:max-w-5xl xl:max-w-4xl">
        <div
          class="rounded-2xl border border-border bg-gradient-to-br from-card to-muted/60 p-8 shadow-2xl"
        >
          <!-- Search Header -->
          <div class="mb-8 text-center">
            <div class="mb-4 flex justify-center">
              <div
                class="flex h-16 w-16 items-center justify-center rounded-full bg-customyellow shadow-md"
              >
                <Search class="h-8 w-8 text-darkgreen" />
              </div>
            </div>
            <h2 class="mb-3 text-3xl font-bold text-foreground md:text-4xl">
              Discover Your Next Great Read
            </h2>
            <p class="text-lg text-muted-foreground">
              Search through thousands of books to find your perfect match
            </p>
          </div>

          <!-- Search Bar -->
          <div class="mb-6 grid grid-cols-12 gap-4">
            <div class="col-span-12 md:col-span-10">
              <UiInput
                v-model="searchQuery"
                placeholder="Search for books, authors, or genres..."
                class="h-12 rounded-xl"
                @focus="showSearchResults = true"
                @input="handleSearchInput"
              >
                <template #prepend>
                  <Search class="h-5 w-5" />
                </template>
                <template #append>
                  <UiButton
                    variant="ghost"
                    size="iconSm"
                    class="text-primary"
                    aria-label="Voice search"
                  >
                    <Mic class="h-4 w-4" />
                  </UiButton>
                </template>
              </UiInput>
            </div>
            <div class="col-span-12 md:col-span-2">
              <UiButton
                block
                size="lg"
                class="h-12 rounded-xl font-bold shadow-md"
                @click="performSearch"
              >
                Search
              </UiButton>
            </div>
          </div>

          <!-- Search Results -->
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="-translate-y-2 opacity-0"
            enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="translate-y-0 opacity-100"
            leave-to-class="-translate-y-2 opacity-0"
          >
            <div
              v-if="searchQuery && searchResults.length > 0"
              class="mb-6 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
            >
              <ul class="max-h-[400px] divide-y divide-border overflow-y-auto">
                <li
                  v-for="(book, index) in searchResults"
                  :key="index"
                  class="flex cursor-pointer items-center gap-4 px-4 py-3 transition-colors hover:bg-muted"
                  @click="router.push(`/details/${book._id}`)"
                >
                  <img
                    :src="book?.cover_url"
                    :alt="book.title"
                    class="h-[60px] w-[60px] shrink-0 rounded-lg bg-muted object-cover"
                  />

                  <div class="min-w-0 flex-1">
                    <div class="mb-1 truncate font-bold text-foreground">
                      {{ book.title }}
                    </div>
                    <div class="truncate text-sm text-muted-foreground">
                      {{ book.authors?.join(", ") || "Unknown Author" }} •
                      {{ book.first_publish_year }}
                    </div>
                  </div>

                  <div class="flex shrink-0 items-center">
                    <Star
                      class="mr-1 h-4 w-4 fill-amber-400 text-amber-400"
                    />
                    <span class="text-xs text-foreground">{{
                      book.rating || "4.5"
                    }}</span>
                  </div>
                </li>
              </ul>
            </div>
          </Transition>

          <!-- Featured Books -->
          <div class="text-center">
            <h3 class="mb-6 text-2xl font-semibold text-foreground">
              Trending This Week
            </h3>

            <div class="flex flex-wrap justify-center gap-4">
              <template v-if="books && books.length">
                <div
                  v-for="(book, i) in books.slice(0, 3)"
                  :key="i"
                  class="cursor-pointer overflow-hidden rounded-lg bg-muted shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  @click="router.push(`details/${book._id}`)"
                >
                  <img
                    v-if="book?.cover_url"
                    :src="book?.cover_url"
                    :alt="book.title"
                    class="h-[110px] w-20 object-cover"
                  />
                  <div
                    v-else
                    class="flex h-[110px] w-20 items-center justify-center"
                  >
                    <UiSpinner class="text-primary" />
                  </div>
                </div>
              </template>
              <template v-else>
                <UiSkeleton
                  v-for="n in 6"
                  :key="n"
                  class="h-[110px] w-20 rounded-xl shadow-md"
                />
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dynamic Book Components -->
    <component
      v-for="(bookComponent, index) in bookComponents"
      :key="index"
      :is="bookComponent"
      :toggle-favorites="toggleFavorites"
      :favorites="favorites"
      @add-to-cart="handleAddToCart"
      @show-snackbar="handleSnackbarEvent"
    ></component>

    <!-- Why Shop With Us -->
    <HomeWhyShopSection :books="books" />

    <SnackbarAlert
      v-model="showSnackbar"
      :text="snackbarText"
      :color="snackbarColor"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { useBookStore } from "@/stores/book";
import { useCartStore } from "@/stores/cart";
import { useFavoriteStore } from "@/stores/favorite";
import debounce from "lodash/debounce";
import { Mic, Search, Star } from "lucide-vue-next";
import { searchBooksByTitle } from "@/api/bookApi";
import type { Book, User } from "@/types";
import HomeCategoryShowcase from "~/components/home/CategoryShowcase.vue";
import BestSellerTabs from "~/components/home/BestSellerTabs.vue";
import BookManga from "~/components/home/BookManga.vue";
import BookFiction from "~/components/home/BookFiction.vue";
import BookRomance from "~/components/home/BookRomance.vue";
import BestSellingBooks from "~/components/home/BestSellingBooks.vue";

const router = useRouter();

const bookStore = useBookStore();
const { books } = storeToRefs(bookStore);

const favoriteStore = useFavoriteStore();
const { favorites } = storeToRefs(favoriteStore);
const { toggleFavorites, getFavoritesForEachUser } = favoriteStore;

const cartStore = useCartStore();
const authStore = useAuthStore();

// Rendered in order, exactly as the original page listed them
const bookComponents = [
  BestSellingBooks,
  BestSellerTabs,
  HomeCategoryShowcase,
  BookFiction,
  BookManga,
  BookRomance,
];

const searchQuery = ref("");
const searchResults = ref<Book[]>([]);
const showSearchResults = ref(false);
const showSnackbar = ref(false);
const snackbarText = ref("");
const snackbarColor = ref("success");

watch(
  searchQuery,
  debounce(async (newQuery: string) => {
    if (!newQuery.trim()) {
      searchResults.value = [];
      return;
    }

    try {
      const response = await searchBooksByTitle(newQuery);

      searchResults.value = response.data || [];
    } catch (error) {
      console.error("Error when searching", error);
    }
  }, 300)
);

onMounted(async () => {
  // Xử lý Google Auth callback
  await handleGoogleAuthCallback();
  // Favorites are loaded by BaseNavigation in the default layout, which needs
  // them for its badge on every page — fetching again here would duplicate it.
  await bookStore.getHomeBooks();
});

async function handleGoogleAuthCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const googleAuth = urlParams.get("googleAuth");
  const token = urlParams.get("token");
  const userStr = urlParams.get("user");

  if (googleAuth === "success" && token && userStr) {
    try {
      const user = JSON.parse(decodeURIComponent(userStr)) as User;

      // Save to localStorage and the auth store
      localStorage.setItem("accessToken", token);
      localStorage.setItem("currentUser", JSON.stringify(user));

      authStore.loginSuccess({
        ...user,
        accessToken: token,
      });

      // Signing in swaps the account, so both lists belong to someone new.
      await Promise.all([
        cartStore.fetchCart(),
        getFavoritesForEachUser({ force: true }),
      ]);

      // Show success message
      snackbarText.value = `Welcome back, ${user.username}!`;
      snackbarColor.value = "success";
      showSnackbar.value = true;

      // Remove URL params
      const url = new URL(window.location.href);
      url.searchParams.delete("googleAuth");
      url.searchParams.delete("token");
      url.searchParams.delete("user");
      window.history.replaceState({}, document.title, url.pathname);
    } catch (error) {
      console.error("Google auth callback error:", error);
      snackbarText.value = "Login failed. Please try again.";
      snackbarColor.value = "error";
      showSnackbar.value = true;
    }
  }
}

async function handleAddToCart(bookId: string, quantity: number) {
  try {
    await cartStore.addToCart({
      bookId,
      quantity,
      productType: "hardbook",
    });
    snackbarText.value = "Add to cart successfully!";
    showSnackbar.value = true;
    snackbarColor.value = "success";
  } catch (error) {
    console.error("Error adding to cart:", error);
    snackbarText.value = "Failed to add to cart.";
    showSnackbar.value = true;
    snackbarColor.value = "error";
  }
}

function performSearch() {
  // Trigger search functionality
  console.log("Performing search for:", searchQuery.value);
}

function handleSearchInput() {
  // Handle search input changes
}

function handleSnackbarEvent(data: { text: string; color: string }) {
  snackbarText.value = data.text;
  snackbarColor.value = data.color;
  showSnackbar.value = true;
}
</script>
