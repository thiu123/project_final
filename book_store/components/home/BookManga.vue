<template>
  <v-container class="mt-12">
    <!-- Enhanced Header Section -->
    <div class="d-flex justify-space-between align-center mb-8">
      <div class="d-flex align-center">
        <div class="category-icon-wrapper mr-4">
          <v-icon size="32" color="darkgreen">mdi-book-open-variant</v-icon>
        </div>
        <div>
          <h2 class="text-h4 font-weight-bold text-darkgreen mb-1">
            Manga & Comics
          </h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Explore captivating visual stories and graphic novels
          </p>
        </div>
      </div>

      <v-hover v-slot="{ isHovering, props }">
        <v-btn
          @click="$router.push(`/subjects/manga`)"
          v-bind="props"
          :class="['view-all-btn', { 'is-hovering': isHovering }]"
          color="darkgreen"
          variant="outlined"
          size="large"
          rounded="pill"
          elevation="0"
        >
          <span class="text-subtitle-1 font-weight-medium">View All</span>
          <v-icon class="ml-2" :class="{ 'rotate-icon': isHovering }"
            >mdi-arrow-right</v-icon
          >
        </v-btn>
      </v-hover>
    </div>

    <!-- Enhanced Loading Skeletons -->
    <v-row v-if="isLoading && mangaBooks.length === 0">
      <v-col v-for="i in 6" :key="i" cols="6" sm="4" md="2">
        <v-sheet
          rounded="xl"
          class="pa-0 h-100 book-skeleton"
          style="overflow: hidden; border: 1px solid rgba(0, 0, 0, 0.08)"
        >
          <v-skeleton-loader
            type="image"
            height="220"
            class="rounded-t-xl"
          ></v-skeleton-loader>
          <div class="pa-4">
            <v-skeleton-loader
              type="text@2,actions"
              class="rounded-lg"
            ></v-skeleton-loader>
          </div>
        </v-sheet>
      </v-col>
    </v-row>

    <!-- Enhanced Manga Books Grid -->
    <v-row v-else>
      <v-col
        v-for="(book, i) in limitedMangaBooks"
        :key="i"
        cols="6"
        sm="4"
        md="2"
        class="d-flex"
      >
        <v-hover v-slot="{ isHovering, props }">
          <v-sheet
            v-bind="props"
            rounded="xl"
            class="d-flex flex-column h-100 w-100 book-card"
            @click="$router.push(`/details/${book._id}`)"
            :elevation="isHovering ? 8 : 2"
            :style="{
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isHovering ? 'translateY(-8px) scale(1.02)' : 'none',
              border: '1px solid rgba(0,0,0,0.08)',
            }"
          >
            <!-- Enhanced Book Cover -->
            <div class="position-relative book-cover-container">
              <v-img
                :src="book.cover_url"
                height="220"
                cover
                class="rounded-t-xl"
              >
                <template v-slot:placeholder>
                  <div class="d-flex align-center justify-center fill-height">
                    <v-progress-circular
                      indeterminate
                      color="primary"
                      size="32"
                    ></v-progress-circular>
                  </div>
                </template>
              </v-img>

              <!-- Enhanced Favorite Button -->
              <v-btn
                icon
                variant="text"
                class="position-absolute favorite-btn"
                style="top: 12px; right: 12px"
                size="small"
                @click.stop="handleToggleFavorites(book._id)"
              >
                <v-icon
                  :color="isFavorite(book._id) ? 'red' : 'grey-lighten-4'"
                  size="24"
                >
                  {{ isFavorite(book._id) ? "mdi-heart" : "mdi-heart-outline" }}
                </v-icon>
              </v-btn>

              <!-- Quick View Overlay -->
              <!-- <div
                v-if="isHovering"
                class="position-absolute d-flex align-center justify-center quick-view-overlay"
              >
                <v-btn
                  color="white"
                  variant="flat"
                  size="small"
                  rounded="pill"
                  class="px-4 py-2 quick-view-btn"
                  elevation="4"
                >
                  <v-icon size="small" class="mr-2">mdi-eye</v-icon>
                  Quick View
                </v-btn>
              </div> -->

              <!-- Stock Badge -->
              <!-- <v-chip
                color="success"
                variant="flat"
                size="x-small"
                class="position-absolute stock-badge"
                style="top: 12px; left: 12px"
              >
                In Stock
              </v-chip> -->

              <!-- Manga Badge -->
              <v-chip
                color="customyellow"
                variant="flat"
                size="x-small"
                class="position-absolute manga-badge"
                style="bottom: 12px; left: 12px"
              >
                Manga
              </v-chip>
            </div>

            <!-- Enhanced Book Details -->
            <div class="px-4 pt-4 pb-3 flex-grow-1 d-flex flex-column">
              <!-- Enhanced Rating -->
              <div class="d-flex align-center mb-2">
                <v-rating
                  :model-value="book.rating"
                  color="amber"
                  density="compact"
                  size="small"
                  readonly
                  half-increments
                  class="mr-2"
                ></v-rating>
              </div>

              <!-- Enhanced Title -->
              <div
                class="text-subtitle-1 font-weight-medium text-truncate mb-2 book-title"
              >
                {{ book.title }}
              </div>

              <!-- Enhanced Price -->
              <div class="d-flex justify-space-between align-center mt-auto">
                <div class="d-flex align-center">
                  <span class="text-h6 font-weight-bold text-darkgreen"
                    >${{ book.price }}</span
                  >
                </div>
                <v-chip
                  color="customyellow"
                  variant="flat"
                  size="x-small"
                  class="px-2 discount-chip"
                >
                  -15%
                </v-chip>
              </div>
            </div>

            <!-- Enhanced Add to Cart Button -->
            <v-card-actions class="px-4 pb-4 pt-0">
              <v-btn
                color="darkgreen"
                variant="elevated"
                block
                size="large"
                class="text-subtitle-2 font-weight-medium add-to-cart-btn"
                rounded="lg"
                elevation="2"
                @click.stop="$emit('add-to-cart', book._id, 1)"
              >
                <v-icon size="small" class="mr-2">mdi-cart-plus</v-icon>
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
  data() {
    return {
      isLoading: false,
    };
  },
  props: {
    toggleFavorites: {
      type: Function,
      required: true,
    },
    favorites: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    ...mapState("book", ["mangaBooks"]),
    limitedMangaBooks() {
      return this.mangaBooks.slice(0, 6);
    },
  },
  methods: {
    ...mapActions("book", ["getMangaBooks"]),
    async handleToggleFavorites(bookId) {
      try {
        await this.toggleFavorites(bookId);
      } catch (error) {
        console.error("Error toggling favorites:", error);
      }
    },
    isFavorite(bookId) {
      return this.favorites.some((favorite) => {
        const favoriteBookId = favorite.bookId?._id || favorite.bookId;
        return favoriteBookId === bookId;
      });
    },
  },
  async mounted() {
    if (this.mangaBooks.length === 0) {
      this.isLoading = true;
      try {
        await this.getMangaBooks({ subject: "manga", half: true });
      } catch (error) {
        console.error("Error fetching books:", error);
      }
      this.isLoading = false;
    }
  },
};
</script>

