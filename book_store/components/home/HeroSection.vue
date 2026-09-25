<template>
  <section class="relative overflow-hidden border-b border-border">
    <div
      class="container mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-12 md:grid-cols-12 md:gap-8 md:py-16 lg:py-20"
    >
      <div class="md:col-span-6 lg:col-span-5">
        <template v-if="lead">
          <p
            class="hero-rise mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-primary"
          >
            New arrival
          </p>

          <h1
            class="hero-rise line-clamp-3 pb-1 text-4xl font-bold leading-[1.08] tracking-tight text-foreground md:text-5xl lg:text-6xl"
            style="--rise-delay: 80ms"
          >
            {{ lead.title }}
          </h1>

          <p
            class="hero-rise mt-5 max-w-[46ch] text-base leading-relaxed text-muted-foreground md:text-lg"
            style="--rise-delay: 160ms"
          >
            By {{ lead.authors?.[0] || "Unknown author" }}<template v-if="lead.subjects?.[0]">,
              in <span class="capitalize">{{ lead.subjects[0] }}</span></template>.
            Hardback or ebook, delivered to your door or your screen.
          </p>

          <div
            class="hero-rise mt-8 flex flex-col gap-3 sm:flex-row"
            style="--rise-delay: 240ms"
          >
            <UiButton
              size="lg"
              class="h-12 px-7 text-base font-semibold active:scale-[0.98]"
              @click="router.push(`/details/${lead._id}`)"
            >
              View details
              <ArrowRight />
            </UiButton>
            <UiButton
              size="lg"
              variant="outline"
              class="h-12 px-7 text-base font-semibold active:scale-[0.98]"
              @click="emit('add-to-cart', lead._id, 1)"
            >
              <ShoppingCart />
              Add to cart
              <span v-if="lead.price" class="text-muted-foreground">{{ formatUsd(lead.price) }}</span>
            </UiButton>
          </div>
        </template>

        <div v-else class="space-y-5">
          <UiSkeleton class="h-4 w-28" />
          <UiSkeleton class="h-14 w-full" />
          <UiSkeleton class="h-14 w-3/4" />
          <UiSkeleton class="h-5 w-2/3" />
          <div class="flex gap-3 pt-3">
            <UiSkeleton class="h-12 w-40" />
            <UiSkeleton class="h-12 w-48" />
          </div>
        </div>
      </div>

      <div class="md:col-span-6 lg:col-span-7">
        <div
          class="relative mx-auto aspect-[5/4] w-full max-w-[640px] overflow-hidden rounded-2xl bg-muted/70 ring-1 ring-border"
        >
          <div
            class="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-accent/40 to-transparent dark:from-accent/10"
            aria-hidden="true"
          ></div>

          <template v-if="covers.length">
            <div
              v-for="(book, index) in covers"
              :key="book._id"
              class="absolute bottom-[12%]"
              :class="COVER_LAYOUT[index]"
            >
              <div class="hero-rise" :style="{ '--rise-delay': `${120 + index * 110}ms` }">
                <NuxtLink
                  :to="`/details/${book._id}`"
                  :aria-label="book.title"
                  class="block aspect-[2/3] overflow-hidden rounded-md bg-card shadow-[0_24px_48px_-16px_hsl(var(--foreground)/0.35)] ring-1 ring-black/5 transition-transform duration-500 ease-out hover:-translate-y-3 dark:ring-white/10"
                >
                  <img
                    :src="book.cover_url"
                    :alt="book.title"
                    class="h-full w-full object-cover"
                    :loading="index === 0 ? 'eager' : 'lazy'"
                    :fetchpriority="index === 0 ? 'high' : 'auto'"
                  />
                </NuxtLink>
              </div>
            </div>
          </template>

          <div v-else class="absolute inset-0 flex items-end justify-center gap-4 pb-[12%]">
            <UiSkeleton class="aspect-[2/3] w-[22%]" />
            <UiSkeleton class="aspect-[2/3] w-[34%]" />
            <UiSkeleton class="aspect-[2/3] w-[22%]" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ArrowRight, ShoppingCart } from "lucide-vue-next";
import { formatUsd } from "@/utils/pricing";
import type { Book } from "@/types";

const props = defineProps<{
  books: Book[];
}>();

const emit = defineEmits<{
  (e: "add-to-cart", bookId: string, quantity: number): void;
}>();

const COVER_LAYOUT = [
  "left-1/2 z-[2] w-[36%] -translate-x-1/2",
  "left-[8%] z-[1] w-[26%] -rotate-6",
  "right-[8%] z-[1] w-[26%] rotate-6",
];

const router = useRouter();

const lead = computed(() => props.books[0]);

const covers = computed(() =>
  props.books.slice(0, COVER_LAYOUT.length).filter((book) => book.cover_url)
);
</script>
