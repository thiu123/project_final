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
              <h2 class="text-h4 font-weight-bold text-primary mb-3">
                Discover Your Next Great Read
              </h2>
              <p class="text-subtitle-1 text-medium-emphasis">
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
                >
                  <template v-slot:append-inner>
                    <v-btn
                      icon="mdi-microphone"
                      variant="text"
                      size="small"
                      color="primary"
                    ></v-btn>
                  </template>
                </v-text-field>
              </v-col>
              <v-col cols="12" md="2">
                <v-btn
                  block
                  size="large"
                  color="primary"
                  variant="elevated"
                  class="search-btn"
                  @click="performSearch"
                >
                  Search
                </v-btn>
              </v-col>
            </v-row>

            <!-- Search Results -->
            <v-expand-transition>
              <v-card
                v-if="searchQuery"
                class="search-results mb-6"
                variant="outlined"
                rounded="lg"
              >
                <v-list class="py-0">
                  <v-list-item
                    v-for="(book, index) in searchResults"
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

                    <v-list-item-title class="font-weight-bold mb-1">
                      {{ book.title }}
                    </v-list-item-title>

                    <v-list-item-subtitle class="mb-2">
                      {{ book.author }} • {{ book.first_publish_year }}
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
              <h3 class="text-h6 font-weight-bold mb-6 text-medium-emphasis">
                Trending This Week
              </h3>

              <div class="d-flex justify-center flex-wrap ga-4">
                <v-card
                  v-for="(book, i) in featuredBooks"
                  :key="i"
                  elevation="4"
                  rounded="lg"
                  hover
                >
                  <v-img :src="book.cover" width="70" height="95" cover></v-img>
                </v-card>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Best Selling Books -->
    <v-container class="mt-8">
      <v-card
        elevation="8"
        class="pa-6 rounded-xl"
        style="background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)"
      >
        <!-- Enhanced Header -->
        <div class="d-flex justify-space-between align-center mb-6">
          <div class="d-flex align-center">
            <v-avatar color="amber-lighten-2" size="48" class="mr-4">
              <v-icon color="darkgreen" size="28">mdi-trophy</v-icon>
            </v-avatar>
            <div>
              <h2 class="text-h4 text-darkgreen font-weight-bold mb-1">
                Best Selling Books
              </h2>
              <p class="text-subtitle-1 text-grey-darken-1 ma-0">
                Discover our most popular titles across all categories
              </p>
            </div>
          </div>

          <!-- <v-btn
            color="darkgreen"
            variant="outlined"
            rounded="xl"
            class="font-weight-medium"
          >
            <v-icon start size="small">mdi-eye</v-icon>
            View All
          </v-btn> -->
        </div>

        <v-row>
          <v-col cols="12">
            <!-- Enhanced Tabs Card -->
            <v-card elevation="4" class="rounded-xl overflow-hidden">
              <!-- Enhanced Tabs Navigation -->
              <v-tabs
                v-model="tab"
                color="darkgreen"
                align-tabs="start"
                class="enhanced-tabs"
                bg-color="grey-lighten-5"
                slider-color="darkgreen"
                height="64"
              >
                <v-tab
                  v-for="(subject, i) in bestSellerSubjects"
                  :key="i"
                  :value="subject"
                  class="text-capitalize font-weight-medium tab-item"
                  rounded="lg"
                >
                  <!-- <v-icon start size="small" class="mr-2">
                    {{ getSubjectIcon(subject) }}
                  </v-icon> -->
                  {{ subject }}
                </v-tab>
              </v-tabs>

              <!-- Enhanced Tabs Content -->
              <v-tabs-window class="pa-4" v-model="tab">
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
                        elevation="3"
                        hover
                      >
                        <!-- Bestseller Badge -->
                        <!-- <v-chip
                          color="red"
                          size="small"
                          class="bestseller-badge"
                          variant="elevated"
                        >
                          <v-icon start size="x-small">mdi-fire</v-icon>
                          #{{ i + 1 }}
                        </v-chip> -->

                        <!-- Enhanced Book Cover -->
                        <div class="position-relative book-cover-container">
                          <v-img
                            :src="book?.cover_url"
                            height="280"
                            cover
                            class="book-cover"
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
                        </div>

                        <!-- Enhanced Card Content -->
                        <v-card-text class="pa-3 d-flex flex-column">
                          <!-- Rating Section -->
                          <div class="d-flex align-center mb-2">
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
                            class="text-subtitle-1 text-truncate font-weight-bold mb-1 text-darkgreen"
                          >
                            {{ book.title }}
                          </div>

                          <!-- Author -->
                          <div
                            v-for="(author, index) in book.authors.slice(0, 1)"
                            :key="index"
                            class="text-caption text-grey-darken-1 mb-2"
                          >
                            <span class="text-truncate">{{ author }}</span>
                          </div>

                          <!-- Genre Tag -->
                          <v-chip
                            size="x-small"
                            variant="outlined"
                            color="darkgreen"
                            class="mb-3 align-self-start text-capitalize"
                          >
                            {{ subject }}
                          </v-chip>

                          <v-spacer></v-spacer>

                          <!-- Price Section -->
                          <div
                            class="d-flex justify-space-between align-center mb-2"
                          >
                            <div class="d-flex align-center">
                              <span
                                class="text-h6 font-weight-bold text-darkgreen"
                              >
                                $19.99
                              </span>
                              <span
                                class="text-caption text-grey text-decoration-line-through ml-2"
                              >
                                $24.99
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
                        <v-card-actions class="pa-3 pt-0">
                          <v-btn
                            block
                            color="darkgreen"
                            variant="elevated"
                            size="large"
                            class="font-weight-medium rounded-xl add-to-cart-btn"
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
                  <!-- <div class="text-center mt-6">
                    <v-btn
                      color="darkgreen"
                      variant="outlined"
                      size="large"
                      rounded="xl"
                      class="font-weight-medium"
                    >
                      <v-icon start>mdi-plus</v-icon>
                      Load More Books
                    </v-btn>
                  </div> -->
                </v-tabs-window-item>
              </v-tabs-window>
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
      @add-to-cart="handleAddToCart"
    ></component>

    <HomeSnackbarAlert
      v-model="showSnackbar"
      :text="snackbarText"
      :color="snackbarColor"
    />

    <!-- Deals of the Day -->
    <!-- <v-container class="mt-8">
        <div class="d-flex justify-space-between align-center mb-4">
          <div class="d-flex align-center">
            <h2 class="text-h5 font-weight-bold mr-4">Deals of the Day</h2>
            <v-chip color="error" class="font-weight-bold">20:15:43:22</v-chip>
          </div>
          <div>
            <v-btn icon variant="text" density="comfortable">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <v-btn icon variant="text" density="comfortable">
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </div>
        </div>
        <v-row>
          <v-col
            v-for="(book, i) in dealsOfDay"
            :key="i"
            cols="12"
            sm="6"
            md="4"
          >
            <v-card class="d-flex" flat>
              <v-img
                :src="book.cover"
                max-width="120"
                height="180"
                cover
                class="rounded-lg"
              ></v-img>
              <div class="ml-4">
                <div class="text-overline">By {{ book.author }}</div>
                <div class="text-subtitle-1 font-weight-medium">
                  {{ book.title }}
                </div>
                <div class="d-flex align-center my-2">
                  <v-rating
                    :model-value="book.rating"
                    color="amber"
                    density="compact"
                    size="small"
                    readonly
                  ></v-rating>
                  <span class="text-caption ml-1">{{ book.reviews }}</span>
                </div>
                <div class="d-flex align-center mb-2">
                  <span
                    class="text-caption text-decoration-line-through mr-2"
                    >{{ book.oldPrice }}</span
                  >
                  <span class="text-subtitle-1 font-weight-bold text-error">{{
                    book.price
                  }}</span>
                </div>
                <v-card-actions>
                  <v-btn
                    block
                    color="white"
                    class="bg-darkgreen rounded-xl"
                    size="small"
                  >
                    Add To Cart
                    <v-icon class="ml-1">mdi-cart</v-icon>
                  </v-btn>
                </v-card-actions>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container> -->

    <!-- Why Shop With Us -->
    <HomeWhyShopSection :books="books" />

    <!-- Newsletter -->
    <!-- <v-container class="my-12">
        <v-row justify="center">
          <v-col cols="12" md="8">
            <v-card class="pa-6" flat>
              <div class="d-flex flex-column flex-md-row">
                <div class="mr-md-6 mb-6 mb-md-0">
                  <v-img
                    :src="getPlaceholderImage(150, 100)"
                    max-width="150"
                  ></v-img>
                </div>
                <div class="flex-grow-1">
                  <h3 class="text-h5 font-weight-bold mb-2">
                    Join News Letter
                  </h3>
                  <p class="text-body-2 mb-4">
                    Lorem ipsum is simply dummy text of the printing and
                    typesetting industry.
                  </p>
                  <div class="d-flex">
                    <v-text-field
                      density="compact"
                      variant="outlined"
                      label="Enter email id"
                      hide-details
                      class="mr-2"
                    ></v-text-field>
                    <v-btn color="secondary" rounded>Subscribe</v-btn>
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container> -->
  </div>
