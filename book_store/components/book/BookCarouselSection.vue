<template>
  <section class="mx-auto mt-12 w-full max-w-[1500px] px-4">
    <!-- Header -->
    <div class="mb-8 flex items-center justify-between">
      <div class="flex items-center">
        <div
          class="mr-4 flex h-[50px] w-[50px] items-center justify-center rounded-2xl shadow-[0_4px_12px_rgba(67,80,88,0.15)] sm:h-[60px] sm:w-[60px]"
        >
          <component
            :is="carousel.icon"
            class="h-8 w-8 text-darkgreen dark:text-foreground"
          />
        </div>
        <div>
          <h2
            class="mb-1 text-2xl font-bold text-darkgreen dark:text-foreground sm:text-3xl"
          >
            {{ carousel.title }}
          </h2>
          <p class="mb-0 text-sm text-muted-foreground">
            {{ carousel.subtitle }}
          </p>
        </div>
      </div>

      <NuxtLink
        :to="`/subjects/${encodeURIComponent(carousel.subject)}`"
        class="group inline-flex min-w-[120px] items-center justify-center rounded-full border-2 border-darkgreen px-5 py-2.5 text-sm font-medium text-darkgreen no-underline transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-darkgreen hover:text-white hover:shadow-[0_8px_25px_rgba(67,80,88,0.3)] dark:border-border dark:text-foreground dark:hover:bg-darkgreen dark:hover:text-white sm:min-w-[140px] sm:text-base"
      >
        <span class="font-medium">View All</span>
        <ArrowRight
          class="ml-2 h-6 w-6 transition-transform duration-300 group-hover:translate-x-1"
        />
      </NuxtLink>
    </div>

    <!-- Loading skeletons -->
    <Swiper
      v-if="books.length === 0"
      :slides-per-view="2"
      :space-between="16"
      :breakpoints="SWIPER_BREAKPOINTS"
    >
      <SwiperSlide v-for="i in 6" :key="i">
        <div class="h-full overflow-hidden rounded-xl border border-border bg-muted/40">
          <UiSkeleton class="h-[220px] w-full rounded-none rounded-t-xl" />
          <div class="space-y-3 p-4">
            <UiSkeleton class="h-4 w-full rounded-lg" />
            <UiSkeleton class="h-4 w-3/4 rounded-lg" />
            <UiSkeleton class="h-9 w-full rounded-lg" />
          </div>
        </div>
      </SwiperSlide>
    </Swiper>

    <!-- Books -->
    <div v-else class="relative">
      <button
        type="button"
        aria-label="Previous books"
        :class="ARROW_CLASS"
        class="-left-5"
        @click="swiper?.slidePrev()"
      >
        <ChevronLeft class="h-6 w-6" />
      </button>

      <Swiper
        :slides-per-view="2"
        :space-between="16"
        :loop="true"
        :breakpoints="SWIPER_BREAKPOINTS"
        class="px-1 pb-[50px]"
        @swiper="swiper = $event"
      >
        <SwiperSlide v-for="book in books" :key="book._id">
          <BookCarouselCard
            :book="book"
            :favorite="isFavoriteBook(favorites, book._id)"
            :badge-label="carousel.badgeLabel ?? carousel.title"
            :badge-class="carousel.badgeClass"
            @add-to-cart="(id, qty) => emit('add-to-cart', id, qty)"
            @toggle-favorite="onToggleFavorite"
          />
        </SwiperSlide>
      </Swiper>

      <button
        type="button"
        aria-label="Next books"
        :class="ARROW_CLASS"
        class="-right-5"
        @click="swiper?.slideNext()"
      >
        <ChevronRight class="h-6 w-6" />
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { Swiper, SwiperSlide } from "swiper/vue";
import type { Swiper as SwiperType } from "swiper/types";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-vue-next";
import { useBookStore } from "@/stores/book";
import { useFavoriteStore } from "@/stores/favorite";
import { isFavoriteBook } from "@/utils/favorites";
import type { HomeCarousel } from "@/constants/homeCarousels";
import type { Book } from "@/types";
import "swiper/css";

const props = defineProps<{ carousel: HomeCarousel }>();

const emit = defineEmits<{
  "add-to-cart": [bookId: string, quantity: number];
}>();

const SWIPER_BREAKPOINTS = {
  640: { slidesPerView: 3, spaceBetween: 16 },
  960: { slidesPerView: 4, spaceBetween: 20 },
  1280: { slidesPerView: 6, spaceBetween: 24 },
};

const ARROW_CLASS =
  "absolute top-1/2 z-10 -mt-[25px] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow transition-colors hover:bg-muted";

const bookStore = useBookStore();
const { homeSubjects } = storeToRefs(bookStore);

// Favourites come straight from the store rather than being threaded down from
// the page, so the heart stays in sync no matter which screen toggled it.
const favoriteStore = useFavoriteStore();
const { favorites } = storeToRefs(favoriteStore);

const swiper = shallowRef<SwiperType | null>(null);

const books = computed<Book[]>(
  () => homeSubjects.value[props.carousel.subject] ?? []
);

async function onToggleFavorite(bookId: string) {
  await favoriteStore.toggleFavorites(bookId);
}
</script>
