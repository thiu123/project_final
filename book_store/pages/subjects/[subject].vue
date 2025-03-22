<template>
  <v-container>
    <v-row>
      <v-col cols="12" sm="3">
        <v-card elevation="3">
          <v-card-title class="text-h6">Category</v-card-title>
          <v-list>
            <v-list-item
              v-for="(item, i) in subjects"
              :key="i"
              @click="
                $router.push(
                  `/subjects/${encodeURIComponent(item.toLowerCase())}`
                )
              "
            >
              <v-list-item-title>{{ item }}</v-list-item-title>
            </v-list-item>
          </v-list>
          <v-divider class="border-opacity-50 mx-2"></v-divider>
          <v-card-title>Price</v-card-title>
          <div>
            <v-checkbox
              v-for="(price, i) in prices"
              :key="i"
              v-model="selectedPrice"
              :label="price"
              :value="price"
              density="compact"
              hide-details
            ></v-checkbox>
          </div>
        </v-card>
      </v-col>

      <!-- Books List -->
      <v-col cols="12" sm="9">
        <v-card class="pa-6" elevation="3">
          <!-- Sort by & Dropdown -->
          <div class="d-flex align-center mb-4" style="gap: 20px">
            <span>Sort by</span>
            <div class="text-center">
              <v-menu open-on-hover>
                <template v-slot:activator="{ props }">
                  <v-btn
                    variant="outlined"
                    class="text-subtitle-1"
                    v-bind="props"
                  >
                    Dropdown
                    <v-icon class="ml-1">mdi-chevron-down</v-icon>
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

          <!-- Loading Indicator -->
          <div
            class="d-flex justify-center"
            v-if="isLoading && paginatedBooks.length === 0"
          >
            <v-progress-circular
              indeterminate
              color="primary"
              size="50"
            ></v-progress-circular>
          </div>

          <!-- Display list data -->
          <v-row v-else>
            <v-col
              v-for="(book, i) in paginatedBooks"
              :key="i"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-card class="h-100 bg-transparent" elevation="2">
                <div class="position-relative">
                  <v-img
                    v-if="book.cover_url"
                    class="cursor-pointer"
                    @click="$router.push(`/details/${book._id}`)"
                    :src="book.cover_url"
                    height="250"
                    cover
                  ></v-img>
                  <v-btn
                    icon
                    variant="text"
                    color="white"
                    class="position-absolute"
                    style="top: 8px; right: 8px"
                  >
                    <v-icon>mdi-heart</v-icon>
                  </v-btn>
                </div>
                <v-card-text class="pa-2">
                  <div class="d-flex align-center mb-1">
                    <v-rating
                      :model-value="book.rating"
                      color="amber"
                      density="compact"
                      size="small"
                      readonly
                    ></v-rating>
                    <span class="text-caption ml-1">{{ book.reviews }}</span>
                  </div>
                  <div class="text-subtitle-2 font-weight-medium text-truncate">
                    {{ book.title }}
                  </div>
                  <div class="d-flex justify-space-between align-center mt-2">
                    <span class="text-subtitle-2 font-weight-bold ml-1">
                      {{ book.price }} $
                    </span>
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-btn
                    color="darkgreen"
                    variant="elevated"
                    size="small"
                    block
                    class="text-none mr-2"
                  >
                    <v-icon start>mdi-cart</v-icon>
                    Add to cart
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Pagination -->
    <div class="text-center mt-3">
      <v-pagination
        v-model="page"
        :length="totalPages"
        next-icon="mdi-menu-right"
        prev-icon="mdi-menu-left"
      ></v-pagination>
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
        console.log("Subject:", subject);
        if (subject) {
          await this.getAllBooks(subject);
        }
        console.log("Books:", this.books);
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
