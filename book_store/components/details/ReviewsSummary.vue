<template>
  <div class="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
    <div class="lg:col-span-4">
      <div class="flex items-baseline gap-3">
        <span class="font-serif text-7xl leading-none tracking-[-0.03em] tabular-nums">
          {{ rating.toFixed(1) }}
        </span>
        <span class="text-sm text-muted-foreground">out of 5</span>
      </div>
      <UiRating :model-value="rating" :size="16" readonly class="mt-5" />
      <p class="mt-2 text-sm text-muted-foreground">
        From {{ total }} {{ total === 1 ? "review" : "reviews" }}
      </p>

      <ul v-if="reviews.length" class="mt-8 space-y-2.5">
        <li
          v-for="row in breakdown"
          :key="row.stars"
          class="grid grid-cols-[1.5rem_1fr_1.5rem] items-center gap-3 text-xs tabular-nums text-muted-foreground"
        >
          <span>{{ row.stars }}</span>
          <span class="h-px bg-border">
            <span
              class="block h-px bg-foreground transition-[width] duration-700 ease-out"
              :style="{ width: `${row.percentage}%` }"
            ></span>
          </span>
          <span class="text-right">{{ row.count }}</span>
        </li>
      </ul>

      <UiButton as-child variant="outline" size="cta" class="mt-10 shadow-none">
        <NuxtLink :to="`/reviews/${bookId}`">Write a review</NuxtLink>
      </UiButton>
    </div>

    <div class="lg:col-span-8">
      <div v-if="latest.length">
        <ul class="divide-y divide-border border-y border-border">
          <li v-for="(review, index) in latest" :key="review._id" v-reveal="index * 80" class="py-8">
            <blockquote class="line-clamp-5 font-serif text-xl leading-relaxed text-foreground/90 md:text-[1.4rem]">
              &ldquo;{{ review.comment }}&rdquo;
            </blockquote>
            <div class="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span class="font-medium">{{ reviewUsername(review) }}</span>
              <UiRating :model-value="review.rating" :size="12" readonly />
              <span class="text-muted-foreground">{{ formatReviewDate(review.createdAt) }}</span>
            </div>
          </li>
        </ul>

        <NuxtLink
          v-if="total > latest.length"
          :to="`/reviews/${bookId}`"
          class="group mt-8 inline-flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.14em]"
        >
          <span class="ed-link">Read all {{ total }} reviews</span>
          <ArrowRight class="size-4 transition-transform group-hover:translate-x-1" />
        </NuxtLink>
      </div>

      <div v-else class="border-y border-border py-16">
        <template v-if="locked">
          <p class="font-serif text-3xl leading-tight">
            {{ total }} {{ total === 1 ? "reader has" : "readers have" }} <span class="italic">weighed in.</span>
          </p>
          <p class="mt-3 text-[15px] text-muted-foreground">Sign in to read what they thought of this book.</p>
          <UiButton variant="ink" size="cta" class="mt-8 shadow-none" @click="emit('sign-in')">
            Sign in to read reviews
          </UiButton>
        </template>
        <template v-else>
          <p class="font-serif text-3xl leading-tight">
            No reviews <span class="italic">yet.</span>
          </p>
          <p class="mt-3 text-[15px] text-muted-foreground">
            Read it already? Be the first to tell other readers what you thought.
          </p>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight } from "lucide-vue-next";
import {
  formatReviewDate,
  reviewUsername,
  type RatingBreakdown,
} from "@/utils/reviews";
import type { Review } from "@/types";

const LATEST_COUNT = 3;

const props = defineProps<{
  bookId: string;
  rating: number;
  total: number;
  breakdown: RatingBreakdown;
  reviews: Review[];
  locked: boolean;
}>();

const emit = defineEmits<{
  "sign-in": [];
}>();

const latest = computed(() =>
  [...props.reviews]
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    )
    .slice(0, LATEST_COUNT)
);
</script>
