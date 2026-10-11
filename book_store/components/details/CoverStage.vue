<template>
  <figure>
    <div class="group flex aspect-[4/5] w-full items-center justify-center bg-muted">
      <div
        class="ed-cover aspect-[2/3] w-[54%] overflow-hidden bg-card transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-2"
      >
        <img
          v-if="book.cover_url"
          :src="book.cover_url"
          :alt="`Cover of ${book.title}`"
          class="h-full w-full object-cover"
          fetchpriority="high"
        />
        <div
          v-else
          class="flex h-full w-full items-center justify-center p-6 text-center font-serif text-lg text-muted-foreground"
        >
          {{ book.title }}
        </div>
      </div>
    </div>
    <figcaption
      v-if="captionParts.length"
      class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
    >
      <template v-for="(part, index) in captionParts" :key="part">
        <span v-if="index" aria-hidden="true" class="text-border">/</span>
        <span>{{ part }}</span>
      </template>
    </figcaption>
  </figure>
</template>

<script setup lang="ts">
import type { Book } from "@/types";

const props = defineProps<{
  book: Partial<Book>;
}>();

const compact = new Intl.NumberFormat("en", { notation: "compact" });

const captionParts = computed(() => {
  const parts: string[] = [];
  if (props.book.first_publish_year) parts.push(`First published ${props.book.first_publish_year}`);
  if (props.book.sold) parts.push(`${compact.format(props.book.sold)} sold`);
  return parts;
});
</script>
