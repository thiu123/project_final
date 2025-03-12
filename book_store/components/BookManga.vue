<template>
  <v-container class="mt-8">
    <div class="d-flex justify-space-between align-center mb-4">
      <h2 class="text-h5 font-weight-bold">Manga</h2>
    </div>
    <v-row v-if="mangaBooks.length">
      <v-col
        v-for="(book, i) in limitedMangaBooks"
        :key="i"
        cols="6"
        sm="4"
        md="2"
      >
        <div class="h-100 bg-transparent" elevation="2">
          <div class="position-relative">
            <v-img
              class="rounded-xl cursor-pointer"
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
              <span class="text-caption">{{ book.reviews }}</span>
            </div>
            <div class="text-subtitle-2 text-truncate">
              {{ book.title }}
            </div>
            <div class="d-flex justify-space-between align-center mt-1">
              <div>
                <span class="text-subtitle-2">{{ book.price }} $</span>
              </div>
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
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  computed: {
    ...mapState("book", ["mangaBooks"]),
    limitedMangaBooks() {
      return this.mangaBooks.slice(0, 6);
    },
  },
  methods: {
    ...mapActions("book", ["getMangaBooks"]),
  },
  async mounted() {
    try {
      await this.getMangaBooks("manga");
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  },
};
</script>