<style scoped>
.category-icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(67, 80, 88, 0.15);
}

.view-all-btn {
  border: 2px solid #435058 !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  overflow: hidden !important;
  min-width: 140px !important;
}

.view-all-btn.is-hovering {
  background: #435058 !important;
  color: white !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(67, 80, 88, 0.3);
}

.rotate-icon {
  transform: translateX(4px);
  transition: transform 0.3s ease;
}

.book-skeleton {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.book-card {
  background: white;
  overflow: hidden;
  cursor: pointer;
}

.book-card:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
}

.book-cover-container {
  overflow: hidden;
}

.book-cover-container .v-img {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.book-card:hover .book-cover-container .v-img {
  transform: scale(1.05);
}

.favorite-btn {
  opacity: 0.9;
  transition: all 0.3s ease;
}

.favorite-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

/* .quick-view-overlay {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(3px);
  transition: all 0.3s ease;
} */

.quick-view-btn {
  font-weight: 600;
  letter-spacing: 0.5px;
}

.stock-badge {
  font-weight: 600;
  letter-spacing: 0.5px;
}

.manga-badge {
  font-weight: 600;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%) !important;
  color: #2c3e50 !important;
}

.book-title {
  line-height: 1.3;
  color: #2c3e50;
}

.discount-chip {
  font-weight: 600;
  letter-spacing: 0.5px;
}

.add-to-cart-btn {
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
}

.add-to-cart-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(67, 80, 88, 0.3);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .category-icon-wrapper {
    width: 50px;
    height: 50px;
  }

  .text-h4 {
    font-size: 1.5rem !important;
  }

  .view-all-btn {
    min-width: 120px !important;
    font-size: 0.875rem !important;
  }
}
</style>
