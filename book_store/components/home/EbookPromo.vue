<template>
  <section class="container mx-auto mt-16 max-w-7xl px-4 md:mt-24">
    <div
      class="grid grid-cols-1 items-center gap-10 overflow-hidden rounded-2xl bg-primary/10 px-5 py-10 ring-1 ring-primary/20 md:grid-cols-12 md:gap-8 md:px-12 md:py-14"
    >
      <div class="order-2 md:order-1 md:col-span-6">
        <div
          v-if="covers.length"
          class="grid h-[320px] grid-cols-3 gap-3 overflow-hidden md:h-[400px] md:gap-4"
          aria-hidden="true"
        >
          <div
            v-for="(column, columnIndex) in columns"
            :key="columnIndex"
            v-reveal="columnIndex * 120"
            class="flex flex-col gap-3 md:gap-4"
            :class="COLUMN_OFFSET[columnIndex]"
          >
            <div
              v-for="book in column"
              :key="book._id"
              class="aspect-[2/3] shrink-0 overflow-hidden rounded-md bg-muted shadow-[0_12px_24px_-12px_hsl(var(--foreground)/0.4)] ring-1 ring-black/5 dark:ring-white/10"
            >
              <img
                :src="book.cover_url"
                alt=""
                class="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
        <div v-else class="grid h-[320px] grid-cols-3 gap-3 md:h-[400px] md:gap-4">
          <UiSkeleton v-for="n in 3" :key="n" class="h-full rounded-md" />
        </div>
      </div>

      <div v-reveal class="order-1 md:order-2 md:col-span-6 md:pl-6">
        <h2
          class="text-3xl font-bold leading-[1.1] tracking-tight text-foreground md:text-4xl lg:text-5xl"
        >
          Start reading before it ships.
        </h2>
        <p class="mt-5 max-w-[48ch] text-base leading-relaxed text-muted-foreground md:text-lg">
          Every title is also sold as a PDF ebook for {{ EBOOK_DISCOUNT }}% less.
          Preview the first 20 pages free, then keep reading in the browser.
        </p>

        <NuxtLink
          v-if="sample"
          :to="`/details/${sample._id}`"
          class="group mt-8 flex max-w-md items-center gap-4 rounded-xl bg-background/80 p-3 ring-1 ring-border transition-colors hover:bg-background"
        >
          <img
            :src="sample.cover_url"
            :alt="sample.title"
            class="h-16 w-11 shrink-0 rounded object-cover"
            loading="lazy"
          />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-foreground">{{ sample.title }}</p>
            <p class="mt-1 text-sm text-muted-foreground">
              Hardback <span class="line-through">{{ formatUsd(sample.price) }}</span>
              <span class="ml-2 font-semibold text-foreground">
                Ebook {{ formatUsd(unitPrice(sample.price, "ebook")) }}
              </span>
            </p>
          </div>
          <ArrowRight class="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ArrowRight } from "lucide-vue-next";
import { EBOOK_PRICE_RATIO, formatUsd, unitPrice } from "@/utils/pricing";
import type { Book } from "@/types";

const props = defineProps<{
  books: Book[];
}>();

const EBOOK_DISCOUNT = Math.round((1 - EBOOK_PRICE_RATIO) * 100);

const COLUMN_OFFSET = ["-mt-10", "mt-8", "-mt-4"];

const covers = computed(() => props.books.filter((book) => book.cover_url).slice(0, 9));

const columns = computed(() =>
  [0, 1, 2].map((column) => covers.value.filter((_, index) => index % 3 === column))
);

const sample = computed(() => covers.value.find((book) => book.price > 0));
</script>
