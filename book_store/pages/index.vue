<template>
  <!-- Header -->
  <div>
    <!-- Hero Section -->
    <HomeHeroSection :book="books[0]" :handleAddToCart="handleAddToCart" />
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
                <v-list class="py-0">
                  <v-list-item
                    v-for="(book, index) in searchResults.slice(0, 5)"
                    :key="index"
                    class="search-result-item"
                    @click="$router.push(`/details/${book._id}`)"
                  >
                    <template v-slot:prepend>
                      <v-avatar size="60" rounded="lg" class="me-4">
                        <v-img
                          :src="book.cover_url"
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
                <template v-if="books.length">
                  <v-card
                    v-for="(book, i) in books.slice(50, 56)"
                    :key="i"
                    elevation="4"
                    rounded="xl"
                    hover
                    class="trending-book-card"
                    @click="$router.push(`details/${book._id}`)"
                  >
                    <v-img
                      v-if="book.cover_url"
                      :src="book.cover_url"
                      width="80"
                      height="110"
                      cover
                      class="rounded-xl"
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

    <!-- Best Selling Books -->
    <v-container class="mt-8">
      <v-card
        elevation="12"
        class="pa-8 rounded-xl best-sellers-card"
        style="background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)"
      >
        <!-- Enhanced Header -->
        <div class="d-flex justify-space-between align-center mb-8">
          <div class="d-flex align-center">
            <v-avatar color="customyellow" size="56" class="mr-4">
              <v-icon color="darkgreen" size="32">mdi-trophy</v-icon>
            </v-avatar>
            <div>
              <h2 class="text-h3 text-customblack font-weight-bold mb-2">
                Best Selling Books
              </h2>
              <p class="text-subtitle-1 text-medium-emphasis ma-0">
                Discover our most popular titles across all categories
              </p>
            </div>
          </div>

          <v-btn
            color="waterblue"
            variant="outlined"
            rounded="xl"
            class="font-weight-bold"
            size="large"
          >
            <v-icon start size="small">mdi-eye</v-icon>
            View All
          </v-btn>
        </div>

        <v-row>
          <v-col cols="12">
            <!-- Enhanced Tabs Card -->
            <v-card elevation="8" class="rounded-xl overflow-hidden">
              <!-- Enhanced Tabs Navigation -->
              <v-tabs
                v-model="tab"
                color="waterblue"
                align-tabs="start"
                class="enhanced-tabs"
                bg-color="grey-lighten-5"
                slider-color="waterblue"
                height="72"
              >
                <v-tab
                  v-for="(subject, i) in bestSellerSubjects"
                  :key="i"
                  :value="subject"
                  class="text-capitalize font-weight-bold tab-item"
                  rounded="lg"
                >
                  {{ subject }}
                </v-tab>
              </v-tabs>

              <!-- Enhanced Tabs Content -->
              <v-tabs-window class="pa-6" v-model="tab">
                <v-tabs-window-item
                  v-for="subject in bestSellerSubjects"
                  :key="subject"
                  :value="subject"
                  class="tab-content"
                >
                  <v-row>
                    <v-col
                      v-for="(book, i) in bestSellersStories.slice(0, 8)"
                      :key="i"
                      cols="12"
                      sm="6"
                      md="3"
                    >
                      <!-- Enhanced Book Card -->
                      <v-card
                        class="book-card h-100 rounded-xl position-relative cursor-pointer"
                        @click="$router.push(`/details/${book._id}`)"
                        elevation="4"
                        hover
                      >
                        <!-- Bestseller Badge -->
                        <v-chip
                          color="red"
                          size="small"
                          class="bestseller-badge"
                          variant="elevated"
                        >
                          <v-icon start size="x-small">mdi-fire</v-icon>
                          #{{ i + 1 }}
                        </v-chip>

                        <!-- Enhanced Book Cover -->
                        <div class="position-relative book-cover-container">
                          <v-img
                            :src="book?.cover_url"
                            height="300"
                            cover
                            class="book-cover"
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

                          <!-- Favorite Button -->
                          <!-- <v-btn
                            icon
                            variant="text"
                            class="position-absolute favorite-btn"
                            style="top: 12px; right: 12px"
                            size="small"
                            @click.stop="handleToggleFavorites(book._id)"
                          >
                            <v-icon
                              :color="
                                isFavorite(book._id) ? 'red' : 'grey-lighten-2'
                              "
                              size="24"
                            >
                              {{
                                isFavorite(book._id)
                                  ? "mdi-heart"
                                  : "mdi-heart-outline"
                              }}
                            </v-icon>
                          </v-btn> -->
                        </div>

                        <!-- Enhanced Card Content -->
                        <v-card-text class="pa-4 d-flex flex-column">
                          <!-- Rating Section -->
                          <div class="d-flex align-center mb-3">
                            <v-rating
                              :model-value="4.5"
                              color="amber"
                              density="compact"
                              size="small"
                              readonly
                              half-increments
                            ></v-rating>
                            <v-chip
                              size="x-small"
                              variant="text"
                              class="ml-2 text-caption"
                            >
                              (128)
                            </v-chip>
                          </div>

                          <!-- Book Title -->
                          <div
                            class="text-subtitle-1 text-truncate font-weight-bold mb-2 text-customblack"
                          >
                            {{ book.title }}
                          </div>

                          <!-- Author -->
                          <div
                            v-for="(author, index) in book.authors?.slice(0, 1)"
                            :key="index"
                            class="text-caption text-medium-emphasis mb-3"
                          >
                            <span class="text-truncate">{{ author }}</span>
                          </div>

                          <!-- Genre Tag -->
                          <v-chip
                            size="small"
                            variant="outlined"
                            color="waterblue"
                            class="mb-3 align-self-start text-capitalize"
                          >
                            {{ subject }}
                          </v-chip>

                          <v-spacer></v-spacer>

                          <!-- Price Section -->
                          <div
                            class="d-flex justify-space-between align-center mb-3"
                          >
                            <div class="d-flex align-center">
                              <span
                                class="text-h6 font-weight-bold text-customblack"
                              >
                                ${{ book.price || "19.99" }}
                              </span>
                              <span
                                class="text-caption text-grey text-decoration-line-through ml-2"
                              >
                                ${{ (book.price * 1.25 || 24.99).toFixed(2) }}
                              </span>
                            </div>

                            <v-chip
                              color="red-lighten-4"
                              text-color="red-darken-2"
                              size="x-small"
                              variant="flat"
                            >
                              -20%
                            </v-chip>
                          </div>
                        </v-card-text>

                        <!-- Enhanced Card Actions -->
                        <v-card-actions class="pa-4 pt-0">
                          <v-btn
                            block
                            color="waterblue"
                            variant="elevated"
                            size="large"
                            class="font-weight-bold rounded-xl add-to-cart-btn"
                            elevation="2"
                            @click.stop="handleAddToCart(book._id, 1)"
                          >
                            <v-icon start size="small">mdi-cart-plus</v-icon>
                            Add to Cart
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-col>
                  </v-row>

                  <!-- Load More Section -->
                  <div class="text-center mt-8">
                    <v-btn
                      color="waterblue"
                      variant="outlined"
                      size="large"
                      rounded="xl"
                      class="font-weight-bold"
                    >
                      <v-icon start>mdi-plus</v-icon>
                      Load More Books
                    </v-btn>
                  </div>
                </v-tabs-window-item>
              </v-tabs-window>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </v-container>

    <!-- New Categories Showcase Section -->
    <v-container class="mt-8">
      <v-card
        elevation="12"
        class="pa-8 rounded-xl categories-card"
        style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)"
      >
        <div class="text-center mb-8">
          <h2 class="text-h3 font-weight-bold text-customblack mb-3">
            Explore by Category
          </h2>
          <p class="text-subtitle-1 text-medium-emphasis">
            Find your perfect book in our carefully curated categories
          </p>
        </div>

        <v-row>
          <v-col
            v-for="(category, index) in categories"
            :key="index"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <v-card
              class="category-card h-100 rounded-xl cursor-pointer"
              @click="$router.push(`/subjects/${category.route}`)"
              elevation="4"
              hover
            >
              <v-img
                :src="category.image"
                height="200"
                cover
                class="category-image"
              >
                <div
                  class="category-overlay d-flex align-center justify-center"
                >
                  <div class="text-center">
                    <v-icon size="48" color="white" class="mb-3">{{
                      category.icon
                    }}</v-icon>
                    <h3 class="text-h5 font-weight-bold text-white">
                      {{ category.name }}
                    </h3>
                    <p class="text-white text-caption">
                      {{ category.count }} books
                    </p>
                  </div>
                </div>
              </v-img>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
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
import BookManga from "../components/home/BookManga.vue";
import BookFiction from "../components/home/BookFiction.vue";
import BookRomance from "../components/home/BookRomance.vue";
import { mapState, mapActions, mapGetters } from "vuex";
import { searchBooksByTitle } from "@/api/bookApi";
import debounce from "lodash/debounce";
import SnackbarAlert from "../components/SnackbarAlert.vue";

