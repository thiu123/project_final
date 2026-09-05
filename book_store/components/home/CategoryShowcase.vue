<template>
  <div class="container mx-auto mt-8 max-w-[1500px] px-4">
    <div class="mb-8">
      <h2 class="mb-3 text-left text-3xl font-bold text-darkgreen dark:text-foreground">
        Product Catalog
      </h2>
    </div>

    <div class="swiper-container-wrapper relative">
      <!-- Custom Previous Button -->
      <button
        type="button"
        aria-label="Previous categories"
        class="swiper-button-custom swiper-button-prev-custom absolute z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md transition-colors hover:bg-muted"
        @click="slidePrev"
      >
        <ChevronLeft class="h-6 w-6" />
      </button>

      <swiper
        :modules="modules"
        :slides-per-view="2"
        :space-between="16"
        :loop="true"
        :breakpoints="{
          640: { slidesPerView: 3, spaceBetween: 16 },
          960: { slidesPerView: 4, spaceBetween: 20 },
          1280: { slidesPerView: 7, spaceBetween: 24 },
        }"
        class="category-swiper"
        @swiper="onSwiper"
      >
        <swiper-slide
          v-for="(category, index) in displayCategories"
          :key="index"
        >
          <div
            class="group h-full cursor-pointer overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            @click="navigateToCategory(category)"
          >
            <div class="flex flex-col">
              <!-- Category Image -->
              <div
                class="relative flex h-[180px] items-center justify-center overflow-hidden"
              >
                <img
                  :src="
                    category.cover_url ||
                    'https://via.placeholder.com/300x400?text=No+Image'
                  "
                  :alt="category.name"
                  class="h-full max-h-[170px] w-[70%] object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div
                  v-if="!category.cover_url"
                  class="absolute inset-0 flex items-center justify-center bg-muted"
                >
                  <UiSpinner class="text-primary" />
                </div>
              </div>

              <!-- Category Name -->
              <div class="p-3 text-center">
                <h3
                  class="flex min-h-[36px] items-center justify-center text-sm font-bold leading-snug text-foreground"
                >
                  {{ category.name }}
                </h3>
              </div>
            </div>
          </div>
        </swiper-slide>
      </swiper>

      <!-- Custom Next Button -->
      <button
        type="button"
        aria-label="Next categories"
        class="swiper-button-custom swiper-button-next-custom absolute z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md transition-colors hover:bg-muted"
        @click="slideNext"
      >
        <ChevronRight class="h-6 w-6" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useBookStore } from "@/stores/book";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper/types";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
import "swiper/css";
import "swiper/css/pagination";

interface CategoryItem {
  name: string;
  route: string;
  subject: string;
  cover_url: string | null;
}

const modules = [Pagination];

const router = useRouter();
const bookStore = useBookStore();
// Categories, their covers and their counts all come from the API.
const { categories } = storeToRefs(bookStore);

const swiperInstance = shallowRef<SwiperType | null>(null);

function onSwiper(swiper: SwiperType) {
  swiperInstance.value = swiper;
}

/**
 * Leaf categories, most stocked first. Subcategories stand in for their parent
 * when one exists, so the strip shows browsable shelves rather than groupings.
 */
const displayCategories = computed<CategoryItem[]>(() =>
  categories.value
    .flatMap((category) =>
      category.subcategories.length ? category.subcategories : [category]
    )
    .filter((node) => node.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map((node) => ({
      name: node.name,
      route: node.slug,
      subject: node.subject,
      cover_url: node.cover_url,
    }))
);

function navigateToCategory(category: CategoryItem) {
  router.push(`/subjects/${category.route}`);
}

function slidePrev() {
  swiperInstance.value?.slidePrev();
}

function slideNext() {
  swiperInstance.value?.slideNext();
}
</script>

<style scoped>
/* Swiper needs overflow visible so the side nav buttons can hang outside */
.swiper-container-wrapper {
  overflow: visible;
}

/* Custom navigation button positioning (vertically centered on the covers) */
.swiper-button-custom {
  top: 50%;
  transform: translateY(-50%);
  margin-top: -25px;
}

.swiper-button-prev-custom {
  left: -20px;
}

.swiper-button-next-custom {
  right: -20px;
}

/* Swiper customization */
.category-swiper {
  padding: 0 4px 50px 4px;
  position: relative;
}
</style>
