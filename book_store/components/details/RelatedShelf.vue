<template>
  <section v-if="books.length" aria-labelledby="related-heading">
    <div class="mb-8 flex items-end justify-between gap-6">
      <h2 id="related-heading" class="text-2xl font-bold tracking-tight md:text-3xl">
        More from <span class="capitalize">{{ subject }}</span>
      </h2>
      <NuxtLink
        :to="`/subjects/${slug}`"
        class="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary"
      >
        Browse shelf
        <ArrowRight class="size-4 transition-transform group-hover:translate-x-1" />
      </NuxtLink>
    </div>

    <div class="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
      <NuxtLink
        v-for="(book, index) in books"
        :key="book._id"
        v-reveal="index * 70"
        :to="`/details/${book._id}`"
        class="group block"
      >
        <div
          class="flex aspect-[4/5] items-center justify-center rounded-2xl ring-1 ring-border"
          :class="TONES[index % TONES.length]"
        >
          <div
            class="aspect-[2/3] w-[62%] overflow-hidden rounded-md bg-card shadow-[0_18px_36px_-16px_hsl(var(--foreground)/0.45)] transition-transform duration-500 ease-out group-hover:-translate-y-2"
            :class="index % 2 ? 'group-hover:rotate-3' : 'group-hover:-rotate-3'"
          >
            <img
              v-if="book.cover_url"
              :src="book.cover_url"
              :alt="book.title"
              class="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
        <p class="mt-3 line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary">
          {{ book.title }}
        </p>
        <p class="mt-1 truncate text-xs text-muted-foreground">
          {{ book.authors?.[0] || "Unknown author" }}
        </p>
        <p class="mt-1.5 text-sm font-bold tabular-nums">{{ formatUsd(book.price) }}</p>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ArrowRight } from "lucide-vue-next";
import { getBooks } from "@/api/bookApi";
import { formatUsd } from "@/utils/pricing";
import { subjectSlug } from "@/utils/subjects";
import type { Book } from "@/types";

const SHELF_SIZE = 6;

const TONES = ["bg-accent/40", "bg-primary/10", "bg-muted", "bg-success/10"];

const props = defineProps<{
  subject: string;
  excludeId: string;
}>();

const books = ref<Book[]>([]);

const slug = computed(() => subjectSlug(props.subject));

onMounted(async () => {
  try {
    const response = await getBooks({ subject: props.subject, limit: SHELF_SIZE + 1 });
    books.value = response.data.items
      .filter((book) => book._id !== props.excludeId)
      .slice(0, SHELF_SIZE);
  } catch (error) {
    console.error("Error fetching related books:", error);
  }
});
</script>
