<template>
  <div
    class="group flex h-full w-full cursor-pointer flex-col overflow-hidden bg-card"
    @click="router.push(`/details/${book._id}`)"
  >
    <!-- Cover -->
    <div class="relative flex items-center justify-center p-5">
      <div
        class="aspect-[2/3] w-[75%] max-w-[180px] overflow-hidden bg-muted transition-all [transition-duration:400ms] ease-in-out group-hover:-translate-y-2 group-hover:scale-105 group-hover:shadow-[0_16px_40px_rgba(0,0,0,0.25)]"
      >
        <img
          :src="book.cover_url"
          :alt="book.title"
          class="block h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <button
        type="button"
        :aria-label="favorite ? 'Remove from favorites' : 'Add to favorites'"
        class="absolute right-3 top-3 rounded-full p-1 opacity-90 transition-all duration-300 hover:scale-110 hover:opacity-100"
        @click.stop="emit('toggle-favorite', book._id)"
      >
        <Heart
          class="h-6 w-6"
          :class="favorite ? 'fill-destructive text-destructive' : 'text-gray-100'"
        />
      </button>

      <span
        class="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-[0.5px]"
        :class="badgeClass"
      >
        {{ badgeLabel }}
      </span>
    </div>

    <!-- Details -->
    <div class="flex grow flex-col px-4 pb-3 pt-4">
      <div class="mb-2 flex items-center">
        <UiRating :model-value="book.rating || 0" :size="16" readonly class="mr-2" />
      </div>

      <div
        class="mb-2 truncate text-base font-medium leading-[1.3] text-foreground"
        :title="book.title"
      >
        {{ book.title }}
      </div>

      <UiBadge
        variant="success"
        class="mb-2 w-fit px-2 text-[10px] font-semibold tracking-[0.5px]"
      >
        <Flame class="h-3 w-3" />
        Sold {{ book.sold || 0 }}
      </UiBadge>

      <div class="mt-auto flex items-center justify-between">
        <span class="text-lg font-bold text-darkgreen dark:text-foreground">
          {{ formatUsd(book.price) }}
        </span>
      </div>
    </div>

    <!-- Add to cart -->
    <div class="flex justify-center px-4 pb-4 pt-0">
      <UiButton
        variant="secondary"
        size="lg"
        block
        class="rounded-lg text-sm font-medium tracking-[0.5px] shadow transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(67,80,88,0.3)]"
        @click.stop="emit('add-to-cart', book._id, 1)"
      >
        <ShoppingCart class="h-4 w-4" />
        Add to Cart
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Flame, Heart, ShoppingCart } from "lucide-vue-next";
import type { Book } from "@/types";
import { formatUsd } from "@/utils/pricing";

defineProps<{
  book: Book;
  /** Whether the signed-in user has hearted this book. */
  favorite: boolean;
  badgeLabel: string;
  badgeClass: string;
}>();

const emit = defineEmits<{
  "add-to-cart": [bookId: string, quantity: number];
  "toggle-favorite": [bookId: string];
}>();

const router = useRouter();
</script>
