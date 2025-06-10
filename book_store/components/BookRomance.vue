<template>
  <v-container class="mt-8">
    <!-- Header Section -->
    <div class="d-flex justify-space-between align-center mb-6">
      <h2 class="text-h5 font-weight-bold text-darkgreen">Romance</h2>

      <v-hover v-slot="{ isHovering, props }">
        <v-btn
          @click="$router.push(`/subjects/romance`)"
          v-bind="props"
          icon
          size="x-small"
          :class="['custom-expand-btn', { 'is-hovering': isHovering }]"
          color="customyellow"
          elevation="0"
        >
          <div class="d-flex align-center">
            <span v-if="isHovering" class="text-subtitle-1 view-details"
              >View All</span
            >
            <v-icon>mdi-chevron-right</v-icon>
          </div>
        </v-btn>
      </v-hover>
    </div>

    <!-- Loading Skeletons -->
    <v-row v-if="isLoading && romanceBooks.length === 0">
      <v-col v-for="i in 6" :key="i" cols="6" sm="4" md="2">
        <v-sheet
          rounded="lg"
          class="pa-0 h-100"
          style="overflow: hidden; border: 1px solid rgba(0, 0, 0, 0.05)"
        >
          <v-skeleton-loader type="image" height="200"></v-skeleton-loader>
          <div class="pa-3">
            <v-skeleton-loader type="text@2,actions"></v-skeleton-loader>
          </div>
        </v-sheet>
      </v-col>
    </v-row>

    <!-- Romance Books Grid -->
    <v-row v-else>
      <v-col
        v-for="(book, i) in limitedRomanceBooks"
        :key="i"
        cols="6"
        sm="4"
        md="2"
        class="d-flex"
      >
        <v-hover v-slot="{ isHovering, props }">
          <v-sheet
            v-bind="props"
            rounded="lg"
            class="d-flex flex-column h-100 w-100"
            :elevation="isHovering ? 4 : 1"
            :style="{
              transition: 'all 0.3s ease',
              transform: isHovering ? 'translateY(-5px)' : 'none',
              border: '1px solid rgba(0,0,0,0.05)',
            }"
          >
            <!-- Book Cover -->
            <div class="position-relative">
              <v-img
                :src="book.cover_url"
                height="200"
                cover
                class="rounded-t-lg"
              >
                <template v-slot:placeholder>
                  <div class="d-flex align-center justify-center fill-height">
                    <v-progress-circular
                      indeterminate
                      color="customyellow"
                    ></v-progress-circular>
                  </div>
                </template>
              </v-img>

              <!-- Favorite Button -->
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

            <!-- Book Details -->
            <div class="px-3 pt-3 pb-2 flex-grow-1 d-flex flex-column">
              <!-- Rating -->
              <div class="d-flex align-center mb-1">
                <v-rating
                  :model-value="book.rating"
                  color="amber"
                  density="compact"
                  size="small"
                  readonly
                  half-increments
                ></v-rating>
                <span class="text-caption text-medium-emphasis ml-1">{{
                  book.reviews
                }}</span>
              </div>

              <!-- Title -->
              <div class="text-subtitle-2 text-truncate mb-1">
                {{ book.title }}
              </div>

              <!-- Price -->
              <div
                class="d-flex justify-space-between align-center mt-auto mb-2"
              >
                <div class="d-flex align-center">
                  <span class="text-subtitle-1">${{ book.price }}</span>
                </div>
                <v-chip
                  color="success"
                  variant="flat"
                  size="x-small"
                  class="px-2"
                >
                  In Stock
                </v-chip>
              </div>
            </div>

            <!-- Add to Cart Button -->
            <v-card-actions class="px-3 pb-3 pt-0">
              <v-btn
                color="darkgreen"
                variant="elevated"
                block
                size="small"
                class="text-subtitle-2 font-weight-medium"
              >
                <v-icon size="small" class="mr-1">mdi-cart</v-icon>
                Add to Cart
              </v-btn>
            </v-card-actions>
          </v-sheet>
        </v-hover>
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
      await this.getRomanceBooks("contemporary romance");
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
