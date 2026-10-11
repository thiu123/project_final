<template>
  <section class="container mx-auto max-w-7xl px-4">
    <StoreSectionHeader
      :number="number"
      eyebrow="From the shelves"
      :title="carousel.title"
      :description="carousel.subtitle"
    >
      <template #action>
        <div class="flex items-center gap-6">
          <NuxtLink
            :to="`/subjects/${subjectSlug(carousel.subject)}`"
            class="group inline-flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.14em]"
          >
            <span class="ed-link">View all</span>
            <ArrowRight class="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </NuxtLink>
          <div class="hidden gap-2 sm:flex">
            <button
              type="button"
              aria-label="Previous books"
              :class="ARROW_CLASS"
              @click="swiper?.slidePrev()"
            >
              <ArrowLeft class="size-4" />
            </button>
            <button
              type="button"
              aria-label="Next books"
              :class="ARROW_CLASS"
              @click="swiper?.slideNext()"
            >
              <ArrowRight class="size-4" />
            </button>
          </div>
        </div>
      </template>
    </StoreSectionHeader>

    <div v-if="books.length === 0" class="grid grid-cols-2 gap-x-5 sm:grid-cols-3 lg:grid-cols-5">
      <div v-for="i in 5" :key="i" :class="SKELETON_VISIBILITY[i - 1]">
        <UiSkeleton class="aspect-[4/5] w-full rounded-none" />
        <UiSkeleton class="mt-4 h-3 w-1/3" />
        <UiSkeleton class="mt-3 h-5 w-4/5" />
        <UiSkeleton class="mt-3 h-4 w-1/4" />
      </div>
    </div>

    <Swiper
      v-else
      :slides-per-view="2"
      :space-between="16"
      :loop="books.length > 5"
      :breakpoints="SWIPER_BREAKPOINTS"
      @swiper="swiper = $event"
    >
      <SwiperSlide v-for="book in books" :key="book._id" class="!h-auto">
        <BookGridCard
          :book="book"
          :favorite="isFavoriteBook(favorites, book._id)"
          @add-to-cart="emit('add-to-cart', $event, 1)"
          @toggle-favorite="onToggleFavorite"
        />
      </SwiperSlide>
    </Swiper>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { Swiper, SwiperSlide } from "swiper/vue";
import type { Swiper as SwiperType } from "swiper/types";
import { ArrowLeft, ArrowRight } from "lucide-vue-next";
import { useBookStore } from "@/stores/book";
import { useFavoriteStore } from "@/stores/favorite";
import { isFavoriteBook } from "@/utils/favorites";
import { subjectSlug } from "@/utils/subjects";
import type { HomeCarousel } from "@/constants/homeCarousels";
import type { Book } from "@/types";
import "swiper/css";

const props = defineProps<{ carousel: HomeCarousel; number?: string }>();

const emit = defineEmits<{
  "add-to-cart": [bookId: string, quantity: number];
}>();

const SWIPER_BREAKPOINTS = {
  640: { slidesPerView: 3, spaceBetween: 20 },
  1024: { slidesPerView: 5, spaceBetween: 24 },
};

const SKELETON_VISIBILITY = ["", "", "hidden sm:block", "hidden lg:block", "hidden lg:block"];

const ARROW_CLASS =
  "flex size-10 items-center justify-center border border-border text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background";

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
