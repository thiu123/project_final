<template>
  <v-container class="py-8">
    <v-row>
      <!-- Enhanced Sidebar -->
      <v-col cols="12" sm="3" class="mb-6">
        <v-card
          elevation="2"
          rounded="xl"
          class="sticky-sidebar"
          color="surface"
        >
          <!-- Categories Section -->
          <v-card-title class="pa-6 pb-4 d-flex align-center">
            <v-icon start class="mr-3 text-primary"
              >mdi-format-list-bulleted</v-icon
            >
            <span class="text-h6 font-weight-bold">Categories</span>
          </v-card-title>

          <v-list density="comfortable" class="pa-0 bg-transparent">
            <template v-for="(category, index) in bookSubjects" :key="index">
              <!-- Categories with subcategories -->
              <v-list-group v-if="category.subcategories" class="mb-2">
                <template v-slot:activator="{ props }">
                  <v-list-item v-bind="props" class="rounded-lg mx-2">
                    <template v-slot:prepend>
                      <v-icon size="20" color="grey-darken-1"
                        >mdi-book-outline</v-icon
                      >
                    </template>
                    <v-list-item-title class="text-body-1 font-weight-medium">{{
                      category.category
                    }}</v-list-item-title>
                  </v-list-item>
                </template>

                <template
                  v-for="(subcategory, subIndex) in category.subcategories"
                  :key="subIndex"
                >
                  <v-list-item
                    @click="
                      $router.push(
                        `/subjects/${encodeURIComponent(
                          subcategory.toLowerCase()
                        )}`
                      )
                    "
                    class="category-item mx-2 rounded-lg"
                    :class="{
                      'bg-primary-lighten-5':
                        $route.params.subject === subcategory.toLowerCase(),
                    }"
                  >
                    <v-list-item-title class="text-body-2 font-weight-medium">{{
                      subcategory
                    }}</v-list-item-title>
                  </v-list-item>

                  <v-divider
                    v-if="subIndex < category.subcategories.length - 1"
                    class="mx-4 opacity-25"
                  ></v-divider>
                </template>
              </v-list-group>

              <!-- Categories without subcategories -->
              <v-list-item
                v-else
                @click="
                  $router.push(
                    `/subjects/${encodeURIComponent(
                      category.category.toLowerCase()
                    )}`
                  )
                "
                class="category-item mx-2 rounded-lg mb-2"
                :class="{
                  'bg-primary-lighten-5':
                    $route.params.subject === category.category.toLowerCase(),
                }"
              >
                <template v-slot:prepend>
                  <v-icon size="20" color="grey-darken-1"
                    >mdi-book-outline</v-icon
                  >
                </template>
                <v-list-item-title class="text-body-1 font-weight-medium">{{
                  category.category
                }}</v-list-item-title>
              </v-list-item>

              <v-divider
                v-if="index < bookSubjects.length - 1"
                class="mx-4 my-2 opacity-25"
              ></v-divider>
            </template>
          </v-list>

          <v-divider class="mx-4 my-4"></v-divider>

          <!-- Price Section -->
          <v-card-title class="pa-6 pb-4 d-flex align-center">
            <v-icon start class="mr-3 text-primary">mdi-currency-usd</v-icon>
            <span class="text-h6 font-weight-bold">Price Range</span>
          </v-card-title>

          <v-card-text class="pa-6 pt-0">
            <v-checkbox
              v-for="(price, i) in prices"
              :key="i"
              v-model="selectedPrice"
              :label="price"
              :value="price"
              density="comfortable"
              hide-details
              class="mb-3"
              color="primary"
            ></v-checkbox>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Enhanced Books List -->
      <v-col cols="12" sm="9">
        <v-card elevation="2" rounded="xl" class="h-100">
          <!-- Enhanced Header -->
          <v-card-title class="pa-6 pb-4">
            <div class="d-flex justify-space-between align-center w-100">
              <div class="d-flex align-center">
                <v-icon class="mr-3 text-primary" size="28"
                  >mdi-book-multiple</v-icon
                >
                <span class="text-h5 font-weight-bold">Our Collection</span>
                <v-chip
                  v-if="$route.params.subject"
                  color="primary"
                  variant="flat"
                  class="ml-4 text-body-2 font-weight-medium"
                  size="small"
                >
                  {{
                    $route.params.subject
                      .replace(/-/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())
                  }}
                </v-chip>
              </div>

              <!-- Enhanced Sort Dropdown -->
              <div class="d-flex align-center">
                <span class="text-body-2 mr-3 font-weight-medium">Sort by</span>
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn
                      variant="outlined"
                      color="grey-darken-1"
                      class="text-body-2 font-weight-medium"
                      v-bind="props"
                      rounded="lg"
                      prepend-icon="mdi-sort"
                    >
                      Newest
                      <v-icon class="ml-2">mdi-chevron-down</v-icon>
                    </v-btn>
                  </template>
                  <v-list class="py-0">
                    <v-list-item
                      v-for="(item, index) in items"
                      :key="index"
                      class="rounded-lg mx-2 my-1"
                    >
                      <v-list-item-title
                        class="text-body-2 font-weight-medium"
                        >{{ item.title }}</v-list-item-title
                      >
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </div>
          </v-card-title>

          <v-card-text class="pa-6 pt-0">
            <!-- Enhanced Loading Indicator -->
            <div
              class="d-flex justify-center py-16"
              v-if="isLoading && paginatedBooks.length === 0"
            >
              <div class="text-center">
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="64"
                  width="6"
                  class="mb-6"
                ></v-progress-circular>
                <div class="text-h6 text-grey-darken-1 font-weight-medium">
                  Loading books...
                </div>
                <div class="text-body-2 text-grey-darken-2 mt-2">
                  Please wait while we fetch your collection
                </div>
              </div>
            </div>

            <!-- Enhanced Books Grid -->
            <v-row v-else>
              <v-col
                v-for="(book, i) in paginatedBooks"
                :key="i"
                cols="12"
                sm="6"
                md="4"
                lg="3"
                class="mb-6"
              >
                <v-card
                  class="book-card h-100"
                  elevation="3"
                  rounded="xl"
                  hover
                >
                  <div class="position-relative">
                    <v-img
                      v-if="book.cover_url"
                      class="cursor-pointer book-cover rounded-t-xl"
                      @click="$router.push(`/details/${book._id}`)"
                      :src="book.cover_url"
                      height="320"
                      cover
                    >
                      <template v-slot:placeholder>
                        <div
                          class="d-flex align-center justify-center fill-height bg-grey-lighten-4"
                        >
                          <v-progress-circular
                            color="grey-lighten-1"
                            indeterminate
                          ></v-progress-circular>
                        </div>
                      </template>
                    </v-img>

                    <!-- Enhanced Wishlist Button -->
                    <v-btn
                      icon
                      variant="flat"
                      color="white"
                      :ripple="false"
                      size="small"
                      class="position-absolute top-0 right-0 mt-3 mr-3"
                      elevation="4"
                      @click.stop="toggleFavoriteBook(book._id)"
                    >
                      <v-icon
                        :color="isFavorite(book._id) ? 'red' : 'grey-darken-2'"
                        size="24"
                      >
                        {{
                          isFavorite(book._id)
                            ? "mdi-heart"
                            : "mdi-heart-outline"
                        }}
                      </v-icon>
                    </v-btn>

                    <!-- Price Badge -->
                    <v-chip
                      color="primary"
                      variant="flat"
                      size="small"
                      class="position-absolute bottom-0 left-0 ml-3 mb-3"
                      elevation="2"
                    >
                      ${{ book.price }}
                    </v-chip>
                  </div>

                  <v-card-text class="pa-4">
                    <!-- Enhanced Rating -->
                    <div class="d-flex align-center mb-3">
                      <v-rating
                        :model-value="book.rating"
                        color="amber"
                        density="compact"
                        size="small"
                        readonly
                        class="mr-2"
                      ></v-rating>
                      <!-- <span
                        class="text-caption text-grey-darken-1 font-weight-medium"
                        >{{ book.reviews }} reviews</span
                      > -->
                    </div>

                    <!-- Enhanced Title -->
                    <div
                      class="text-subtitle-1 font-weight-bold mb-2 text-truncate cursor-pointer"
                      @click="$router.push(`/details/${book._id}`)"
                    >
                      {{ book.title }}
                    </div>

                    <!-- Author -->
                    <div class="text-body-2 text-grey-darken-1 mb-3">
                      by {{ book.authors[0] || "Unknown Author" }}
                    </div>
                  </v-card-text>

                  <!-- Enhanced Card Actions -->
                  <v-card-actions class="pa-4 pt-0">
                    <v-btn
                      color="primary"
                      variant="flat"
                      size="large"
                      block
                      rounded="lg"
                      class="text-body-2 font-weight-bold"
                      prepend-icon="mdi-cart-plus"
                    >
                      Add to Cart
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>

            <!-- No Books Message -->
            <div
              v-if="!isLoading && paginatedBooks.length === 0"
              class="text-center py-16"
            >
              <v-icon size="80" color="grey-lighten-2" class="mb-6"
                >mdi-book-open-variant</v-icon
              >
              <h3 class="text-h5 font-weight-bold mb-3">No books found</h3>
              <p class="text-body-1 text-grey-darken-1 mb-6">
                We couldn't find any books in this category. Try selecting a
                different category or check back later.
              </p>
              <v-btn
                color="primary"
                variant="flat"
                size="large"
                rounded="lg"
                to="/"
              >
                Browse All Books
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Enhanced Pagination -->
    <div class="d-flex justify-center align-center mt-8">
      <v-pagination
        v-model="page"
        :length="totalPages"
        :total-visible="7"
        rounded="lg"
        color="primary"
        variant="outlined"
        class="d-flex align-center"
        size="large"
      >
        <template v-slot:prev>
          <div class="d-flex justify-center align-center h-100">
            <v-icon>mdi-chevron-left</v-icon>
          </div>
        </template>
        <template v-slot:next>
          <div class="d-flex justify-center align-center h-100">
            <v-icon>mdi-chevron-right</v-icon>
          </div>
        </template>
      </v-pagination>
    </div>
  </v-container>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  data() {
    return {
      isLoading: false,
      items: [
        { title: "Newest" },
        { title: "From A to Z" },
        { title: "From Z to A" },
      ],
      bookSubjects: [
        {
          category: "Fiction",
          subcategories: [
            "Literary Fiction",
            "Historical Fiction",
            "Contemporary Fiction",
          ],
        },
        {
          category: "Romance",
          subcategories: ["Contemporary Romance", "Historical Romance"],
        },
        {
          category: "Manga",
        },
        {
          category: "Biography & Memoir",
          subcategories: ["Historical Figures", "Political Leaders"],
        },
        {
          category: "History",
          subcategories: ["Ancient History", "Modern History"],
        },
        {
          category: "Health & Wellness",
          subcategories: ["Cooking", "Nutrition", "Exercise"],
        },
        {
          category: "Science & Nature",
          subcategories: [
            "Popular Science",
            "Astronomy",
            "Biology & Life Sciences",
          ],
        },
        {
          category: "Business & Economics",
          subcategories: ["Personal Finance", "Investing", "Entrepreneurship"],
        },
      ],
      prices: ["Under $10", "$10 - $20", "$20 - $30", "Above $50"],
      selectedPrice: [],
      page: 1,
      itemsPerPage: 12,
    };
  },
  computed: {
    ...mapState("book", ["books"]),
    ...mapState("favorite", ["favorites"]),
    paginatedBooks() {
      const start = (this.page - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.books.slice(start, end);
    },

    totalPages() {
      return Math.ceil(this.books.length / this.itemsPerPage);
    },
  },
  methods: {
    ...mapActions("book", ["getAllBooks"]),
    ...mapActions("favorite", ["toggleFavorites", "getFavoritesForEachUser"]),
    async fetchBooks() {
      this.isLoading = true;
      try {
        const subject = this.$route.params.subject;
        // console.log("Subject:", subject);
        if (subject) {
          await this.getAllBooks(subject);
        }
        // console.log("Books:", this.books);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async fetchFavorites() {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          await this.getFavoritesForEachUser();
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    },
    async toggleFavoriteBook(bookId) {
      try {
        await this.toggleFavorites(bookId);
      } catch (error) {
        console.error("Error toggling favorite:", error);
      }
    },
    isFavorite(bookId) {
      return this.favorites.some((favorite) => {
        // Handle case where bookId is populated (contains full book object)
        const favoriteBookId = favorite.bookId?._id || favorite.bookId;
        return favoriteBookId === bookId;
      });
    },
  },
  async mounted() {
    await this.fetchBooks();
    await this.fetchFavorites();
  },
  watch: {
    "$route.params.subject": {
      handler() {
        this.page = 1;
        this.fetchBooks();
      },
      immediate: true,
    },
  },
};
</script>

<style scoped>
.custom-btn:hover {
  color: #f4ce70 !important;
}

/* .sticky-sidebar {
  position: sticky;
  top: 24px;
} */

.category-item {
  transition: all 0.2s ease;
}

.category-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.08) !important;
  transform: translateX(4px);
}

.book-card {
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.book-cover {
  transition: all 0.3s ease;
}

.book-card:hover .book-cover {
  transform: scale(1.02);
}

.cursor-pointer {
  cursor: pointer;
}

/* Enhanced focus states for accessibility */
.v-list-item:focus-visible {
  outline: 2px solid var(--v-theme-primary);
  outline-offset: 2px;
}

.v-btn:focus-visible {
  outline: 2px solid var(--v-theme-primary);
  outline-offset: 2px;
}
</style>
