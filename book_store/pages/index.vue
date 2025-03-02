<template>
  <div class="bg-whitesmoke">
    <!-- Header -->
    <div>
      <!-- Hero Section -->
      <v-container fluid class="pa-0">
        <v-sheet color="whitesmoke" class="py-8">
          <v-container>
            <v-row>
              <v-col cols="12" md="6" class="d-flex align-center">
                <div class="d-flex">
                  <v-img
                    :src="getPlaceholderImage(300, 200)"
                    max-width="200"
                    class="mr-4"
                    alt="Book Cover"
                  ></v-img>
                  <v-img
                    :src="getPlaceholderImage(300, 200)"
                    max-width="200"
                    contain
                    alt="Author"
                  ></v-img>
                </div>
              </v-col>
              <v-col cols="12" md="6" class="d-flex align-center">
                <div>
                  <h1 class="text-h2 font-weight-bold">Clive Cussler</h1>
                  <p class="text-subtitle-1 mb-4">And Boyd Morrison</p>
                  <div class="d-flex align-center mb-4">
                    <v-btn variant="text" class="pl-0">More Info</v-btn>
                    <v-btn color="secondary" rounded class="ml-4">
                      Buy Now
                      <v-icon right>mdi-arrow-right</v-icon>
                    </v-btn>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-sheet>
      </v-container>

      <!-- Search Bar -->
      <v-container>
        <v-card
          class="mx-auto my-8 pa-4"
          max-width="800"
          height="300"
          rounded="xl"
          elevation="12"
        >
          <v-row align="center" justify="center">
            <v-col cols="10">
              <v-text-field
                density="compact"
                variant="outlined"
                label="Search book"
                prepend-inner-icon="mdi-magnify"
                single-line
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="2">
              <v-btn color="primary" block>Search</v-btn>
            </v-col>
          </v-row>
          <v-row class="mt-4">
            <v-col cols="12" class="d-flex justify-center">
              <div v-for="(book, i) in featuredBooks" :key="i" class="mx-2">
                <v-img
                  :src="book.cover"
                  width="50"
                  height="70"
                  class="rounded"
                ></v-img>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-container>

      <!-- Shop by Category -->
      <v-card>
        <v-tabs
          v-model="selectedTab"
          align-tabs="center"
          bg-color="deep-purple-accent-4"
          stacked
        >
          <v-tab
            v-for="(category, i) in shopCategories"
            :key="i"
            :value="category.name"
          >
            <v-icon :icon="category.icon"></v-icon>
            {{ category.name }}
          </v-tab>
        </v-tabs>

        <v-tabs-window v-model="selectedTab">
          <v-tabs-window-item
            v-for="(category, i) in shopCategories"
            :key="i"
            :value="category.name"
          >
            <v-container>
              <v-row>
                <v-col cols="6" sm="4" md="2">
                  <v-card class="pa-4" variant="outlined" rounded="lg">
                    <div class="d-flex flex-column align-center">
                      <v-avatar color="grey-lighten-3" size="50" class="mb-2">
                        <v-icon :icon="category.icon" color="primary"></v-icon>
                      </v-avatar>
                      <span class="text-body-2 text-center">{{
                        category.name
                      }}</span>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card>

      <v-window v-model="selectedTab">
        <v-window-item
          v-for="(category, i) in shopCategories"
          :key="i"
          :value="category.name"
        >
          <v-container>
            <v-row>
              <v-col cols="6" sm="4" md="2">
                <v-card class="pa-4" variant="outlined" rounded="lg">
                  <div class="d-flex flex-column align-center">
                    <v-avatar color="grey-lighten-3" size="50" class="mb-2">
                      <v-icon :icon="category.icon" color="primary"></v-icon>
                    </v-avatar>
                    <span class="text-body-2 text-center">{{
                      category.name
                    }}</span>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-window-item>
      </v-window>

      <!-- New Arrivals -->
      <v-container class="mt-8">
        <div class="d-flex justify-space-between align-center mb-4">
          <h2 class="text-h5 font-weight-bold">New Arrivals</h2>
        </div>
        <v-row>
          <v-col
            v-for="(book, i) in getNewArrivalBooks"
            :key="i"
            cols="6"
            sm="4"
            md="2"
          >
            <v-card class="h-100">
              <div class="position-relative">
                <v-img
                  class=""
                  :src="book.coverImage"
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
                <div class="text-subtitle-2 font-weight-medium">
                  {{ book.title }}
                </div>
                <div class="d-flex justify-space-between align-center mt-2">
                  <div>
                    <span class="text-subtitle-2 font-weight-bold ml-1">{{
                      book.price
                    }}</span>
                  </div>
                </div>
              </v-card-text>
              <v-card-actions>
                <v-btn block color="primary" variant="outlined" size="small">
                  Add To Cart <v-icon right>mdi-cart</v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- Best Selling Books -->
      <v-container class="mt-8">
        <v-card elevation="2" color="grey-lighten-4" class="pa-4 rounded-xl">
          <div class="d-flex justify-space-between align-center mb-4">
            <h2 class="text-h5 font-weight-bold">Best Selling Books</h2>
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
            <v-col cols="12" md="3">
              <v-list density="compact" class="bg-transparent">
                <v-list-subheader>Historical Biographies</v-list-subheader>
                <v-list-item
                  v-for="(category, i) in biographyCategories"
                  :key="i"
                  :value="category"
                  rounded
                  :active="i === 1"
                  active-color="primary"
                >
                  <v-list-item-title>{{ category }}</v-list-item-title>
                </v-list-item>
                <v-list-item class="mt-4">
                  <v-btn variant="text" color="primary" class="px-0">
                    View More <v-icon right>mdi-chevron-right</v-icon>
                  </v-btn>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12" md="9">
              <v-row>
                <v-col
                  v-for="(book, i) in bestSellers"
                  :key="i"
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <v-card class="h-100">
                    <div class="position-relative">
                      <v-img :src="book.cover" height="220" cover></v-img>
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
                        <span class="text-caption ml-1">{{
                          book.reviews
                        }}</span>
                      </div>
                      <div class="text-subtitle-2 font-weight-medium">
                        {{ book.title }}
                      </div>
                      <div
                        class="d-flex justify-space-between align-center mt-2"
                      >
                        <div>
                          <span
                            class="text-caption text-decoration-line-through"
                            >{{ book.oldPrice }}</span
                          >
                          <span class="text-subtitle-2 font-weight-bold ml-1">{{
                            book.price
                          }}</span>
                        </div>
                      </div>
                    </v-card-text>
                    <v-card-actions>
                      <v-btn
                        block
                        color="primary"
                        variant="outlined"
                        size="small"
                      >
                        Add To Cart <v-icon right>mdi-cart</v-icon>
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card>
      </v-container>

      <!-- Deals of the Day -->
      <v-container class="mt-8">
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
                <v-btn color="primary" variant="outlined" size="small">
                  Add To Cart <v-icon right>mdi-cart</v-icon>
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- Why Shop With Us -->
      <v-container fluid class="mt-12 py-12" style="background-color: #dcf763">
        <v-container>
          <v-row>
            <v-col cols="12" md="6" class="position-relative">
              <div class="position-relative" style="height: 400px">
                <div
                  v-for="(book, i) in floatingBooks"
                  :key="i"
                  class="position-absolute"
                  :style="`top: ${book.top}; left: ${book.left}; z-index: ${book.zIndex}`"
                >
                  <v-img
                    :src="book.cover"
                    :width="book.width"
                    :height="book.height"
                    class="rounded-lg"
                  ></v-img>
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="6" class="d-flex align-center">
              <div>
                <h2 class="text-h3 font-weight-bold mb-4">Why Shop with Us?</h2>
                <p class="text-body-1 mb-6">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut
                  vel commodo ex. Donec auctor velit placerat leo. Ut vel
                  commodo ex.
                </p>
                <p class="text-body-1 mb-6">
                  It has survived not only five centuries, but also the leap
                  into electronic typesetting, remaining essentially unchanged.
                  It was popularised in the 1960s with the release of Letraset
                  sheets containing Lorem Ipsum passages.
                </p>
                <v-btn color="primary" rounded> Learn More </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-container>

      <!-- Newsletter -->
      <v-container class="my-12">
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
      </v-container>

      <!-- Footer -->
      <v-footer class="bg-white">
        <v-container>
          <v-row>
            <v-col cols="12" md="3">
              <div class="d-flex align-center mb-4">
                <v-icon icon="mdi-book-open-page-variant" class="mr-2"></v-icon>
                <span class="text-h6 font-weight-bold">BookArt</span>
              </div>
              <div class="text-body-2 mb-1">Contact Info:</div>
              <div class="text-body-2 mb-1">
                Address: 1234 Bookstore Drive & 4th Ave
              </div>
              <div class="text-body-2 mb-1">Phone: +1 (123) 456-7890</div>
              <div class="text-body-2 mb-4">Email: info@bookart.com</div>
              <div class="text-body-2 mb-2">Follow Us:</div>
              <div class="d-flex">
                <v-btn icon variant="text" color="primary">
                  <v-icon>mdi-facebook</v-icon>
                </v-btn>
                <v-btn icon variant="text" color="primary">
                  <v-icon>mdi-twitter</v-icon>
                </v-btn>
                <v-btn icon variant="text" color="primary">
                  <v-icon>mdi-instagram</v-icon>
                </v-btn>
              </div>
            </v-col>
            <v-col cols="12" md="3">
              <h3 class="text-subtitle-1 font-weight-bold mb-4">Company</h3>
              <v-list density="compact" class="pa-0 bg-transparent">
                <v-list-item
                  v-for="(item, i) in companyLinks"
                  :key="i"
                  :value="item"
                  class="px-0"
                  density="compact"
                >
                  <v-list-item-title class="text-body-2">{{
                    item
                  }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12" md="3">
              <h3 class="text-subtitle-1 font-weight-bold mb-4">My Account</h3>
              <v-list density="compact" class="pa-0 bg-transparent">
                <v-list-item
                  v-for="(item, i) in accountLinks"
                  :key="i"
                  :value="item"
                  class="px-0"
                  density="compact"
                >
                  <v-list-item-title class="text-body-2">{{
                    item
                  }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12" md="3">
              <h3 class="text-subtitle-1 font-weight-bold mb-4">Support</h3>
              <v-list density="compact" class="pa-0 bg-transparent">
                <v-list-item
                  v-for="(item, i) in supportLinks"
                  :key="i"
                  :value="item"
                  class="px-0"
                  density="compact"
                >
                  <v-list-item-title class="text-body-2">{{
                    item
                  }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
          <v-divider class="my-4"></v-divider>
          <div class="text-center text-body-2">
            All Rights Reserved Copyright © 2024
          </div>
        </v-container>
      </v-footer>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
export default {
  data() {
    return {
      categories: [
        "Fiction",
        "Non-Fiction",
        "Children",
        "Biography",
        "History",
        "Science",
        "Self-Help",
      ],
      featuredBooks: Array(6).fill({ cover: this.getPlaceholderImage(70, 50) }),
      shopCategories: [
        { name: "Best Fiction", icon: "mdi-book-open-variant" },
        { name: "Fiction", icon: "mdi-book" },
        { name: "History", icon: "mdi-history" },
        { name: "Poetry", icon: "mdi-feather" },
        { name: "Thrill", icon: "mdi-lightning-bolt" },
        { name: "Astronaut", icon: "mdi-rocket" },
      ],
      newArrivals: this.generateBooks(6, 220, 150),
      biographyCategories: [
        "Historical Biographies",
        "Leaders & Notable People",
        "Modern Biographies",
        "Sports Biographies",
        "United States Biographies",
        "Artists & Entertainers",
      ],
      bestSellers: this.generateBooks(3, 220, 150),
      dealsOfDay: this.generateDeals(3, 180, 120),
      floatingBooks: this.generateFloatingBooks(),
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
    };
  },
  computed: {
    ...mapState("book", ["books"]),
    getNewArrivalBooks() {
      return this.books.filter((book) => book.isNewArrival);
    },
  },
  async mounted() {
    await this.getAllBooks();
    console.log(this.books);
  },
  methods: {
    ...mapActions("book", ["getAllBooks"]),
    getPlaceholderImage(width, height) {
      return `https://via.placeholder.com/${width}x${height}`;
    },
    generateBooks(count, width, height) {
      return Array.from({ length: count }, () => ({
        title: "Title of Book",
        cover: this.getPlaceholderImage(width, height),
        rating: (Math.random() * (5 - 4) + 4).toFixed(1),
        reviews: "157 Reviews",
        price: "$15.00",
        oldPrice: "$20.00",
      }));
    },
    generateDeals(count, width, height) {
      const authors = ["John Author", "Jane Author", "Sam Author"];
      return Array.from({ length: count }, (_, i) => ({
        title: "Title of Book",
        author: authors[i % authors.length],
        cover: this.getPlaceholderImage(width, height),
        rating: (Math.random() * (5 - 4) + 4).toFixed(1),
        reviews: "157 Reviews",
        price: "$15.00",
        oldPrice: "$20.00",
      }));
    },
    generateFloatingBooks() {
      return [
        {
          cover: this.getPlaceholderImage(180, 120),
          top: "20px",
          left: "20px",
          width: "120px",
          height: "180px",
          zIndex: 3,
        },
        {
          cover: this.getPlaceholderImage(180, 120),
          top: "100px",
          left: "150px",
          width: "120px",
          height: "180px",
          zIndex: 2,
        },
        {
          cover: this.getPlaceholderImage(180, 120),
          top: "200px",
          left: "50px",
          width: "120px",
          height: "180px",
          zIndex: 1,
        },
        {
          cover: this.getPlaceholderImage(180, 120),
          top: "150px",
          left: "250px",
          width: "120px",
          height: "180px",
          zIndex: 4,
        },
      ];
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
