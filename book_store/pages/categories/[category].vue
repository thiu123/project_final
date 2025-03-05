<template>
  <div>
    <v-container>
      <v-row>
        <!-- Category Card -->
        <v-col cols="12" sm="3">
          <v-card>
            <v-card-title class="text-h6">Category</v-card-title>
            <v-list>
              <v-list-item
                v-for="(item, i) in categories"
                :key="i"
                :value="item"
                @click="$router.push(`/categories/${encodeURIComponent(item)}`)"
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
          <v-row>
            <v-col
              v-for="(book, i) in getBookListBasedOnCategory"
              :key="i"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-card class="h-100 bg-transparent" elevation="2">
                <div class="position-relative">
                  <v-img :src="book.coverImage" height="250" cover></v-img>
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
                      {{ book.price }}
                    </span>
                  </div>
                </v-card-text>
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
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
export default {
  data() {
    return {
      categories: [
        "Fiction",
        "Mystery & Thriller",
        "Fantasy",
        "Romance",
        "Manga & Graphic Novels",
        "Self-Help & Personal Development",
        "Biography & Memoir",
        "History & Politics",
        "IT & Programming",
      ],
      prices: ["Under $10", "$10 - $20", "$20 - $30", "Above $50"],
      selectedPrice: [],
    };
  },
  computed: {
    ...mapState("book", ["books"]),
    getBookListBasedOnCategory() {
      console.log("Route category:", this.$route.params.category);
      console.log("Books data:", this.books);
      const category = decodeURIComponent(this.$route.params.category);
      return this.books.filter((book) => book.category.includes(category));
    },
  },
  methods: {
    ...mapActions("book", ["getAllBooks"]),
  },
  async mounted() {
    await this.getAllBooks();
  },
};
</script>

<style scoped>
.custom-btn:hover {
  color: #f4ce70 !important;
}
</style>
