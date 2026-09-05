<template>
  <section class="mx-auto mt-12 w-full max-w-[1500px] px-4">
    <!-- Enhanced Header Section -->
    <div class="mb-8 flex items-center justify-between">
      <div class="flex items-center">
        <div
          class="mr-4 flex h-[50px] w-[50px] items-center justify-center rounded-2xl shadow-[0_4px_12px_rgba(67,80,88,0.15)] sm:h-[60px] sm:w-[60px]"
        >
          <Heart class="h-8 w-8 text-darkgreen dark:text-foreground" />
        </div>
        <div>
          <h2
            class="mb-1 text-2xl font-bold text-darkgreen dark:text-foreground sm:text-3xl"
          >
            Romance
          </h2>
          <p class="mb-0 text-sm text-muted-foreground">
            Fall in love with heartwarming stories and passionate tales
          </p>
        </div>
      </div>

      <button
        type="button"
        class="group inline-flex min-w-[120px] items-center justify-center rounded-full border-2 border-darkgreen px-5 py-2.5 text-sm font-medium text-darkgreen transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-darkgreen hover:text-white hover:shadow-[0_8px_25px_rgba(67,80,88,0.3)] dark:border-border dark:text-foreground dark:hover:bg-darkgreen dark:hover:text-white sm:min-w-[140px] sm:text-base"
        @click="
          router.push(`/subjects/${encodeURIComponent('contemporary romance')}`)
        "
      >
        <span class="font-medium">View All</span>
        <ArrowRight
          class="ml-2 h-6 w-6 transition-transform duration-300 group-hover:translate-x-1"
        />
      </button>
    </div>

    <!-- Enhanced Loading Skeletons -->
    <div v-if="romanceBooks.length === 0">
      <Swiper
        :slides-per-view="2"
        :space-between="16"
        :loop="true"
        :breakpoints="swiperBreakpoints"
      >
        <SwiperSlide v-for="i in 6" :key="i">
          <div
            class="h-full overflow-hidden rounded-xl border border-border bg-muted/40"
          >
            <UiSkeleton class="h-[220px] w-full rounded-none rounded-t-xl" />
            <div class="space-y-3 p-4">
              <UiSkeleton class="h-4 w-full rounded-lg" />
              <UiSkeleton class="h-4 w-3/4 rounded-lg" />
              <UiSkeleton class="h-9 w-full rounded-lg" />
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>

    <!-- Enhanced Romance Books Swiper -->
    <div v-else class="relative">
      <!-- Custom Previous Button -->
      <button
        type="button"
        aria-label="Previous books"
        class="absolute -left-5 top-1/2 z-10 -mt-[25px] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow transition-colors hover:bg-muted"
        @click="slidePrev"
      >
        <ChevronLeft class="h-6 w-6" />
      </button>

      <Swiper
        :modules="modules"
        :slides-per-view="2"
        :space-between="16"
        :loop="true"
        :breakpoints="swiperBreakpoints"
        class="romance-swiper px-1 pb-[50px]"
        @swiper="onSwiper"
      >
        <SwiperSlide v-for="(book, i) in romanceBooks" :key="i">
          <div
            class="group flex h-full w-full cursor-pointer flex-col overflow-hidden bg-card"
            @click="router.push(`/details/${book._id}`)"
          >
            <!-- Enhanced Book Cover -->
            <div class="relative flex items-center justify-center p-5">
              <div
                class="aspect-[2/3] w-[70%] max-w-[180px] overflow-hidden bg-muted transition-all duration-[400ms] ease-in-out group-hover:-translate-y-2 group-hover:scale-105"
              >
                <img
                  :src="book?.cover_url"
                  :alt="book.title"
                  class="block h-full w-full object-cover"
                />
              </div>

              <!-- Enhanced Favorite Button -->
              <button
                type="button"
                :aria-label="
                  isFavorite(book._id)
                    ? 'Remove from favorites'
                    : 'Add to favorites'
                "
                class="absolute right-3 top-3 rounded-full p-1 opacity-90 transition-all duration-300 hover:scale-110 hover:opacity-100"
                @click.stop="handleToggleFavorites(book._id)"
              >
                <Heart
                  class="h-6 w-6"
                  :class="
                    isFavorite(book._id)
                      ? 'fill-destructive text-destructive'
                      : 'text-gray-100'
                  "
                />
              </button>

              <!-- Romance Badge -->
              <span
                class="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-br from-[#ff69b4] to-[#ff8da1] px-2 py-0.5 text-[10px] font-semibold tracking-[0.5px] text-white"
              >
                Romance
              </span>
            </div>

            <!-- Enhanced Book Details -->
            <div class="flex grow flex-col px-4 pb-3 pt-4">
              <!-- Enhanced Rating -->
              <div class="mb-2 flex items-center">
                <UiRating
                  :model-value="book.rating || 0"
                  :size="16"
                  readonly
                  class="mr-2"
                />
              </div>

              <!-- Enhanced Title -->
              <div
                class="mb-2 truncate text-base font-medium leading-[1.3] text-foreground"
              >
                {{ book.title }}
              </div>

              <!-- Sold Count -->
              <UiBadge
                variant="success"
                class="mb-2 w-fit px-2 text-[10px] font-semibold tracking-[0.5px]"
              >
                <Flame class="h-3 w-3" />
                Sold {{ book.sold || 0 }}
              </UiBadge>

              <!-- Enhanced Price -->
              <div class="mt-auto flex items-center justify-between">
                <div class="flex items-center">
                  <span
                    class="text-lg font-bold text-darkgreen dark:text-foreground"
                    >${{ book.price }}</span
                  >
                </div>
              </div>
            </div>

            <!-- Enhanced Add to Cart Button -->
            <div class="flex justify-center px-4 pb-4 pt-0">
              <UiButton
                variant="secondary"
                size="lg"
                block
                class="rounded-lg text-sm font-medium tracking-[0.5px] shadow transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(67,80,88,0.3)]"
                @click.stop="emit('add-to-cart', book._id, 1)"
              >
                <ShoppingCart class="h-4 w-4" />
                Add to Cart
              </UiButton>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>

      <!-- Custom Next Button -->
      <button
        type="button"
        aria-label="Next books"
        class="absolute -right-5 top-1/2 z-10 -mt-[25px] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow transition-colors hover:bg-muted"
        @click="slideNext"
      >
        <ChevronRight class="h-6 w-6" />
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useBookStore } from "@/stores/book";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper/types";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Flame,
  Heart,
  ShoppingCart,
} from "lucide-vue-next";
import type { Book, Favorite } from "@/types";
import "swiper/css";
import "swiper/css/pagination";

