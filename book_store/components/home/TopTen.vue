<template>
  <section class="container mx-auto mt-16 max-w-7xl px-4 md:mt-20">
    <div v-reveal class="mb-8 flex items-end justify-between gap-6">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Top 10 best sellers
        </h2>
        <p class="mt-2 max-w-[60ch] text-muted-foreground">
          The ten titles our readers have bought the most.
        </p>
      </div>

      <div class="hidden shrink-0 gap-2 md:flex">
        <UiButton
          variant="outline"
          size="icon-lg"
          class="rounded-full active:scale-95"
          aria-label="Scroll left"
          :disabled="atStart"
          @click="scrollByPage(-1)"
        >
          <ChevronLeft />
        </UiButton>
        <UiButton
          variant="outline"
          size="icon-lg"
          class="rounded-full active:scale-95"
          aria-label="Scroll right"
          :disabled="atEnd"
          @click="scrollByPage(1)"
        >
          <ChevronRight />
        </UiButton>
      </div>
    </div>

    <ol
      ref="track"
      class="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 md:gap-6"
      @scroll.passive="updateEdges"
    >
      <template v-if="books.length">
        <li
          v-for="(book, index) in books"
          :key="book._id"
          class="group flex shrink-0 snap-start items-end"
        >
          <span
            class="-mr-5 mb-11 select-none text-[7rem] font-bold leading-[0.8] tracking-tighter text-transparent transition-colors duration-300 [-webkit-text-stroke:2px_hsl(var(--muted-foreground)/0.35)] group-hover:[-webkit-text-stroke:2px_hsl(var(--primary))] md:-mr-6 md:text-[9rem]"
            aria-hidden="true"
          >
            {{ index + 1 }}
          </span>

          <NuxtLink
            :to="`/details/${book._id}`"
            class="relative block w-[132px] md:w-[160px]"
          >
            <div
              class="aspect-[2/3] overflow-hidden rounded-md bg-muted shadow-[0_16px_32px_-12px_hsl(var(--foreground)/0.3)] ring-1 ring-black/5 transition-transform duration-500 ease-out group-hover:-translate-y-2 dark:ring-white/10"
            >
              <img
                :src="book.cover_url"
                :alt="book.title"
                class="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <p class="mt-3 line-clamp-1 text-sm font-semibold text-foreground">
              <span class="sr-only">Number {{ index + 1 }}: </span>{{ book.title }}
            </p>
            <p class="mt-0.5 text-xs text-muted-foreground">
              {{ book.sold.toLocaleString() }} sold
            </p>
          </NuxtLink>
        </li>
      </template>

      <template v-else>
        <li v-for="n in 6" :key="n" class="flex shrink-0 items-end gap-3">
          <UiSkeleton class="h-24 w-12" />
          <div class="w-[132px] md:w-[160px]">
            <UiSkeleton class="aspect-[2/3] w-full" />
            <UiSkeleton class="mt-3 h-4 w-3/4" />
          </div>
        </li>
      </template>
    </ol>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
import { useBookStore } from "@/stores/book";

const { bestSellers } = storeToRefs(useBookStore());

const books = computed(() => bestSellers.value.slice(0, 10));

const track = ref<HTMLOListElement | null>(null);
const atStart = ref(true);
const atEnd = ref(false);

function updateEdges() {
  const el = track.value;
  if (!el) return;
  atStart.value = el.scrollLeft <= 4;
  atEnd.value = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
}

function scrollByPage(direction: 1 | -1) {
  const el = track.value;
  if (!el) return;
  el.scrollBy({ left: direction * el.clientWidth * 0.8 });
}

watch(books, () => nextTick(updateEdges));
onMounted(updateEdges);
</script>
