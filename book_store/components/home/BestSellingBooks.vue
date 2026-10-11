<template>
  <section class="container mx-auto max-w-7xl px-4">
    <StoreSectionHeader
      :number="number"
      eyebrow="Best sellers by shelf"
      description="Our most popular titles, one shelf at a time."
    >
      Trending <span class="italic">now</span>
      <template #action>
        <div
          role="tablist"
          aria-label="Best seller shelves"
          class="scrollbar-none -mb-[25px] flex max-w-full gap-7 overflow-x-auto md:gap-9"
        >
          <button
            v-for="subject in BEST_SELLER_SUBJECTS"
            :key="subject"
            type="button"
            role="tab"
            :aria-selected="activeSubject === subject"
            class="relative shrink-0 whitespace-nowrap pb-4 text-[12px] lg:pb-7 font-medium uppercase tracking-[0.14em] transition-colors"
            :class="activeSubject === subject ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'"
            @click="activeSubject = subject"
          >
            {{ subject }}
            <span
              class="absolute inset-x-0 bottom-0 h-px bg-foreground transition-opacity duration-300"
              :class="activeSubject === subject ? 'opacity-100' : 'opacity-0'"
              aria-hidden="true"
            />
          </button>
        </div>
      </template>
    </StoreSectionHeader>

    <div
      v-if="visibleBooks.length"
      class="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4 md:gap-x-6"
    >
      <BookGridCard
        v-for="book in visibleBooks"
        :key="book._id"
        :book="book"
        :favorite="isFavoriteBook(favorites, book._id)"
        @add-to-cart="emit('add-to-cart', $event, 1)"
        @toggle-favorite="onToggleFavorite"
      />
    </div>

    <div
      v-else-if="!loaded"
      class="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4 md:gap-x-6"
      aria-hidden="true"
    >
      <div v-for="n in 4" :key="n">
        <UiSkeleton class="aspect-[4/5] w-full rounded-none" />
        <UiSkeleton class="mt-4 h-3 w-1/3 rounded-none" />
        <UiSkeleton class="mt-3 h-5 w-4/5 rounded-none" />
      </div>
    </div>

    <div v-if="hasMore" class="mt-14 flex justify-center">
      <NuxtLink
        :to="`/subjects/${encodeURIComponent(activeSubject)}`"
        class="group inline-flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.14em]"
      >
        <span class="ed-link">More in {{ activeSubject }}</span>
        <ArrowRight class="size-4 transition-transform duration-300 group-hover:translate-x-1" />
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ArrowRight } from "lucide-vue-next";
import { useBookStore } from "@/stores/book";
import { useFavoriteStore } from "@/stores/favorite";
import { isFavoriteBook } from "@/utils/favorites";
import type { Book } from "@/types";

defineProps<{ number?: string }>();

const emit = defineEmits<{
  "add-to-cart": [bookId: string, quantity: number];
}>();

const BEST_SELLER_SUBJECTS = ["historical fiction", "manga", "cooking"];
const VISIBLE_COUNT = 8;

const bookStore = useBookStore();
const { homeSubjects } = storeToRefs(bookStore);

const favoriteStore = useFavoriteStore();
const { favorites } = storeToRefs(favoriteStore);

const activeSubject = ref(BEST_SELLER_SUBJECTS[0]);

const loaded = computed(() => Object.keys(homeSubjects.value).length > 0);

const subjectBooks = computed<Book[]>(
  () => homeSubjects.value[activeSubject.value] ?? []
);

const visibleBooks = computed(() => subjectBooks.value.slice(0, VISIBLE_COUNT));

const hasMore = computed(() => subjectBooks.value.length > VISIBLE_COUNT);

async function onToggleFavorite(bookId: string) {
  await favoriteStore.toggleFavorites(bookId);
}
</script>
