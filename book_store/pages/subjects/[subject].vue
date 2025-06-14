<template>
  <v-container class="py-6">
    <v-row>
      <!-- Enhanced Sidebar -->
      <v-col cols="12" sm="3">
        <v-card
          elevation="1"
          rounded="lg"
          variant="outlined"
          class="sticky-sidebar"
        >
          <!-- Categories Section -->
          <v-card-title class="pa-4 d-flex align-center">
            <v-icon start class="mr-2">mdi-format-list-bulleted</v-icon>
            Category
          </v-card-title>

          <v-list density="compact" class="pa-0 bg-transparent">
            <v-list-item
              v-for="(item, i) in subjects"
              :key="i"
              @click="
                $router.push(
                  `/subjects/${encodeURIComponent(
                    item.toLowerCase().replace(/\s+/g, '_')
                  )}`
                )
              "
              class="category-item"
            >
              <template v-slot:prepend>
                <v-icon size="small"
                  >mdi-book-outline</v-icon
                >
              </template>
              <v-list-item-title class="text-body-2">{{
                item
              }}</v-list-item-title>
            </v-list-item>
          </v-list>

          <v-divider class="mx-2"></v-divider>

          <!-- Price Section -->
          <v-card-title class="pa-4 d-flex align-center">
            <v-icon start class="mr-2">mdi-currency-usd</v-icon>
            Price
          </v-card-title>

          <v-card-text class="pa-4">
            <v-checkbox
              v-for="(price, i) in prices"
              :key="i"
              v-model="selectedPrice"
              :label="price"
              :value="price"
              density="compact"
              hide-details
              class="mb-1"
              color="grey-darken-1"
            ></v-checkbox>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Enhanced Books List -->
      <v-col cols="12" sm="9">
        <v-card elevation="1" rounded="lg" variant="outlined">
          <!-- Enhanced Header -->
          <v-card-title class="pa-4">
            <div class="d-flex justify-space-between align-center w-100">
              <div class="d-flex align-center">
                <v-icon class="mr-2">mdi-book-multiple</v-icon>
                <span class="text-h6">Our Collection</span>
              </div>

              <!-- Enhanced Sort Dropdown -->
              <div class="d-flex align-center">
                <span class="text-body-2 mr-3">Sort by</span>
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn
                      variant="outlined"
                      color="grey-darken-1"
                      class="text-body-2"
                      v-bind="props"
                      rounded="lg"
                    >
                      Dropdown
                      <v-icon class="ml-2">mdi-chevron-down</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item v-for="(item, index) in items" :key="index">
                      <v-list-item-title>{{ item.title }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </div>
          </v-card-title>

          <v-card-text class="pa-4">
            <!-- Enhanced Loading Indicator -->
            <div
              class="d-flex justify-center py-12"
              v-if="isLoading && paginatedBooks.length === 0"
            >
              <div class="text-center">
                <v-progress-circular
                  indeterminate
                  color="grey-darken-1"
                  size="60"
                  width="4"
                  class="mb-4"
                ></v-progress-circular>
                <div class="text-body-1 text-grey-darken-1">
                  Loading books...
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
              >
                <v-card
                  class="book-card h-100"
                  elevation="2"
                  rounded="lg"
                  variant="outlined"
                >
                  <div class="position-relative">
                    <v-img
                      v-if="book.cover_url"
                      class="cursor-pointer book-cover"
                      @click="$router.push(`/details/${book._id}`)"
                      :src="book.cover_url"
                      height="280"
                      cover
                    >
                      <template v-slot:placeholder>
                        <div
                          class="d-flex align-center justify-center fill-height"
                        >
                          <v-progress-circular
                            color="grey-lighten-4"
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
                      size="small"
                      class="wishlist-btn"
                      elevation="2"
                    >
                      <v-icon color="grey-darken-1" size="small"
                        >mdi-heart-outline</v-icon
                      >
                    </v-btn>
                  </div>

                  <v-card-text class="pa-3">
                    <!-- Enhanced Rating -->
                    <div class="d-flex align-center mb-2">
                      <v-rating
                        :model-value="book.rating"
                        color="grey-darken-1"
                        density="compact"
                        size="small"
                        readonly
                        class="mr-2"
                      ></v-rating>
                      <span class="text-caption text-grey-darken-1">{{
                        book.reviews
                      }}</span>
                    </div>

                    <!-- Enhanced Title -->
                    <div
                      class="text-subtitle-1 font-weight-medium mb-2 text-truncate"
                    >
                      {{ book.title }}
                    </div>

                    <!-- Enhanced Price -->
                    <div class="d-flex justify-space-between align-center">
                      <span class="text-h6 font-weight-bold">
                        ${{ book.price }}
                      </span>
                    </div>
                  </v-card-text>

                  <!-- Enhanced Card Actions -->
                  <v-card-actions class="pa-3 pt-0">
                    <v-btn
                      color="grey-darken-3"
                      variant="flat"
                      size="small"
                      block
                      rounded="lg"
                      class="text-body-2"
                    >
                      <v-icon start size="small">mdi-cart-plus</v-icon>
                      Add to cart
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Enhanced Pagination -->
    <div class="d-flex justify-center align-center mt-6">
      <v-pagination
      v-model="page"
      :length="totalPages"
      :total-visible="7"
      rounded="lg"
      color="grey-darken-3"
      variant="outlined"
      class="d-flex align-center"
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
      subjects: [
        "Fiction",
        "Mystery",
        "Fantasy",
        "Romance",
        "Manga",
        "Self-Help",
        "Biography",
        "History",
        "IT & Programming",
      ],
      prices: ["Under $10", "$10 - $20", "$20 - $30", "Above $50"],
      selectedPrice: [],
      page: 1,
      itemsPerPage: 12,
    };
  },
  computed: {
    ...mapState("book", ["books"]),

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
</style>
