<template>
  <!-- Header -->
  <div>
    <!-- Hero Section -->
    <HomeHeroSection :book="books[0]" @add-to-cart="handleAddToCart" />
    <!-- Search Section -->
    <v-container class="search-section py-16">
      <v-row justify="center">
        <v-col cols="12" lg="10" xl="8">
          <v-card class="search-card pa-8" elevation="24" rounded="xl">
            <!-- Search Header -->
            <div class="text-center mb-8">
              <div class="d-flex justify-center mb-4">
                <v-avatar color="customyellow" size="64" class="mr-4">
                  <v-icon color="darkgreen" size="32">mdi-magnify</v-icon>
                </v-avatar>
              </div>
              <h2 class="text-h3 font-weight-bold text-customblack mb-3">
                Discover Your Next Great Read
              </h2>
              <p class="text-h6 text-medium-emphasis">
                Search through thousands of books to find your perfect match
              </p>
            </div>

            <!-- Search Bar -->
            <v-row class="mb-6">
              <v-col cols="12" md="10">
                <v-text-field
                  v-model="searchQuery"
                  variant="outlined"
                  label="Search for books, authors, or genres..."
                  prepend-inner-icon="mdi-magnify"
                  class="search-input"
                  hide-details
                  @focus="showSearchResults = true"
                  @input="handleSearchInput"
                  rounded="xl"
                >
                  <template v-slot:append-inner>
                    <v-btn
                      icon="mdi-microphone"
                      variant="text"
                      size="small"
                      color="waterblue"
                    ></v-btn>
                  </template>
                </v-text-field>
              </v-col>
              <v-col cols="12" md="2">
                <v-btn
                  block
                  size="large"
                  color="waterblue"
                  variant="elevated"
                  class="search-btn font-weight-bold"
                  rounded="xl"
                  @click="performSearch"
                >
                  Search
                </v-btn>
              </v-col>
            </v-row>

            <!-- Search Results -->
            <v-expand-transition>
              <v-card
                v-if="searchQuery && searchResults.length > 0"
                class="search-results mb-6"
                variant="outlined"
                rounded="xl"
                elevation="8"
              >
                <v-list
                  class="py-0"
                  style="max-height: 400px; overflow-y: auto"
                >
                  <v-list-item
                    v-for="(book, index) in searchResults"
                    :key="index"
                    class="search-result-item"
                    @click="$router.push(`/details/${book._id}`)"
                  >
                    <template v-slot:prepend>
                      <v-avatar size="60" rounded="lg" class="me-4">
                        <v-img
                          :src="book?.cover_url"
                          :alt="book.title"
                          cover
                        ></v-img>
                      </v-avatar>
                    </template>

                    <v-list-item-title
                      class="font-weight-bold mb-1 text-customblack"
                    >
                      {{ book.title }}
                    </v-list-item-title>

                    <v-list-item-subtitle class="mb-2">
                      {{ book.authors?.join(", ") || "Unknown Author" }} •
                      {{ book.first_publish_year }}
                    </v-list-item-subtitle>

                    <template v-slot:append>
                      <div class="d-flex align-center">
                        <v-icon color="amber" size="small" class="me-1"
                          >mdi-star</v-icon
                        >
                        <span class="text-caption">{{
                          book.rating || "4.5"
                        }}</span>
                      </div>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-expand-transition>

            <!-- Featured Books -->
            <div class="text-center">
              <h3 class="text-h5 font-weight-bold mb-6 text-customblack">
                Trending This Week
              </h3>

              <div class="d-flex justify-center flex-wrap ga-4">
                <template v-if="books && books.length">
                  <v-card
                    v-for="(book, i) in books.slice(0, 3)"
                    :key="i"
                    hover
                    class="trending-book-card"
                    @click="$router.push(`details/${book._id}`)"
                  >
                    <v-img
                      v-if="book?.cover_url"
                      :src="book?.cover_url"
                      width="80"
                      height="110"
                      cover
                      class=""
                    >
                      <template v-slot:placeholder>
                        <div
                          class="d-flex align-center justify-center fill-height"
                        >
                          <v-progress-circular
                            color="waterblue"
                            indeterminate
                          ></v-progress-circular>
                        </div>
                      </template>
                    </v-img>
                  </v-card>
                </template>
                <template v-else>
                  <v-card
                    v-for="n in 6"
                    :key="n"
                    elevation="4"
                    rounded="xl"
                    width="80"
                    height="110"
                  >
                    <v-skeleton-loader
                      type="image"
                      height="100%"
                    ></v-skeleton-loader>
                  </v-card>
                </template>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Dynamic Book Components -->
    <component
      v-for="(bookComponent, index) in bookComponents"
      :key="index"
      :is="bookComponent"
      :toggle-favorites="toggleFavorites"
      :favorites="favorites"
      @add-to-cart="handleAddToCart"
    ></component>

    <!-- Enhanced Newsletter Section -->
    <v-container class="my-12">
      <v-row justify="center">
        <v-col cols="12" lg="8">
          <v-card class="newsletter-card pa-8 rounded-xl" elevation="12">
            <div class="text-center">
              <v-avatar color="customyellow" size="80" class="mb-4">
                <v-icon color="darkgreen" size="40"
                  >mdi-email-newsletter</v-icon
                >
              </v-avatar>
              <h2 class="text-h3 font-weight-bold text-customblack mb-3">
                Stay Updated
              </h2>
              <p class="text-subtitle-1 text-medium-emphasis mb-6">
                Subscribe to our newsletter for the latest releases, exclusive
                offers, and reading recommendations.
              </p>

              <v-row justify="center">
                <v-col cols="12" md="8">
                  <div class="d-flex">
                    <v-text-field
                      v-model="newsletterEmail"
                      variant="outlined"
                      label="Enter your email address"
                      hide-details
                      class="mr-3"
                      rounded="xl"
                    ></v-text-field>
                    <v-btn
                      color="waterblue"
                      variant="elevated"
                      size="large"
                      rounded="xl"
                      class="font-weight-bold"
                      @click="subscribeNewsletter"
                    >
                      Subscribe
                    </v-btn>
                  </div>
                </v-col>
              </v-row>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Why Shop With Us -->
    <HomeWhyShopSection :books="books" />

    <SnackbarAlert
      v-model="showSnackbar"
      :text="snackbarText"
      :color="snackbarColor"
    />
  </div>
