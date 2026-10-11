<template>
  <section class="container mx-auto max-w-7xl px-4">
    <StoreSectionHeader
      :number="number"
      eyebrow="Best sellers"
      description="The ten titles our readers have bought the most."
      to="/subjects/all"
      link-label="All books"
    >
      The <span class="italic">Top</span> Ten
    </StoreSectionHeader>

    <ol
      v-if="books.length"
      class="grid grid-cols-1 lg:grid-flow-col lg:grid-cols-2 lg:grid-rows-5 lg:gap-x-16"
    >
      <li
        v-for="(book, index) in books"
        :key="book._id"
        v-reveal="(index % 5) * 60"
        class="border-b border-border"
      >
        <NuxtLink
          :to="`/details/${book._id}`"
          class="group grid grid-cols-[3rem_3.25rem_minmax(0,1fr)] items-center gap-4 py-4 sm:grid-cols-[4rem_3.75rem_minmax(0,1fr)_auto] md:gap-6 md:py-5"
        >
          <span
            class="font-serif text-[2.75rem] font-light leading-none tracking-[-0.04em] tabular-nums text-foreground transition-colors duration-300 group-hover:text-primary md:text-[3.5rem]"
            aria-hidden="true"
          >
            {{ String(index + 1).padStart(2, "0") }}
          </span>

          <div
            class="ed-cover aspect-[2/3] w-full overflow-hidden bg-muted transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1"
          >
            <img
              v-if="book.cover_url"
              :src="book.cover_url"
              :alt="book.title"
              class="h-full w-full object-cover"
              loading="lazy"
            />
          </div>

          <div class="min-w-0">
            <p class="eyebrow truncate leading-normal">
              {{ book.authors?.[0] || "Unknown author" }}
            </p>
            <p class="mt-1.5 line-clamp-2 font-serif text-lg leading-snug text-foreground transition-colors group-hover:text-primary md:text-xl">
              <span class="sr-only">Number {{ index + 1 }}: </span>{{ book.title }}
            </p>
            <p class="mt-1.5 text-[13px] tabular-nums text-muted-foreground sm:hidden">
              {{ book.sold.toLocaleString() }} sold
            </p>
          </div>

          <span class="hidden text-[13px] tabular-nums text-muted-foreground sm:block">
            {{ book.sold.toLocaleString() }} sold
          </span>
        </NuxtLink>
      </li>
    </ol>

    <ol
      v-else
      class="grid grid-cols-1 lg:grid-flow-col lg:grid-cols-2 lg:grid-rows-5 lg:gap-x-16"
      aria-hidden="true"
    >
      <li
        v-for="n in 10"
        :key="n"
        class="grid grid-cols-[3rem_3.25rem_minmax(0,1fr)] items-center gap-4 border-b border-border py-5 sm:grid-cols-[4rem_3.75rem_minmax(0,1fr)] md:gap-6"
        :class="n > 5 && 'hidden lg:grid'"
      >
        <UiSkeleton class="h-10 w-10 rounded-none" />
        <UiSkeleton class="aspect-[2/3] w-full rounded-none" />
        <div>
          <UiSkeleton class="h-3 w-1/3 rounded-none" />
          <UiSkeleton class="mt-3 h-5 w-3/4 rounded-none" />
        </div>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useBookStore } from "@/stores/book";

defineProps<{ number?: string }>();

const { bestSellers } = storeToRefs(useBookStore());

const books = computed(() => bestSellers.value.slice(0, 10));
</script>
