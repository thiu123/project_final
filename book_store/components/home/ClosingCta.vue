<template>
  <section class="container mx-auto my-16 max-w-7xl px-4 md:my-24">
    <div
      v-reveal
      class="flex flex-col items-center rounded-2xl border border-border px-5 py-14 text-center md:py-20"
    >
      <div v-if="stack.length" class="mb-8 flex -space-x-5" aria-hidden="true">
        <div
          v-for="(book, index) in stack"
          :key="book._id"
          class="aspect-[2/3] w-14 overflow-hidden rounded-md bg-muted shadow-[0_10px_20px_-10px_hsl(var(--foreground)/0.45)] ring-2 ring-background md:w-16"
          :style="{ transform: `rotate(${(index - (stack.length - 1) / 2) * 6}deg)` }"
        >
          <img :src="book.cover_url" alt="" class="h-full w-full object-cover" loading="lazy" />
        </div>
      </div>

      <h2 class="max-w-[20ch] text-3xl font-bold leading-[1.1] tracking-tight text-foreground md:text-5xl">
        Can't find the book you want?
      </h2>
      <p class="mt-5 max-w-[52ch] text-base leading-relaxed text-muted-foreground md:text-lg">
        Search the full catalogue, or send us the title and our team will get back to you.
      </p>

      <div class="mt-8 flex flex-col gap-3 sm:flex-row">
        <UiButton
          size="lg"
          class="h-12 px-7 text-base font-semibold active:scale-[0.98]"
          @click="router.push('/subjects/all')"
        >
          <Search />
          Browse catalogue
        </UiButton>
        <UiButton
          size="lg"
          variant="outline"
          class="h-12 px-7 text-base font-semibold active:scale-[0.98]"
          @click="router.push('/contact')"
        >
          <Mail />
          Contact us
        </UiButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Mail, Search } from "lucide-vue-next";
import type { Book } from "@/types";

const props = defineProps<{
  books: Book[];
}>();

const router = useRouter();

const stack = computed(() => props.books.filter((book) => book.cover_url).slice(0, 5));
</script>
