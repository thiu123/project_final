<template>
  <!-- Header -->
  <div>
    <!-- Hero Section -->
    <v-container fluid class="pa-0">
      <v-sheet style="background:none;">
        <!-- Background decoration -->
        <div class="hero-decoration"></div>

        <v-container class="position-relative">
          <v-row align="center" justify="center">
            <v-col cols="12" md="6" class="text-center">
              <div class="book-showcase">
                <div class="book-shadow"></div>
                <v-img
                  :src="books[0]?.cover_url"
                  width="280"
                  height="380"
                  class="book-cover mx-auto rounded-xl"
                  :alt="books[0]?.title"
                  cover
                >
                  <template v-slot:placeholder>
                    <v-row
                      class="fill-height ma-0"
                      align="center"
                      justify="center"
                    >
                      <v-progress-circular
                        indeterminate
                        color="white"
                      ></v-progress-circular>
                    </v-row>
                  </template>
                </v-img>

                <!-- Rating badge -->
                <v-chip
                  class="mt-2"
                  color="amber"
                  text-color="amber-darken-4"
                  size="small"
                >
                  <v-icon start size="small">mdi-star</v-icon>
                  4.8
                </v-chip>
              </div>
            </v-col>

            <v-col cols="12" md="6" class="text-center text-md-left">
              <div class="hero-content">
                <v-chip
                  color="primary"
                  variant="flat"
                  class="mb-4 text-white font-weight-bold text-capitalize"
                  size="small"
                >
                  {{ books[0]?.subjects[0] }}
                </v-chip>

                <h1 class="text-black mb-2">
                  {{ books[0]?.title }}
                </h1>

                <p class="text-gray mb-2">By {{ books[0]?.authors[0] }}</p>
                <div
                  class="d-flex flex-column flex-sm-row ga-4 justify-center justify-md-start"
                >
                  <v-btn
                    size="large"
                    variant="elevated"
                    color="primary"
                    class="text-white font-weight-bold"
                    @click="$router.push(`/details/${books[0]._id}`)"
                    prepend-icon="mdi-information"
                  >
                    More Info
                  </v-btn>

                  <v-btn
                    size="large"
                    variant="flat"
                    color="darkgreen"
                    class="hero-btn-secondary"
                    @click="addToCart(books[0])"
                    append-icon="mdi-cart-plus"
                  >
                    Add to Cart
                  </v-btn>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-sheet>
    </v-container>

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
                  <v-img
                    :src="book.cover"
                    width="70"
                    height="95"
                    cover
                  ></v-img>
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
    ></component>

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
    <v-container
      fluid
      class="mt-12 py-16 why-shop-section"
      style="background: linear-gradient(135deg, #dcf763 0%, #c8e6c9 100%)"
    >
      <v-container class="max-width-container">
        <v-row align="center" class="min-height-row">
          <!-- Enhanced Floating Books Section -->
          <v-col cols="12" md="6" class="position-relative books-container">
            <div class="floating-books-wrapper position-relative">
              <!-- Background Decorative Elements -->
              <div class="decorative-circle circle-1"></div>
              <div class="decorative-circle circle-2"></div>
              <div class="decorative-circle circle-3"></div>

              <!-- Enhanced Floating Books -->
              <div
                class="position-absolute floating-book"
                style="top: 50%; left: 50%; transform: translate(-50%, -50%);"
              >
                <div
                  class="book-card rounded-xl"
                  style="width: 210px; transition: all 0.3s ease"
                  :style="{
                    transform: 'rotate(-15deg)',
                    boxShadow:
                      '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
                  }"
                >
                  <v-img
                    :src="books[1]?.cover_url"
                    class="rounded-xl book-image"
                    height="320"
                    cover
                    style="filter: brightness(1.1)"
                  >
                    <template v-slot:placeholder>
                      <div
                        class="d-flex align-center justify-center fill-height"
                      >
                        <v-progress-circular
                          color="primary"
                          indeterminate
                        ></v-progress-circular>
                      </div>
                    </template>

                    <!-- Enhanced Glow Effect -->
                    <div
                      style="
                        position: absolute;
                        inset: 0;
                        border-radius: 12px;
                        background: radial-gradient(
                          circle at 50% 50%,
                          rgba(255, 255, 255, 0.2) 0%,
                          rgba(255, 255, 255, 0) 70%
                        );
                        pointer-events: none;
                      "
                    ></div>
                  </v-img>

                  <!-- Enhanced Book Glow -->
                  <div
                    style="
                      position: absolute;
                      inset: -15px;
                      border-radius: 16px;
                      background: radial-gradient(
                        circle at 50% 50%,
                        rgba(76, 175, 80, 0.15) 0%,
                        rgba(76, 175, 80, 0) 70%
                      );
                      filter: blur(15px);
                      z-index: -1;
                    "
                  ></div>
                </div>
              </div>
              <!-- Additional Floating Elements -->
              <div class="floating-element star-1">
                <v-icon color="amber" size="24">mdi-star</v-icon>
              </div>
              <div class="floating-element star-2">
                <v-icon color="orange" size="20">mdi-star</v-icon>
              </div>
              <div class="floating-element heart-1">
                <v-icon color="red" size="18">mdi-heart</v-icon>
              </div>
            </div>
          </v-col>

          <!-- Enhanced Content Section -->
          <v-col cols="12" md="6" class="content-section">
            <div class="content-wrapper">
              <!-- Enhanced Header -->
              <div class="mb-6">
                <v-chip
                  color="darkgreen"
                  variant="elevated"
                  size="large"
                  class="mb-4 chip-badge"
                >
                  <v-icon start size="small">mdi-shield-check</v-icon>
                  Why Choose Us
                </v-chip>

                <h2 class="display-1 font-weight-bold mb-4 main-title">
                  Why Shop with Us?
                </h2>
              </div>

              <!-- Enhanced Features List -->
              <div class="features-list mb-8">
                <div class="feature-item d-flex align-start mb-4">
                  <v-avatar
                    color="darkgreen"
                    size="48"
                    class="mr-4 feature-icon"
                  >
                    <v-icon color="white" size="24">mdi-truck-fast</v-icon>
                  </v-avatar>
                  <div>
                    <h4 class="text-h6 font-weight-bold mb-2 text-darkgreen">
                      Fast & Free Delivery
                    </h4>
                    <p class="text-body-1 text-grey-darken-1">
                      Get your books delivered quickly with our free shipping on
                      orders over $25.
                    </p>
                  </div>
                </div>

                <div class="feature-item d-flex align-start mb-4">
                  <v-avatar color="orange" size="48" class="mr-4 feature-icon">
                    <v-icon color="white" size="24"
                      >mdi-book-open-variant</v-icon
                    >
                  </v-avatar>
                  <div>
                    <h4 class="text-h6 font-weight-bold mb-2 text-darkgreen">
                      Vast Collection
                    </h4>
                    <p class="text-body-1 text-grey-darken-1">
                      Discover millions of books across all genres and
                      categories in our extensive library.
                    </p>
                  </div>
                </div>

                <div class="feature-item d-flex align-start mb-4">
                  <v-avatar color="blue" size="48" class="mr-4 feature-icon">
                    <v-icon color="white" size="24">mdi-shield-star</v-icon>
                  </v-avatar>
                  <div>
                    <h4 class="text-h6 font-weight-bold mb-2 text-darkgreen">
                      Quality Guarantee
                    </h4>
                    <p class="text-body-1 text-grey-darken-1">
                      All our books are carefully selected and quality-checked
                      before shipping.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Enhanced Action Buttons -->
              <div class="action-buttons d-flex flex-wrap ga-4">
                <v-btn
                  color="darkgreen"
                  variant="elevated"
                  size="x-large"
                  rounded="xl"
                  class="font-weight-bold action-btn primary-btn"
                  elevation="4"
                >
                  <v-icon start size="small">mdi-rocket-launch</v-icon>
                  Learn More
                </v-btn>

                <v-btn
                  color="white"
                  variant="elevated"
                  size="x-large"
                  rounded="xl"
                  class="font-weight-bold action-btn secondary-btn text-darkgreen"
                  elevation="2"
                >
                  <v-icon start size="small">mdi-phone</v-icon>
                  Contact Us
                </v-btn>
              </div>

              <!-- Stats Section -->
              <div class="stats-section mt-8">
                <v-row>
                  <v-col cols="4">
                    <div class="text-center stat-item">
                      <h3 class="text-h4 font-weight-bold text-darkgreen">
                        10K+
                      </h3>
                      <p class="text-caption text-grey-darken-1">
                        Happy Customers
                      </p>
                    </div>
                  </v-col>
                  <v-col cols="4">
                    <div class="text-center stat-item">
                      <h3 class="text-h4 font-weight-bold text-darkgreen">
                        50K+
                      </h3>
                      <p class="text-caption text-grey-darken-1">
                        Books Available
                      </p>
                    </div>
                  </v-col>
                  <v-col cols="4">
                    <div class="text-center stat-item">
                      <h3 class="text-h4 font-weight-bold text-darkgreen">
                        99%
                      </h3>
                      <p class="text-caption text-grey-darken-1">
                        Satisfaction Rate
                      </p>
                    </div>
                  </v-col>
                </v-row>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-container>

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
import BookManga from "../components/BookManga.vue";
import BookFiction from "../components/BookFiction.vue";
import BookRomance from "../components/BookRomance.vue";
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
      bestSellerSubjects: [
        "historical fiction",
        "ancient history",
        "cooking",
      ],
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