export default {
  name: "Home",
  components: {
    BookFiction,
    BookManga,
    BookRomance,
    SnackbarAlert,
  },
  data() {
    return {
      tab: "historical fiction",
      bookComponents: ["BookFiction", "BookManga", "BookRomance"],
      bestSellerSubjects: ["historical fiction", "ancient history", "cooking"],
      newsletterEmail: "",
      categories: [
        {
          name: "Literary Fiction",
          route: "literary fiction",
          icon: "mdi-book-open-page-variant",
          image:
            "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=200&fit=crop",
          count: "2,500+",
        },
        {
          name: "Romance",
          route: "romance",
          icon: "mdi-heart",
          image:
            "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=200&fit=crop",
          count: "1,800+",
        },
        {
          name: "Manga",
          route: "manga",
          icon: "mdi-comic-speech-bubble",
          image:
            "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
          count: "3,200+",
        },
        {
          name: "History",
          route: "history",
          icon: "mdi-castle",
          image:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop",
          count: "1,500+",
        },
      ],
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
    tab(newVal) {
      console.log("New Tab Value:", newVal);
    },
  },
  computed: {
    ...mapGetters("book", ["getTitleBooks"]),
    ...mapState("book", ["books"]),
    ...mapState("favorite", ["favorites"]),
    bestSellersStories() {
      if (!this.books?.length) {
        return [];
      }

      return this.books.filter((book) => {
        // Skip books without subjects
        if (!book.subjects) return false;

        // Convert book subjects to array if it's not already
        const bookSubjects = Array.isArray(book.subjects)
          ? book.subjects
          : [book.subjects];

        // Filter books that have the currently selected subject (tab)
        return bookSubjects.some(
          (subject) => subject.toLowerCase() === this.tab.toLowerCase()
        );
      });
    },
  },
  async mounted() {
    await this.getFavoritesForEachUser();
    await this.getAllBooks();
  },
  methods: {
    ...mapActions("book", ["getAllBooks"]),
    ...mapActions("cart", ["addToCart"]),
    ...mapActions("favorite", ["toggleFavorites", "getFavoritesForEachUser"]),
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

.trending-book-card {
  transition: transform 0.2s ease;
}

.trending-book-card:hover {
  transform: translateY(-4px);
}

.best-sellers-card {
  border: 1px solid #dee2e6;
}

.enhanced-tabs {
  border-bottom: 1px solid #e9ecef;
}

.tab-item {
  font-size: 1rem;
  padding: 16px 24px;
}

.book-card {
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
}

.book-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
}

.bestseller-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
}

.book-cover-container {
  overflow: hidden;
}

.book-cover {
  transition: transform 0.3s ease;
}

.book-card:hover .book-cover {
  transform: scale(1.05);
}

.add-to-cart-btn {
  transition: all 0.2s ease;
}

.add-to-cart-btn:hover {
  transform: translateY(-2px);
}

.categories-card {
  border: 1px solid #dee2e6;
}

.category-card {
  transition: all 0.3s ease;
  overflow: hidden;
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
}

.category-image {
  position: relative;
}

.category-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(82, 149, 208, 0.8) 0%,
    rgba(67, 80, 88, 0.8) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.category-card:hover .category-overlay {
  opacity: 1;
}

.newsletter-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 1px solid #dee2e6;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .tab-item {
    font-size: 0.875rem;
    padding: 12px 16px;
  }

  .book-card {
    margin-bottom: 16px;
  }
}
</style>
