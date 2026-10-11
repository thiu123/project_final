<template>
  <section class="container mx-auto max-w-7xl px-4">
    <div
      v-reveal
      class="flex flex-col items-center border-t border-border pt-16 text-center md:pt-24"
    >
      <div v-if="stack.length" class="flex items-end gap-3 md:gap-4" aria-hidden="true">
        <div
          v-for="(book, index) in stack"
          :key="book._id"
          class="ed-cover aspect-[2/3] overflow-hidden bg-muted"
          :class="STACK_WIDTH[index]"
        >
          <img :src="book.cover_url" alt="" class="h-full w-full object-cover" loading="lazy" />
        </div>
      </div>

      <p class="eyebrow mt-12">The full catalogue</p>
      <h2
        class="mt-6 max-w-[15ch] font-serif text-[2.75rem] font-normal leading-[1] tracking-[-0.03em] text-foreground md:text-7xl lg:text-[5.5rem]"
      >
        Can&rsquo;t find the book you <span class="italic">want</span>?
      </h2>
      <p class="mt-7 max-w-[48ch] text-[15px] leading-relaxed text-muted-foreground">
        Search the full catalogue, or
        <NuxtLink
          to="/contact"
          class="text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
        >send us the title</NuxtLink>
        and our team will get back to you.
      </p>

      <UiButton
        variant="ink"
        size="cta"
        class="mt-10 shadow-none"
        @click="router.push('/subjects/all')"
      >
        Browse the catalogue
        <ArrowRight :stroke-width="1.5" />
      </UiButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ArrowRight } from "lucide-vue-next";
import type { Book } from "@/types";

const props = defineProps<{
  books: Book[];
}>();

const STACK_WIDTH = [
  "w-10 md:w-12",
  "w-12 md:w-14",
  "w-14 md:w-16",
  "w-12 md:w-14",
  "w-10 md:w-12",
];

const router = useRouter();

const stack = computed(() => props.books.filter((book) => book.cover_url).slice(0, 5));
</script>
