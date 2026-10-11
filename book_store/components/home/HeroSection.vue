<template>
  <section class="container mx-auto max-w-7xl px-4 pt-10 md:pt-16">
    <div class="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
      <div class="flex flex-col lg:col-span-5">
        <template v-if="lead">
          <p class="hero-rise eyebrow flex items-center gap-3">
            <span class="text-foreground">New arrival</span>
            <span class="h-px w-8 bg-border" aria-hidden="true" />
            <span class="truncate leading-normal">{{ lead.subjects?.[0] || "This week" }}</span>
          </p>

          <h1
            class="hero-rise mt-6 line-clamp-4 pb-2 pt-[0.14em] font-serif text-[3.25rem] font-normal leading-[1.02] tracking-[-0.03em] text-foreground md:text-7xl xl:text-[5.25rem]"
            style="--rise-delay: 80ms"
          >
            {{ lead.title }}
          </h1>

          <p
            class="hero-rise mt-5 font-serif text-2xl leading-snug text-foreground md:text-[1.75rem]"
            style="--rise-delay: 140ms"
          >
            <span class="italic text-muted-foreground">by</span>
            {{ lead.authors?.[0] || "Unknown author" }}
          </p>

          <p
            class="hero-rise mt-5 max-w-[42ch] text-[15px] leading-relaxed text-muted-foreground"
            style="--rise-delay: 200ms"
          >
            In hardback for the shelf or as an ebook for the journey, delivered to your door or your
            screen.
          </p>

          <div
            class="hero-rise mt-10 flex flex-wrap items-center gap-x-8 gap-y-5"
            style="--rise-delay: 260ms"
          >
            <UiButton
              variant="ink"
              size="cta"
              class="shadow-none"
              @click="router.push(`/details/${lead._id}`)"
            >
              View details
              <ArrowRight :stroke-width="1.5" />
            </UiButton>
            <button
              type="button"
              class="inline-flex items-baseline gap-3 text-[13px] font-medium uppercase tracking-[0.14em] text-foreground"
              @click="emit('add-to-cart', lead._id, 1)"
            >
              <span class="ed-link">Add to cart</span>
              <span v-if="lead.price" class="text-[13px] normal-case tracking-normal tabular-nums text-muted-foreground">
                {{ formatUsd(lead.price) }}
              </span>
            </button>
          </div>

          <div class="hidden min-h-12 flex-1 lg:block" aria-hidden="true" />

          <dl
            class="hero-rise mt-12 grid grid-cols-3 gap-6 border-t border-border pt-6 lg:mt-0"
            style="--rise-delay: 320ms"
          >
            <div v-for="fact in facts" :key="fact.label" class="min-w-0">
              <dt class="eyebrow">{{ fact.label }}</dt>
              <dd class="mt-3 truncate font-serif text-xl capitalize tabular-nums text-foreground">{{ fact.value }}</dd>
            </div>
          </dl>
        </template>

        <div v-else class="space-y-5">
          <UiSkeleton class="h-3 w-40 rounded-none" />
          <UiSkeleton class="mt-8 h-16 w-full rounded-none" />
          <UiSkeleton class="h-16 w-3/4 rounded-none" />
          <UiSkeleton class="h-7 w-1/2 rounded-none" />
          <UiSkeleton class="h-5 w-2/3 rounded-none" />
          <div class="flex gap-6 pt-5">
            <UiSkeleton class="h-12 w-44 rounded-none" />
            <UiSkeleton class="h-12 w-32 rounded-none" />
          </div>
        </div>
      </div>

      <div class="lg:col-span-7">
        <div class="relative aspect-[4/3] w-full overflow-hidden bg-muted lg:aspect-auto lg:h-full lg:min-h-[560px]">
          <p class="eyebrow absolute left-5 top-5 md:left-7 md:top-7">Latest arrivals</p>

          <div
            class="absolute inset-x-[10%] bottom-[12%] h-px bg-foreground/10"
            aria-hidden="true"
          />

          <div
            v-if="covers.length"
            class="absolute inset-x-[8%] bottom-[12%] flex items-end justify-center gap-[5%]"
          >
            <div
              v-for="(book, index) in covers"
              :key="book._id"
              :class="COVER_LAYOUT[index]"
            >
              <div class="hero-rise" :style="{ '--rise-delay': `${120 + index * 110}ms` }">
                <NuxtLink
                  :to="`/details/${book._id}`"
                  :aria-label="book.title"
                  class="ed-cover block aspect-[2/3] overflow-hidden bg-card transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5"
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
          </div>

          <div
            v-else
            class="absolute inset-x-[8%] bottom-[12%] flex items-end justify-center gap-[5%]"
          >
            <UiSkeleton class="order-1 aspect-[2/3] w-[26%] rounded-none" />
            <UiSkeleton class="order-2 aspect-[2/3] w-[38%] rounded-none" />
            <UiSkeleton class="order-3 aspect-[2/3] w-[26%] rounded-none" />
          </div>
        </div>

        <p v-if="covers.length" class="mt-3 line-clamp-1 text-[13px] text-muted-foreground">
          <span class="italic">Pictured:</span>
          {{ covers.map((book) => book.title).join(", ") }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ArrowRight } from "lucide-vue-next";
import { formatUsd, unitPrice } from "@/utils/pricing";
import type { Book } from "@/types";

const props = defineProps<{
  books: Book[];
}>();

const emit = defineEmits<{
  (e: "add-to-cart", bookId: string, quantity: number): void;
}>();

const COVER_LAYOUT = [
  "order-2 w-[38%]",
  "order-1 w-[26%]",
  "order-3 w-[26%]",
];

const router = useRouter();

const lead = computed(() => props.books[0]);

const covers = computed(() =>
  props.books.slice(0, COVER_LAYOUT.length).filter((book) => book.cover_url)
);

const facts = computed(() => {
  const book = lead.value;
  if (!book) return [];
  const candidates = [
    book.price > 0 && { label: "Hardback", value: formatUsd(book.price) },
    book.price > 0 && { label: "Ebook", value: formatUsd(unitPrice(book.price, "ebook")) },
    book.first_publish_year && { label: "Published", value: String(book.first_publish_year) },
    book.rating && { label: "Rating", value: `${book.rating.toFixed(1)} / 5` },
    book.subjects?.[0] && { label: "Shelf", value: book.subjects[0] },
  ];
  return candidates
    .filter((fact): fact is { label: string; value: string } => Boolean(fact))
    .slice(0, 3);
});
</script>
