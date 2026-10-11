<template>
  <article class="group flex h-full flex-col">
    <div class="relative bg-muted transition-colors duration-500 group-hover:bg-accent">
      <NuxtLink
        :to="`/details/${book._id}`"
        class="flex aspect-[4/5] items-center justify-center"
        :aria-label="book.title"
      >
        <div
          class="ed-cover aspect-[2/3] w-[60%] overflow-hidden bg-card transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1.5"
        >
          <img
            v-if="book.cover_url"
            class="h-full w-full object-cover"
            :src="book.cover_url"
            :alt="book.title"
            loading="lazy"
          />
          <div v-else class="flex h-full items-center justify-center p-3 text-center font-serif text-sm text-muted-foreground">
            {{ book.title }}
          </div>
        </div>
      </NuxtLink>

      <button
        type="button"
        class="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-background/90 text-foreground transition-all duration-300 hover:scale-105 focus-visible:opacity-100"
        :class="!favorite && '[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100'"
        :aria-label="favorite ? 'Remove from favorites' : 'Add to favorites'"
        :aria-pressed="favorite"
        @click="emit('toggle-favorite', book._id)"
      >
        <Heart class="size-4" :class="favorite && 'fill-primary text-primary'" />
      </button>

      <span
        v-if="outOfStock"
        class="absolute left-3 top-3 bg-background px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]"
      >
        Sold out
      </span>

      <button
        v-else
        type="button"
        class="absolute inset-x-3 bottom-3 flex h-10 items-center justify-center gap-2 bg-foreground text-[11px] font-semibold uppercase tracking-[0.16em] text-background transition-all duration-300 hover:bg-foreground/85 focus-visible:translate-y-0 focus-visible:opacity-100 [@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100"
        @click="emit('add-to-cart', book._id)"
      >
        <Plus class="size-3.5" />
        Add to cart
      </button>
    </div>

    <div class="flex grow flex-col pt-4">
      <p class="eyebrow truncate leading-normal">
        {{ book.authors?.[0] || "Unknown author" }}
      </p>
      <NuxtLink
        :to="`/details/${book._id}`"
        class="mt-2 line-clamp-2 font-serif text-[1.2rem] leading-snug text-foreground transition-colors hover:text-primary"
        :title="book.title"
      >
        {{ book.title }}
      </NuxtLink>
      <div class="mt-auto flex items-baseline justify-between gap-3 pt-3 text-sm">
        <span class="tabular-nums">{{ formatUsd(book.price) }}</span>
        <span v-if="book.rating" class="flex items-center gap-1 text-xs text-muted-foreground">
          <Star class="size-3 fill-current" />
          {{ book.rating.toFixed(1) }}
        </span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { Heart, Plus, Star } from "lucide-vue-next";
import type { Book } from "@/types";
import { formatUsd } from "@/utils/pricing";

const props = defineProps<{
  book: Book;
  favorite: boolean;
}>();

const emit = defineEmits<{
  "add-to-cart": [bookId: string];
  "toggle-favorite": [bookId: string];
}>();

const outOfStock = computed(() => (props.book.stock ?? 0) <= 0);
</script>
