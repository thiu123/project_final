<template>
  <v-container max-width="1500" class="mt-12">
    <!-- Enhanced Header Section -->
    <div class="d-flex justify-space-between align-center mb-8">
      <div class="d-flex align-center">
        <div class="category-icon-wrapper mr-4">
          <v-icon size="32" color="darkgreen">mdi-heart</v-icon>
        </div>
        <div>
          <h2 class="text-h4 font-weight-bold text-darkgreen mb-1">Romance</h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Fall in love with heartwarming stories and passionate tales
          </p>
        </div>
      </div>

      <v-hover v-slot="{ isHovering, props }">
        <v-btn
          @click="
            $router.push(
              `/subjects/${encodeURIComponent('contemporary romance')}`
            )
          "
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
    <div v-if="isLoading && romanceBooks.length === 0">
      <swiper
        :slides-per-view="2"
        :space-between="16"
        :loop="true"
        :breakpoints="{
          640: { slidesPerView: 3, spaceBetween: 16 },
          960: { slidesPerView: 4, spaceBetween: 20 },
          1280: { slidesPerView: 6, spaceBetween: 24 },
        }"
      >
        <swiper-slide v-for="i in 6" :key="i">
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
        </swiper-slide>
      </swiper>
    </div>

    <!-- Enhanced Romance Books Swiper -->
    <div v-else class="swiper-container-wrapper">
      <!-- Custom Previous Button -->
      <v-btn
        icon
        size="small"
        class="swiper-button-custom swiper-button-prev-custom"
        @click="slidePrev"
        elevation="2"
      >
        <v-icon size="x-large">mdi-chevron-left</v-icon>
      </v-btn>

      <swiper
        ref="romanceSwiper"
        :modules="modules"
        :slides-per-view="2"
        :space-between="16"
        :loop="true"
        :pagination="{ clickable: true }"
        :breakpoints="{
          640: { slidesPerView: 3, spaceBetween: 16 },
          960: { slidesPerView: 4, spaceBetween: 20 },
          1280: { slidesPerView: 6, spaceBetween: 24 },
        }"
        class="romance-swiper"
      >
        <swiper-slide v-for="(book, i) in romanceBooks" :key="i">
          <v-hover v-slot="{ isHovering, props }">
            <v-sheet
              v-bind="props"
              class="d-flex flex-column h-100 w-100 book-card"
              @click="$router.push(`/details/${book._id}`)"
            >
              <!-- Enhanced Book Cover -->
              <div class="position-relative book-cover-container">
                <div class="book-cover-wrapper">
                  <img
                    :src="book?.cover_url"
                    :alt="book.title"
                    class="book-cover-image"
                  />
                </div>

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
                    :color="isFavorite(book._id) ? 'red' : 'grey-lighten-5'"
                    size="24"
                  >
                    {{
                      isFavorite(book._id) ? "mdi-heart" : "mdi-heart-outline"
                    }}
                  </v-icon>
                </v-btn>

                <!-- Romance Badge -->
                <v-chip
                  color="pink"
                  variant="flat"
                  size="x-small"
                  class="position-absolute romance-badge"
                  style="bottom: 12px; left: 50%; transform: translateX(-50%)"
                >
                  Romance
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
                </div>
              </div>

              <!-- Enhanced Add to Cart Button -->
              <v-card-actions class="px-4 pb-4 pt-0 d-flex justify-center">
                <v-btn
                  color="darkgreen"
                  variant="elevated"
                  size="large"
                  block
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
        </swiper-slide>
      </swiper>

      <!-- Custom Next Button -->
      <v-btn
        icon
        size="small"
        class="swiper-button-custom swiper-button-next-custom"
        @click="slideNext"
        elevation="2"
      >
        <v-icon size="x-large">mdi-chevron-right</v-icon>
      </v-btn>
    </div>
  </v-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default {
  components: {
    Swiper,
    SwiperSlide,
  },
  setup() {
    return {
      modules: [Pagination],
    };
  },
  data() {
    return {
      isLoading: false,
    };
  },
  computed: {
    ...mapState("book", ["romanceBooks"]),
  },
  props: {
    favorites: {
      type: Array,
      default: () => [],
    },
    toggleFavorites: {
      type: Function,
      required: true,
    },
  },
  methods: {
    ...mapActions("book", ["getRomanceBooks"]),
    ...mapActions("favorite", ["toggleFavorites"]),
    async handleToggleFavorites(bookId) {
      try {
        await this.toggleFavorites(bookId);
      } catch (error) {
        console.error("Error toggling favorites:", error);
      }
    },
    isFavorite(bookId) {
      return this.favorites.some((favorite) => {
        // Handle case where bookId is populated (contains full book object)
        const favoriteBookId = favorite.bookId?._id || favorite.bookId;
        return favoriteBookId === bookId;
      });
    },
  },
  async mounted() {
    if (this.romanceBooks.length === 0) {
      this.isLoading = true;
      try {
        await this.getRomanceBooks({
          subject: "contemporary romance",
          half: true,
        });
      } catch (error) {
        console.error("Error fetching books:", error);
      }
      this.isLoading = false;
    }
  },
  slidePrev() {
    this.$refs.romanceSwiper.$el.swiper.slidePrev();
  },
  slideNext() {
    this.$refs.romanceSwiper.$el.swiper.slideNext();
  },
};
</script>

<style scoped>
/* Swiper Container Wrapper */
.swiper-container-wrapper {
  position: relative;
}

/* Custom Navigation Buttons */
.swiper-button-custom {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background-color: white !important;
  border: 1px solid #e0e0e0;
  margin-top: -25px;
}

.swiper-button-prev-custom {
  left: -20px;
}

.swiper-button-next-custom {
  right: -20px;
}

.swiper-button-custom:hover {
  background-color: #f5f5f5 !important;
}

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

.book-cover-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  position: relative;
}

.book-cover-wrapper {
  width: 70%;
  max-width: 180px;
  aspect-ratio: 2/3;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.book-cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.book-card:hover .book-cover-wrapper {
  transform: translateY(-8px) scale(1.05);
}

/* Swiper Customization */
.romance-swiper {
  padding: 0 4px 50px 4px;
}

.romance-swiper :deep(.swiper-pagination-bullet) {
  background: #435058;
  opacity: 0.3;
}

.romance-swiper :deep(.swiper-pagination-bullet-active) {
  opacity: 1;
  background: #435058;
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

.romance-badge {
  font-weight: 600;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #ff69b4 0%, #ff8da1 100%) !important;
  color: white !important;
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
