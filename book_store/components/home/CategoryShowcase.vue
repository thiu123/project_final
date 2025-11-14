<template>
  <v-container max-width="1500" class="mt-8">
    <v-card
      elevation="0"
      class=""
      color="transparent"
      style="overflow: visible"
    >
      <div class="text-center mb-8">
        <h2 class="text-h4 font-weight-bold text-darkgreen text-left mb-3">
          Product Catalog
        </h2>
      </div>

      <div class="swiper-container-wrapper">
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
          ref="categorySwiper"
          :modules="modules"
          :slides-per-view="2"
          :space-between="16"
          :loop="true"
          :pagination="{ clickable: true }"
          :breakpoints="{
            640: { slidesPerView: 3, spaceBetween: 16 },
            960: { slidesPerView: 4, spaceBetween: 20 },
            1280: { slidesPerView: 7, spaceBetween: 24 },
          }"
          class="category-swiper"
        >
          <swiper-slide
            v-for="(category, index) in displayCategories"
            :key="index"
          >
            <v-card
              class="category-card cursor-pointer"
              @click="navigateToCategory(category)"
              elevation="2"
              hover
            >
              <div class="category-content">
                <!-- Category Image -->
                <div class="category-image-wrapper">

                  
                  <img
                    :src="
                      category.cover_url ||
                      'https://via.placeholder.com/300x400?text=No+Image'
                    "
                    :alt="category.name"
                    class="category-image"
                  />
                  <div
                    v-if="!category.cover_url"
                    class="d-flex align-center justify-center fill-height bg-grey-lighten-3 category-placeholder"
                  >
                    <v-progress-circular
                      color="primary"
                      indeterminate
                      size="32"
                    ></v-progress-circular>
                  </div>
                </div>

                <!-- Category Name -->
                <div class="category-name pa-3 text-center">
                  <h3 class="text-subtitle-1 font-weight-bold text-customblack">
                    {{ category.name }}
                  </h3>
                </div>
              </div>
            </v-card>
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
    </v-card>
  </v-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { bookSubjects } from "@/constants/bookSubjects";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default {
  name: "CategoryShowcase",
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
      categoryBooks: {},
    };
  },
  computed: {
    ...mapState("book", ["books"]),
    displayCategories() {
      // Flatten all subcategories with their cover_url
      const allCategories = [];

      bookSubjects.forEach((subject) => {
        if (subject.subcategories) {
          // Add each subcategory
          subject.subcategories.forEach((subcat) => {
            allCategories.push({
              name: subcat,
              route: subcat.toLowerCase(),
              subject: subcat.toLowerCase(),
              cover_url:
                this.categoryBooks[subcat.toLowerCase()]?.[0]?.cover_url ||
                null,
            });
          });
        } else {
          // Add category itself if no subcategories
          allCategories.push({
            name: subject.category,
            route: subject.category.toLowerCase(),
            subject: subject.category.toLowerCase(),
            cover_url:
              this.categoryBooks[subject.category.toLowerCase()]?.[0]
                ?.cover_url || null,
          });
        }
      });

      return allCategories.slice(0, 8);
    },
  },
  async mounted() {
    // Load all categories in parallel for better performance
    await this.loadAllCategoryImages();
  },
  methods: {
    ...mapActions("book", ["getAllBooks"]),

    async loadAllCategoryImages() {
      // Get all subjects to load
      const subjectsToLoad = [];

      bookSubjects.forEach((subject) => {
        if (subject.subcategories) {
          subject.subcategories.forEach((subcat) => {
            subjectsToLoad.push(subcat.toLowerCase());
          });
        } else {
          subjectsToLoad.push(subject.category.toLowerCase());
        }
      });

      // Load books for each subject one by one
      for (const subjectName of subjectsToLoad) {
        try {
          // console.log(`Loading books for subject: ${subjectName}`);
          await this.getAllBooks({ subject: subjectName });
          if (this.books && this.books.length > 0) {
            // Store the first book's cover for this subject
            this.categoryBooks[subjectName] = [this.books[0]];
            // console.log(
            //   `Loaded cover for ${subjectName}:`,
            //   this.books[0].cover_url
            // );
          }
        } catch (error) {
          console.error(`Error loading books for ${subjectName}:`, error);
        }
      }
    },

    navigateToCategory(category) {
      this.$router.push(`/subjects/${category.route}`);
    },

    slidePrev() {
      this.$refs.categorySwiper.$el.swiper.slidePrev();
    },

    slideNext() {
      this.$refs.categorySwiper.$el.swiper.slideNext();
    },
  },
};
</script>

<style scoped>
/* V-container overflow visible */
.v-container {
  overflow: visible !important;
}

/* Swiper Container Wrapper */
.swiper-container-wrapper {
  position: relative;
  overflow: visible;
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

/* Swiper Customization */
.category-swiper {
  padding: 0 4px 50px 4px;
  position: relative;
}

.category-card {
  transition: all 0.3s ease;
  background: white;
  border: 1px solid #e0e0e0;
  height: 100%;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
}

.category-content {
  display: flex;
  flex-direction: column;
}

.category-image-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 180px;
  overflow: hidden;
}

.category-image {
  width: 70%;
  height: 100%;
  max-height: 170px;
  object-fit: cover;
}

.category-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.category-card:hover .category-image {
  transform: scale(1.05);
}

.category-name h3 {
  font-size: 0.9rem;
  line-height: 1.3;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .category-name h3 {
    font-size: 0.85rem;
    min-height: 32px;
  }
}

@media (max-width: 600px) {
  .category-name h3 {
    font-size: 0.8rem;
    min-height: 28px;
  }
}
</style>
