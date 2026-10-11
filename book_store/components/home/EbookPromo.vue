<template>
  <section class="container mx-auto max-w-7xl px-4">
    <div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
      <div v-reveal class="lg:order-2 lg:col-span-5">
        <p class="eyebrow">The ebook edition</p>
        <h2
          class="mt-5 font-serif text-[2.5rem] font-normal leading-[1.02] tracking-[-0.025em] text-foreground md:text-6xl"
        >
          Start reading <span class="italic">before</span> it ships.
        </h2>
        <p class="mt-6 max-w-[44ch] text-[15px] leading-relaxed text-muted-foreground">
          Every title is also sold as a PDF ebook for {{ EBOOK_DISCOUNT }}% less.
          Preview the first 20 pages free, then keep reading in the browser.
        </p>

        <NuxtLink
          v-if="sample"
          :to="`/details/${sample._id}`"
          class="group mt-10 grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-4 border-y border-border py-4"
        >
          <div class="ed-cover aspect-[2/3] w-full overflow-hidden bg-muted">
            <img
              :src="sample.cover_url"
              :alt="sample.title"
              class="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div class="min-w-0">
            <p class="truncate font-serif text-lg leading-snug text-foreground transition-colors group-hover:text-primary">
              {{ sample.title }}
            </p>
            <p class="mt-1 text-[13px] tabular-nums text-muted-foreground">
              Hardback <span class="line-through">{{ formatUsd(sample.price) }}</span>
              <span class="mx-2 text-border">/</span>
              <span class="text-foreground">Ebook {{ formatUsd(unitPrice(sample.price, "ebook")) }}</span>
            </p>
          </div>
          <ArrowRight
            class="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-foreground"
          />
        </NuxtLink>

        <UiButton
          variant="ink"
          size="cta"
          class="mt-10 shadow-none"
          @click="router.push(sample ? `/details/${sample._id}` : '/subjects/all')"
        >
          {{ sample ? "Read a free preview" : "Browse all books" }}
          <ArrowRight :stroke-width="1.5" />
        </UiButton>
      </div>

      <div class="lg:order-1 lg:col-span-7">
        <div
          v-if="covers.length"
          class="grid h-[360px] grid-cols-3 gap-4 overflow-hidden bg-muted px-6 md:h-[520px] md:gap-6 md:px-12"
          aria-hidden="true"
        >
          <div
            v-for="(column, columnIndex) in columns"
            :key="columnIndex"
            v-reveal="columnIndex * 120"
            class="flex flex-col gap-4 md:gap-6"
            :class="COLUMN_OFFSET[columnIndex]"
          >
            <div
              v-for="book in column"
              :key="book._id"
              class="ed-cover aspect-[2/3] shrink-0 overflow-hidden bg-card"
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
        <div
          v-else
          class="grid h-[360px] grid-cols-3 gap-4 bg-muted px-6 py-10 md:h-[520px] md:gap-6 md:px-12"
          aria-hidden="true"
        >
          <UiSkeleton v-for="n in 3" :key="n" class="h-full rounded-none" />
        </div>
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

const COLUMN_OFFSET = ["-mt-16", "mt-12", "-mt-4"];

const router = useRouter();

const covers = computed(() => props.books.filter((book) => book.cover_url).slice(0, 9));

const columns = computed(() =>
  [0, 1, 2].map((column) => covers.value.filter((_, index) => index % 3 === column))
);

const sample = computed(() => covers.value.find((book) => book.price > 0));
</script>