</template>

<script>
import BookManga from "../components/home/BookManga.vue";
import BookFiction from "../components/home/BookFiction.vue";
import BookRomance from "../components/home/BookRomance.vue";
import { mapState, mapActions, mapGetters } from "vuex";
import axios from "axios";
import debounce from "lodash/debounce";
export default {
  name: "Home",
  components: {
    BookFiction,
    BookManga,
    BookRomance,
  },
  data() {
    return {
      tab: "historical fiction",
      bookComponents: ["BookFiction", "BookManga", "BookRomance"],
      featuredBooks: Array(6).fill({ cover: this.getPlaceholderImage(70, 50) }),
      bestSellerSubjects: ["historical fiction", "ancient history", "cooking"],
      companyLinks: [
        "About Us",
        "Publisher Partnership",
        "Affiliate Program",
        "Privacy Policy",
        "Disclaimer",
      ],
      accountLinks: [
        "My Orders",
        "My Addresses",
        "My Wishlist",
        "Account Settings",
        "Return Policy",
      ],
      supportLinks: [
        "Terms of Use",
        "How to Shop",
        "Track Your Order",
        "Frequently Asked Questions",
        "Contact Us",
        "Help & Support",
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
        const response = await axios.get(
          "http://localhost:5000/api/books/search",
          {
            params: { title: newQuery },
          }
        );

        this.searchResults = response.data || [];

        console.log("Search Results:", this.searchResults);
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
    await this.getAllBooks();
    // console.log("Current tab:", this.tab);
    // console.log("All books:", this.books);
    // console.log("Filtered books:", this.bestSellersStories);
  },
  methods: {
    ...mapActions("book", ["getAllBooks"]),
    ...mapActions("cart", ["addToCart"]),
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

    getPlaceholderImage(width, height) {
      return `https://via.placeholder.com/${width}x${height}`;
    },
  },
};
</script>

<style>
.position-relative {
  position: relative;
}

.position-absolute {
  position: absolute;
}
</style>