</template>

<script>
import HomeCategoryShowcase from "~/components/home/CategoryShowcase.vue";
import BestSellerTabs from "~/components/home/BestSellerTabs.vue";
import BookManga from "../components/home/BookManga.vue";
import BookFiction from "../components/home/BookFiction.vue";
import BookRomance from "../components/home/BookRomance.vue";
import BestSellingBooks from "../components/home/BestSellingBooks.vue";
import { mapState, mapActions, mapGetters } from "vuex";
import { searchBooksByTitle } from "@/api/bookApi";
import debounce from "lodash/debounce";
import SnackbarAlert from "../components/SnackbarAlert.vue";

export default {
  name: "Home",
  components: {
    HomeCategoryShowcase,
    BestSellerTabs,
    BookFiction,
    BookManga,
    BookRomance,
    BestSellingBooks,
    SnackbarAlert,
  },
  data() {
    return {
      bookComponents: [
        "BestSellingBooks",
        "BestSellerTabs",
        "HomeCategoryShowcase",
        "BookFiction",
        "BookManga",
        "BookRomance",
      ],
      newsletterEmail: "",
      searchQuery: "",
      searchResults: [],
      showSnackbar: false,
      snackbarText: "",
      snackbarColor: "success",
    };
  },
  watch: {
    searchQuery: debounce(async function (newQuery) {
      if (!newQuery.trim()) {
        this.searchResults = [];
        return;
      }

      try {
        const response = await searchBooksByTitle(newQuery);

        this.searchResults = response.data || [];

        // console.log("Search Results:", this.searchResults);
      } catch (error) {
        console.error("Error when searching", error);
      }
    }, 300),
  },
  computed: {
    ...mapGetters("book", ["getTitleBooks"]),
    ...mapState("book", ["books"]),
    ...mapState("favorite", ["favorites"]),
  },
  async mounted() {
    // Xử lý Google Auth callback
    await this.handleGoogleAuthCallback();
    await this.getFavoritesForEachUser();
    // Fetch all books
    await this.getAllBooks({ subject: null });
  },
  methods: {
    ...mapActions("book", ["getAllBooks"]),
    ...mapActions("cart", ["addToCart", "fetchCart"]),
    ...mapActions("favorite", ["toggleFavorites", "getFavoritesForEachUser"]),

    async handleGoogleAuthCallback() {
      const urlParams = new URLSearchParams(window.location.search);
      const googleAuth = urlParams.get("googleAuth");
      const token = urlParams.get("token");
      const userStr = urlParams.get("user");

      if (googleAuth === "success" && token && userStr) {
        try {
          const user = JSON.parse(decodeURIComponent(userStr));

          // Save to localStorage and Vuex
          localStorage.setItem("accessToken", token);
          localStorage.setItem("currentUser", JSON.stringify(user));

          this.$store.commit("auth/loginSuccess", {
            ...user,
            accessToken: token,
          });

          // Fetch cart
          await this.fetchCart();

          // Show success message
          this.snackbarText = `Welcome back, ${user.username}!`;
          this.snackbarColor = "success";
          this.showSnackbar = true;

          // Remove URL params
          const url = new URL(window.location);
          url.searchParams.delete("googleAuth");
          url.searchParams.delete("token");
          url.searchParams.delete("user");
          window.history.replaceState({}, document.title, url.pathname);
        } catch (error) {
          console.error("Google auth callback error:", error);
          this.snackbarText = "Login failed. Please try again.";
          this.snackbarColor = "error";
          this.showSnackbar = true;
        }
      }
    },

    async handleAddToCart(bookId, quantity) {
      try {
        await this.addToCart({
          bookId,
          quantity,
        });
        this.snackbarText = "Add to cart successfully!";
        this.showSnackbar = true;
        this.snackbarColor = "success";
      } catch (error) {
        console.error("Error adding to cart:", error);
        this.snackbarText = "Failed to add to cart.";
        this.showSnackbar = true;
        this.snackbarColor = "error";
      }
    },

    async handleToggleFavorites(bookId) {
      try {
        await this.toggleFavorites(bookId);
      } catch (error) {
        console.error("Error toggling favorites:", error);
      }
    },

    isFavorite(bookId) {
      return this.favorites.some((favorite) => {
        const favoriteBookId = favorite.bookId?._id || favorite.bookId;
        return favoriteBookId === bookId;
      });
    },

    subscribeNewsletter() {
      if (this.newsletterEmail) {
        this.snackbarText = "Thank you for subscribing to our newsletter!";
        this.showSnackbar = true;
        this.snackbarColor = "success";
        this.newsletterEmail = "";
      }
    },

    performSearch() {
      // Trigger search functionality
      console.log("Performing search for:", this.searchQuery);
    },

    handleSearchInput() {
      // Handle search input changes
    },

    getPlaceholderImage(width, height) {
      return `https://via.placeholder.com/${width}x${height}`;
    },

    handleSnackbarEvent(data) {
      this.snackbarText = data.text;
      this.snackbarColor = data.color;
      this.showSnackbar = true;
    },
  },
};
</script>

<style scoped>
.position-relative {
  position: relative;
}

.position-absolute {
  position: absolute;
}

.search-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 1px solid #dee2e6;
}

.search-input {
  border-radius: 12px;
}

.search-btn {
  border-radius: 12px;
}

.search-results {
  border: 1px solid #e9ecef;
}

.search-result-item {
  transition: background-color 0.2s ease;
}

.search-result-item:hover {
  background-color: #f8f9fa;
}

.newsletter-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 1px solid #dee2e6;
}
</style>
