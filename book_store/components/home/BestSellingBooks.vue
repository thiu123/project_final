<template>
  <v-container max-width="1440" class="mt-8">
    <v-card
      elevation="12"
      class="pa-8 rounded-xl best-sellers-card"
      style="background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)"
    >
      <!-- Enhanced Header -->
      <div class="d-flex justify-space-between align-center mb-8 border-b">
        <div class="d-flex align-center">
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
        <v-col cols="12" class="pa-0">
          <!-- Enhanced Tabs Card -->
          <v-card class="overflow-hidden">
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
                      class="book-card h-100 position-relative cursor-pointer"
                      @click="$router.push(`/details/${book._id}`)"
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
                        <img :src="book?.cover_url" cover class="book-cover" />

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
                            :model-value="book?.rating"
                            color="amber"
                            density="compact"
                            size="small"
                            readonly
                            half-increments
                          ></v-rating>
                          <!-- <v-chip
                            size="x-small"
                            variant="text"
                            class="ml-2 text-caption"
                          >
                            (128)
                          </v-chip> -->
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

                        <!-- Genre Tag & Sold Count -->
                        <div class="d-flex ga-2 mb-3">
                          <v-chip
                            size="small"
                            variant="outlined"
                            color="waterblue"
                            class="text-capitalize"
                          >
                            {{ subject }}
                          </v-chip>
                          <v-chip
                            size="small"
                            variant="flat"
                            color="success"
                            class="text-capitalize"
                          >
                            <v-icon start size="x-small">mdi-fire</v-icon>
                            Sold {{ book.sold || 0 }}
                          </v-chip>
                        </div>

                        <v-spacer></v-spacer>

                        <!-- Price Section -->
                        <div
                          class="d-flex justify-space-between align-center mb-3"
                        >
                          <div class="d-flex align-center">
                            <span
                              class="text-h6 font-weight-bold text-customblack"
                            >
                              ${{ book.price }}
                            </span>
                          </div>
                        </div>
                      </v-card-text>

                      <!-- Enhanced Card Actions -->
                      <v-card-actions class="pa-4 pt-0">
                        <v-btn
                          block
                          color="darkgreen"
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
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "BestSellingBooks",
  props: {
    favorites: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      tab: "historical fiction",
      bestSellerSubjects: ["historical fiction", "manga", "cooking"],
      bestSellersStories: [],
    };
  },
  computed: {
    ...mapState("book", ["books"]),
  },
  watch: {
    async tab(newVal) {
      console.log("New Tab Value:", newVal);
      // Load books for the selected subject
      if (newVal) {
        await this.loadBooksForSubject(newVal);
      }
    },
  },
  async mounted() {
    // Load books for the initial tab
    await this.loadBooksForSubject(this.tab);
  },
  methods: {
    ...mapActions("book", ["getAllBooks"]),

    async loadBooksForSubject(subject) {
      try {
        console.log("Loading books for subject:", subject);

        // Fetch books for the specific subject from API
        await this.getAllBooks({ subject, half: true });
        // The books are now filtered by backend, just assign them
        this.bestSellersStories = this.books;

        console.log(
          `Loaded ${this.bestSellersStories.length} books for ${subject}`
        );
      } catch (error) {
        console.error("Error loading books for subject:", error);
        this.bestSellersStories = [];
      }
    },

    handleAddToCart(bookId, quantity) {
      // Emit event to parent component
      this.$emit("add-to-cart", bookId, quantity);
    },

    handleToggleFavorites(bookId) {
      // Emit event to parent component
      this.$emit("toggle-favorites", bookId);
    },

    isFavorite(bookId) {
      return this.favorites.some((favorite) => {
        const favoriteBookId = favorite.bookId?._id || favorite.bookId;
        return favoriteBookId === bookId;
      });
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

.bestseller-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
}

.book-cover-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 340px;
}

.book-cover {
  width: auto;
  height: 100%;
  max-height: 320px;
  object-fit: cover !important;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.add-to-cart-btn {
  transition: all 0.2s ease;
}

.add-to-cart-btn:hover {
  transform: translateY(-2px);
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
