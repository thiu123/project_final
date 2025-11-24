<template>
  <v-container max-width="1500" class="py-12">
    <v-row>
      <v-col cols="12">
        <!-- Header -->
        <div class="mb-8">
          <h2 class="text-h4 font-weight-bold text-customblack mb-2">
            Weekly Best Sellers
          </h2>
        </div>

        <!-- Tabs -->
        <v-tabs
          v-model="activeTab"
          color="primary"
          class="mb-6"
          slider-color="primary"
          show-arrows
        >
          <v-tab value="marketing">
            <v-icon start>mdi-book-open-variant</v-icon>
            Marketing
          </v-tab>
          <v-tab value="kids">
            <v-icon start>mdi-school</v-icon>
            Kids Education
          </v-tab>
        </v-tabs>

        <!-- Tab Content -->
        <v-window v-model="activeTab">
          <!-- Marketing Tab -->
          <v-window-item value="marketing">
            <v-row>
              <!-- Left Column - List of Books -->
              <v-col cols="12" md="6">
                <v-card
                  v-for="(book, index) in marketingBooks"
                  :key="book._id"
                  class="mb-4 book-item-card"
                  :class="{ 'selected-book': selectedBook?._id === book._id }"
                  elevation="2"
                  @click="selectBook(book)"
                  hover
                >
                  <v-card-text class="pa-4">
                    <div class="d-flex">
                      <!-- Ranking Number -->
                      <div class="ranking-number mr-4">
                        <v-chip
                          :color="getRankingColor(index)"
                          size="large"
                          class="font-weight-bold"
                        >
                          {{ String(index + 1).padStart(2, "0") }}
                        </v-chip>
                        <v-icon
                          v-if="index < 3"
                          :color="getRankingColor(index)"
                          size="small"
                          class="mt-1"
                        >
                          mdi-arrow-up
                        </v-icon>
                      </div>

                      <!-- Book Cover -->
                      <div class="book-cover-small">
                        <img
                          :src="
                            book.cover_url ||
                            'https://via.placeholder.com/80x120/e0e0e0/757575?text=No+Image'
                          "
                          :alt="book.title"
                          class="book-cover-image-small"
                          @error="
                            (e) =>
                              (e.target.src =
                                'https://via.placeholder.com/80x120/e0e0e0/757575?text=No+Image')
                          "
                        />
                      </div>

                      <!-- Book Info -->
                      <div class="flex-grow-1">
                        <h3 class="text-h6 font-weight-bold mb-1 line-clamp-2">
                          {{ book.title }}
                        </h3>
                        <p class="text-body-2 text-grey-darken-1 mb-2">
                          {{ book.authors?.join(", ") || "Unknown Author" }}
                        </p>
                        <div class="d-flex align-center mb-2">
                          <v-rating
                            :model-value="book.rating || 4.5"
                            color="amber"
                            density="compact"
                            size="small"
                            readonly
                            half-increments
                          ></v-rating>
                          <span class="text-caption ml-2">
                            {{ book.rating || "4.5" }}
                          </span>
                        </div>
                        <p class="text-caption text-grey mb-2">
                          {{ book.sold }} sold
                        </p>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>

                <!-- View More Button -->
                <v-btn
                  block
                  variant="outlined"
                  color="primary"
                  size="large"
                  class="mt-4"
                  @click="loadMore('marketing')"
                >
                  View More
                </v-btn>
              </v-col>

              <!-- Right Column - Selected Book Details -->
              <v-col cols="12" md="6">
                <v-card v-if="selectedBook" class="sticky-card" elevation="4">
                  <!-- Book Cover with proper aspect ratio -->
                  <div class="book-cover-large-container">
                    <img
                      :src="
                        selectedBook.cover_url ||
                        'https://via.placeholder.com/300x450/e0e0e0/757575?text=No+Image'
                      "
                      :alt="selectedBook.title"
                      class="book-cover-large"
                      @error="
                        (e) =>
                          (e.target.src =
                            'https://via.placeholder.com/300x450/e0e0e0/757575?text=No+Image')
                      "
                    />
                  </div>

                  <v-card-title class="text-h6 font-weight-bold mt-3">
                    {{ selectedBook.title }}
                  </v-card-title>

                  <v-card-subtitle class="text-body-2 mb-2">
                    Author:
                    {{ selectedBook.authors?.join(", ") || "Unknown Author" }}
                    <br />
                    Publisher:
                    {{
                      selectedBook.publisher || "People's Army Publishing House"
                    }}
                  </v-card-subtitle>

                  <v-card-text>
                    <!-- Price -->
                    <div class="mb-3">
                      <div class="d-flex align-center mb-2">
                        <span class="text-h5 font-weight-bold text-error mr-3">
                          ${{ selectedBook.price?.toFixed(2) || "0.00" }}
                        </span>
                        <v-chip
                          color="error"
                          size="small"
                          class="font-weight-bold"
                        >
                          -10%
                        </v-chip>
                      </div>
                    </div>

                    <!-- Description Title -->
                    <h4 class="text-subtitle-1 font-weight-bold mb-2">
                      {{ selectedBook.title }}
                    </h4>

                    <!-- Description -->
                    <p class="text-body-2 text-grey-darken-2 line-clamp-6 mb-3">
                      {{
                        selectedBook.description || "No description available"
                      }}
                    </p>

                    <!-- Action Buttons -->
                    <div class="ga-3">
                      <v-btn
                        color="primary"
                        variant="flat"
                        size="large"
                        prepend-icon="mdi-cart-plus"
                        @click="addToCart(selectedBook._id)"
                        block
                      >
                        Add to Cart
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>

                <!-- Placeholder when no book selected -->
                <v-card v-else class="sticky-card" elevation="4">
                  <v-card-text class="text-center py-12">
                    <v-icon size="80" color="grey-lighten-2"
                      >mdi-book-open-page-variant</v-icon
                    >
                    <p class="text-h6 text-grey mt-4">
                      Select a book to view details
                    </p>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-window-item>

          <!-- Kids Education Tab -->
          <v-window-item value="kids">
            <v-row>
              <!-- Left Column - List of Books -->
              <v-col cols="12" md="6">
                <v-card
                  v-for="(book, index) in kidsBooks"
                  :key="book._id"
                  class="mb-4 book-item-card"
                  :class="{ 'selected-book': selectedBook?._id === book._id }"
                  elevation="2"
                  @click="selectBook(book)"
                  hover
                >
                  <v-card-text class="pa-4">
                    <div class="d-flex">
                      <!-- Ranking Number -->
                      <div class="ranking-number mr-4">
                        <v-chip
                          :color="getRankingColor(index)"
                          size="large"
                          class="font-weight-bold"
                        >
                          {{ String(index + 1).padStart(2, "0") }}
                        </v-chip>
                        <v-icon
                          v-if="index < 3"
                          :color="getRankingColor(index)"
                          size="small"
                          class="mt-1"
                        >
                          mdi-arrow-up
                        </v-icon>
                      </div>

                      <!-- Book Cover -->
                      <div class="book-cover-small">
                        <img
                          :src="
                            book.cover_url ||
                            'https://via.placeholder.com/80x120/e0e0e0/757575?text=No+Image'
                          "
                          :alt="book.title"
                          class="book-cover-image-small"
                          @error="
                            (e) =>
                              (e.target.src =
                                'https://via.placeholder.com/80x120/e0e0e0/757575?text=No+Image')
                          "
                        />
                      </div>

                      <!-- Book Info -->
                      <div class="flex-grow-1">
                        <h3 class="text-h6 font-weight-bold mb-1 line-clamp-2">
                          {{ book.title }}
                        </h3>
                        <p class="text-body-2 text-grey-darken-1 mb-2">
                          {{ book.authors?.join(", ") || "Unknown Author" }}
                        </p>
                        <div class="d-flex align-center mb-2">
                          <v-rating
                            :model-value="book.rating || 4.5"
                            color="amber"
                            density="compact"
                            size="small"
                            readonly
                            half-increments
                          ></v-rating>
                          <span class="text-caption ml-2">
                            {{ book.rating || "4.5" }}
                          </span>
                        </div>
                        <p class="text-caption text-grey mb-2">
                          {{ book.sold }} sold
                        </p>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>

                <!-- View More Button -->
                <v-btn
                  block
                  variant="outlined"
                  color="primary"
                  size="large"
                  class="mt-4"
                  @click="loadMore('education')"
                >
                  View More
                </v-btn>
              </v-col>

              <!-- Right Column - Selected Book Details -->
              <v-col cols="12" md="6">
                <v-card v-if="selectedBook" class="sticky-card" elevation="4">
                  <!-- Book Cover with proper aspect ratio -->
                  <div class="book-cover-large-container">
                    <img
                      :src="
                        selectedBook.cover_url ||
                        'https://via.placeholder.com/300x450/e0e0e0/757575?text=No+Image'
                      "
                      :alt="selectedBook.title"
                      class="book-cover-large"
                      @error="
                        (e) =>
                          (e.target.src =
                            'https://via.placeholder.com/300x450/e0e0e0/757575?text=No+Image')
                      "
                    />
                  </div>

                  <v-card-title class="text-h6 font-weight-bold mt-3">
                    {{ selectedBook.title }}
                  </v-card-title>

                  <v-card-subtitle class="text-body-2 mb-2">
                    Author:
                    {{ selectedBook.authors?.join(", ") || "Unknown Author" }}
                    <br />
                    Publisher:
                    {{
                      selectedBook.publisher || "People's Army Publishing House"
                    }}
                  </v-card-subtitle>

                  <v-card-text>
                    <!-- Price -->
                    <div class="mb-3">
                      <div class="d-flex align-center mb-2">
                        <span class="text-h5 font-weight-bold text-error mr-3">
                          ${{ selectedBook.price?.toFixed(2) || "0.00" }}
                        </span>
                        <v-chip
                          color="error"
                          size="small"
                          class="font-weight-bold"
                        >
                          -10%
                        </v-chip>
                      </div>
                    </div>

                    <!-- Description Title -->
                    <h4 class="text-subtitle-1 font-weight-bold mb-2">
                      {{ selectedBook.title }}
                    </h4>

                    <!-- Description -->
                    <p class="text-body-2 text-grey-darken-2 line-clamp-6 mb-3">
                      {{
                        selectedBook.description || "No description available"
                      }}
                    </p>

                    <!-- Action Buttons -->
                    <div class="d-flex ga-3">
                      <v-btn
                        color="primary"
                        variant="flat"
                        size="large"
                        prepend-icon="mdi-cart-plus"
                        @click="addToCart(selectedBook._id)"
                        block
                      >
                        Add to Cart
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>

                <!-- Placeholder when no book selected -->
                <v-card v-else class="sticky-card" elevation="4">
                  <v-card-text class="text-center py-12">
                    <v-icon size="80" color="grey-lighten-2"
                      >mdi-book-open-page-variant</v-icon
                    >
                    <p class="text-h6 text-grey mt-4">
                      Select a book to view details
                    </p>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "BestSellerTabs",
  data() {
    return {
      activeTab: "marketing",
      selectedBook: null,
      marketingBooksData: [],
      kidsBooksData: [],
    };
  },
  computed: {
    ...mapState("book", ["books"]),
    marketingBooks() {
      return this.marketingBooksData.slice(0, 5);
    },
    kidsBooks() {
      return this.kidsBooksData.slice(0, 5);
    },
  },
  watch: {
    async activeTab(newTab) {
      console.log("=== TAB CHANGED ===");
      console.log("New tab:", newTab);

      // Load books for the selected tab
      if (newTab === "marketing") {
        await this.loadMarketingBooks();
      } else if (newTab === "kids") {
        await this.loadKidsBooks();
      }
    },
  },
  async mounted() {
    // Load books for the initial tab
    await this.loadMarketingBooks();
  },
  methods: {
    ...mapActions("book", ["getAllBooks"]),
    ...mapActions("favorite", ["toggleFavorites"]),

    async loadMarketingBooks() {
      try {
        console.log("Loading marketing books...");
        await this.getAllBooks({ subject: "marketing" });
        this.marketingBooksData = this.books;

        console.log("Marketing books loaded:", this.marketingBooksData.length);

        // Auto-select first book
        if (this.marketingBooksData.length > 0) {
          this.selectedBook = this.marketingBooksData[0];
          console.log("Selected book:", this.selectedBook?.title);
        }
      } catch (error) {
        console.error("Error loading marketing books:", error);
        this.marketingBooksData = [];
      }
    },

    async loadKidsBooks() {
      try {
        console.log("Loading kids education books...");
        await this.getAllBooks({ subject: "kids education" });
        this.kidsBooksData = this.books;

        // console.log("Kids books loaded:", this.kidsBooksData.length);

        // Auto-select first book
        if (this.kidsBooksData.length > 0) {
          this.selectedBook = this.kidsBooksData[0];
          console.log("Selected book:", this.selectedBook?.title);
        }
      } catch (error) {
        console.error("Error loading kids books:", error);
        this.kidsBooksData = [];
      }
    },

    selectBook(book) {
      this.selectedBook = book;
      console.log("Manually selected book:", book?.title);
    },

    getRankingColor(index) {
      if (index === 0) return "error";
      if (index === 1) return "warning";
      if (index === 2) return "success";
      return "grey";
    },

    async addToCart(bookId) {
      try {
        await this.$store.dispatch("cart/addToCart", {
          bookId,
          quantity: 1,
          productType: "hardbook", // default to hardbook
        });
        this.$emit("show-snackbar", {
          text: "Added to cart!",
          color: "success",
        });
      } catch (error) {
        console.error("Error adding to cart:", error);
        this.$emit("show-snackbar", {
          text: "Failed to add to cart",
          color: "error",
        });
      }
    },

    async toggleFavorite(bookId) {
      try {
        await this.toggleFavorites(bookId);
      } catch (error) {
        console.error("Error toggling favorite:", error);
      }
    },

    loadMore(subject) {
      // Navigate to full list page based on subject
      this.$router.push(`/subjects/${subject}`);
    },
  },
};
</script>

<style scoped>
.book-item-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.book-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.selected-book {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.ranking-number {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.sticky-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: visible !important;
}

.book-cover-large-container {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.book-cover-large {
  width: 100%;
  max-width: 250px;
  height: auto;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.book-cover-small {
  width: 80px;
  height: 120px;
  margin-right: 16px;
  overflow: hidden;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.book-cover-image-small {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-6 {
  display: -webkit-box;
  -webkit-line-clamp: 6;
  line-clamp: 6;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

:deep(.v-tab) {
  text-transform: none;
  font-weight: 500;
}

:deep(.v-tab--disabled) {
  opacity: 0.5;
}
</style>