const props = withDefaults(
  defineProps<{
    favorites?: Favorite[];
    toggleFavorites: (bookId: string) => Promise<unknown> | unknown;
  }>(),
  {
    favorites: () => [],
  }
);

const emit = defineEmits<{
  "add-to-cart": [bookId: string, quantity: number];
}>();

const router = useRouter();

const bookStore = useBookStore();
const { homeSubjects } = storeToRefs(bookStore);

const romanceBooks = computed<Book[]>(
  () => homeSubjects.value["contemporary romance"] || []
);

const modules = [Pagination];

const swiperBreakpoints = {
  640: { slidesPerView: 3, spaceBetween: 16 },
  960: { slidesPerView: 4, spaceBetween: 20 },
  1280: { slidesPerView: 6, spaceBetween: 24 },
};

const swiperInstance = shallowRef<SwiperType | null>(null);

function onSwiper(swiper: SwiperType) {
  swiperInstance.value = swiper;
}

function slidePrev() {
  swiperInstance.value?.slidePrev();
}

function slideNext() {
  swiperInstance.value?.slideNext();
}

async function handleToggleFavorites(bookId: string) {
  try {
    await props.toggleFavorites(bookId);
  } catch (error) {
    console.error("Error toggling favorites:", error);
  }
}

function isFavorite(bookId: string): boolean {
  return props.favorites.some((favorite) => {
    // Handle case where bookId is populated (contains full book object)
    const favoriteBookId = (favorite.bookId as Book)?._id || favorite.bookId;
    return favoriteBookId === bookId;
  });
}
</script>

<style scoped>
/* Swiper pagination bullets (Pagination module registered as in the original) */
.romance-swiper :deep(.swiper-pagination-bullet) {
  background: #435058;
  opacity: 0.3;
}

.romance-swiper :deep(.swiper-pagination-bullet-active) {
  opacity: 1;
  background: #435058;
}
</style>
