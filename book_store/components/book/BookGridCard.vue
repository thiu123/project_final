<template>
  <div
    class="group flex h-full flex-col overflow-hidden rounded-xl border border-transparent bg-card shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl"
  >
    <div
      class="relative flex min-h-[320px] items-center justify-center bg-gradient-to-br from-muted/60 to-muted p-5"
    >
      <NuxtLink
        :to="`/details/${book._id}`"
        class="relative aspect-[2/3] w-[70%] max-w-[200px] overflow-hidden shadow-lg transition-all duration-500 group-hover:-translate-y-2 group-hover:scale-105 group-hover:shadow-2xl"
      >
        <img
          v-if="book.cover_url"
          class="block h-full w-full object-cover"
          :src="book.cover_url"
          :alt="book.title"
          loading="lazy"
        />
      </NuxtLink>

      <button
        type="button"
        class="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition-transform hover:scale-105 dark:bg-card"
        :aria-label="favorite ? 'Remove from favorites' : 'Add to favorites'"
        @click.stop="emit('toggle-favorite', book._id)"
      >
        <Heart
          class="h-6 w-6"
          :class="favorite ? 'fill-current text-red-500' : 'text-muted-foreground'"
        />
      </button>

      <UiBadge class="absolute bottom-3 left-3 shadow">
        {{ formatUsd(book.price) }}
      </UiBadge>
    </div>

    <div class="grow p-4">
      <div class="mb-3 flex items-center">
        <UiRating :model-value="book.rating || 0" :size="16" readonly class="mr-2" />
      </div>

      <NuxtLink
        :to="`/details/${book._id}`"
        class="mb-2 block truncate text-base font-bold text-foreground no-underline hover:text-primary"
        :title="book.title"
      >
        {{ book.title }}
      </NuxtLink>

      <div class="mb-3 text-sm text-muted-foreground">
        by {{ book.authors?.[0] || "Unknown Author" }}
      </div>

      <UiBadge variant="success" class="mb-2 text-[10px]">
        <Flame class="h-3 w-3" />
        Sold {{ book.sold || 0 }}
      </UiBadge>
    </div>

    <div class="p-4 pt-0">
      <UiButton
        size="lg"
        block
        class="rounded-lg text-sm font-bold"
        :disabled="outOfStock"
        @click="emit('add-to-cart', book._id)"
      >
        <ShoppingCart class="h-5 w-5" />
        {{ outOfStock ? "Out of Stock" : "Add to Cart" }}
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Flame, Heart, ShoppingCart } from "lucide-vue-next";
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
