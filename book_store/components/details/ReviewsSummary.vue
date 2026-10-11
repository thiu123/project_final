<template>
  <div class="grid grid-cols-1 gap-10 rounded-[2rem] bg-muted/60 p-6 md:p-10 lg:grid-cols-12 lg:gap-14">
    <div class="lg:col-span-4">
      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Reader reviews
      </p>

      <div class="mt-4 flex items-end gap-2">
        <span class="text-7xl font-bold leading-none tracking-tight tabular-nums">
          {{ rating.toFixed(1) }}
        </span>
        <span class="pb-2 text-xl font-semibold text-muted-foreground">/5</span>
      </div>

      <UiRating :model-value="rating" :size="20" readonly class="mt-3" />
      <p class="mt-2 text-sm text-muted-foreground">
        From {{ total }} {{ total === 1 ? "review" : "reviews" }}
      </p>

      <ul v-if="reviews.length" class="mt-6 space-y-2">
        <li
          v-for="row in breakdown"
          :key="row.stars"
          class="flex items-center gap-3 text-xs tabular-nums"
        >
          <span class="flex w-7 items-center gap-0.5 font-semibold">
            {{ row.stars }}
            <Star class="size-3 fill-amber-400 text-amber-400" />
          </span>
          <span class="h-2 grow overflow-hidden rounded-full bg-background">
            <span
              class="block h-full rounded-full bg-amber-400 transition-[width] duration-700 ease-out"
              :style="{ width: `${row.percentage}%` }"
            ></span>
          </span>
          <span class="w-6 text-right text-muted-foreground">{{ row.count }}</span>
        </li>
      </ul>

      <UiButton
        as-child
        variant="ink"
        class="mt-8 h-11 rounded-full px-6 font-semibold"
      >
        <NuxtLink :to="`/reviews/${bookId}`">
          <Pencil />
          Write a review
        </NuxtLink>
      </UiButton>
    </div>

    <div class="lg:col-span-8">
      <div v-if="latest.length" class="grid gap-4">
        <article
          v-for="(review, index) in latest"
          :key="review._id"
          v-reveal="index * 80"
          class="rounded-2xl bg-card p-5 ring-1 ring-border transition-transform duration-300 hover:-translate-y-0.5 md:p-6"
        >
          <header class="flex items-center gap-3">
            <UserAvatar
              :src="reviewAvatar(review)"
              :name="reviewUsername(review)"
              class="size-10 text-sm font-bold"
              :class="avatarTone(reviewUsername(review))"
            />
            <div class="min-w-0 grow">
              <p class="truncate text-sm font-semibold">{{ reviewUsername(review) }}</p>
              <p class="text-xs text-muted-foreground">
                {{ formatReviewDate(review.createdAt) }}
              </p>
            </div>
            <UiRating :model-value="review.rating" :size="14" readonly />
          </header>
          <p class="mt-4 line-clamp-4 text-[15px] leading-relaxed text-foreground/90">
            {{ review.comment }}
          </p>
        </article>

        <NuxtLink
          v-if="total > latest.length"
          :to="`/reviews/${bookId}`"
          class="group inline-flex items-center gap-1.5 self-start text-sm font-semibold"
        >
          Read all {{ total }} reviews
          <ArrowRight class="size-4 transition-transform group-hover:translate-x-1" />
        </NuxtLink>
      </div>

      <div
        v-else
        class="flex h-full min-h-[280px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/60 p-8 text-center"
      >
        <div class="relative mb-5">
          <div class="flex size-16 -rotate-6 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <LockKeyhole v-if="locked" class="size-7" />
            <MessageCircle v-else class="size-7" />
          </div>
          <Star
            class="absolute -right-3 -top-2 size-6 rotate-12 fill-amber-400 text-amber-400"
          />
        </div>
        <template v-if="locked">
          <p class="text-lg font-semibold">
            {{ total }} {{ total === 1 ? "reader has" : "readers have" }} weighed in
          </p>
          <p class="mt-1 max-w-[36ch] text-sm text-muted-foreground">
            Sign in to read what they thought of this book.
          </p>
          <UiButton
            variant="outline"
            class="mt-5 h-10 rounded-full px-5 font-semibold"
            @click="emit('sign-in')"
          >
            Sign in to read reviews
          </UiButton>
        </template>
        <template v-else>
          <p class="text-lg font-semibold">No reviews yet</p>
          <p class="mt-1 max-w-[36ch] text-sm text-muted-foreground">
            Read it already? Be the first to tell other readers what you thought.
          </p>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, LockKeyhole, MessageCircle, Pencil, Star } from "lucide-vue-next";
import {
  avatarTone,
  formatReviewDate,
  reviewAvatar,
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
