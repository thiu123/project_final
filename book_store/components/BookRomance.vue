<template>
  <v-container class="mt-8">
    <div class="d-flex justify-space-between align-center mb-4">
      <h2 class="text-h5 font-weight-bold">Romance</h2>
      <v-hover v-slot="{ isHovering, props }">
        <v-btn
          @click="() => $router.push(`/subjects/romance`)"
          v-bind="props"
          icon
          size="x-small"
          :class="['custom-expand-btn', { 'is-hovering': isHovering }]"
          color="customyellow"
          elevation="0"
        >
          <v-slide-x-transition>
            <div v-if="!isHovering" class="d-flex align-center">
              <v-icon>mdi-chevron-right</v-icon>
            </div>
            <div v-else class="d-flex align-center">
              <span class="text-subtitle-1">View Details</span>
              <v-icon>mdi-chevron-right</v-icon>
            </div>
          </v-slide-x-transition>
        </v-btn>
      </v-hover>
    </div>
    <v-row v-if="romanceBooks.length">
      <v-col
        v-for="(book, i) in limitedRomanceBooks"
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
              <v-img width="28px" height="28px" src="../assets/heart.svg" />
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
          <v-card-actions class="">
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
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  computed: {
    ...mapState("book", ["romanceBooks"]),
    limitedRomanceBooks() {
      return this.romanceBooks.slice(0, 6);
    },
  },
  methods: {
    ...mapActions("book", ["getRomanceBooks"]),
  },
  async mounted() {
    try {
      await this.getRomanceBooks("romance");
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  },
};
</script>
<style scoped>
.custom-expand-btn {
  border: 1px solid #435058 !important;
  transition: all 0.3s ease !important;
  overflow: hidden !important;
}

.custom-expand-btn.is-hovering {
  min-width: 150px !important;
  border-radius: 20px;
}
</style>
