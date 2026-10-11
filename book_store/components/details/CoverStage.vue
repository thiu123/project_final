<template>
  <div
    class="group relative isolate mx-auto flex aspect-square w-full sm:aspect-[4/5] max-w-[540px] items-center justify-center overflow-hidden rounded-[2rem] bg-muted/70 ring-1 ring-border"
  >
    <div
      aria-hidden="true"
      class="absolute -right-12 -top-12 size-48 rounded-full bg-accent transition-transform duration-700 ease-out group-hover:scale-110 dark:bg-accent/80 md:size-56"
    ></div>
    <div
      aria-hidden="true"
      class="absolute -bottom-8 left-10 size-28 rotate-12 rounded-[1.75rem] bg-primary/25 transition-transform duration-700 ease-out group-hover:rotate-45"
    ></div>
    <svg
      aria-hidden="true"
      class="absolute left-7 top-20 h-16 w-16 text-foreground/15"
      viewBox="0 0 64 64"
      fill="currentColor"
    >
      <template v-for="row in 4" :key="row">
        <circle
          v-for="col in 4"
          :key="col"
          :cx="8 + (col - 1) * 16"
          :cy="8 + (row - 1) * 16"
          r="2.5"
        />
      </template>
    </svg>
    <svg
      aria-hidden="true"
      class="absolute bottom-[18%] right-[9%] h-8 w-20 text-foreground/25"
      viewBox="0 0 80 32"
      fill="none"
      stroke="currentColor"
      stroke-width="3"
      stroke-linecap="round"
    >
      <path d="M4 16c6-10 12-10 18 0s12 10 18 0 12-10 18 0 12 10 18 0" />
    </svg>

    <div
      class="relative z-[1] aspect-[2/3] w-[52%] -rotate-3 sm:w-[58%] overflow-hidden rounded-lg bg-card shadow-[0_32px_64px_-24px_hsl(var(--foreground)/0.5)] ring-1 ring-black/5 transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:rotate-0 dark:ring-white/10"
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
        class="flex h-full w-full flex-col items-center justify-center gap-3 bg-muted p-5 text-center text-muted-foreground"
      >
        <BookOpen class="size-8" />
        <span class="line-clamp-4 text-sm font-semibold">{{ book.title }}</span>
      </div>
    </div>

    <button
      type="button"
      class="absolute left-4 top-4 z-[2] flex size-11 items-center justify-center rounded-full bg-background ring-1 ring-border transition-transform duration-200 hover:scale-110 active:scale-95"
      :aria-label="favorite ? 'Remove from favorites' : 'Add to favorites'"
      :aria-pressed="favorite"
      @click="emit('toggle-favorite')"
    >
      <Heart
        :key="String(favorite)"
        class="heart-pop size-5"
        :class="favorite ? 'fill-destructive text-destructive' : 'text-foreground'"
      />
    </button>

    <div
      v-if="book.sold"
      class="absolute bottom-6 right-6 z-[2] flex size-20 rotate-12 flex-col items-center justify-center rounded-full bg-foreground text-background transition-transform duration-500 ease-out group-hover:rotate-0"
    >
      <span class="text-lg font-bold leading-none tabular-nums">{{ soldLabel }}</span>
      <span class="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em]">sold</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BookOpen, Heart } from "lucide-vue-next";
import type { Book } from "@/types";

const props = defineProps<{
  book: Partial<Book>;
  favorite: boolean;
}>();

const emit = defineEmits<{
  "toggle-favorite": [];
}>();

const compact = new Intl.NumberFormat("en", { notation: "compact" });

const soldLabel = computed(() => compact.format(props.book.sold ?? 0));
</script>
