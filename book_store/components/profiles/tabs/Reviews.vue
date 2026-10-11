<template>
  <section>
    <ProfilesTabsSectionHeading
      :eyebrow="loading ? 'Reviews' : `${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'}`"
      title="My reviews"
      description="What you have said about the books you have read."
    />

    <ProfilesTabsLoadingState v-if="loading" label="Loading reviews..." />

    <ul v-else-if="reviews.length" class="divide-y divide-border border-b border-border">
      <li
        v-for="review in reviews"
        :key="review._id"
        class="grid grid-cols-[56px_minmax(0,1fr)] gap-5 py-8 first:pt-2 sm:grid-cols-[80px_minmax(0,1fr)] sm:gap-8"
      >
        <NuxtLink
          v-if="review.book"
          :to="`/details/${review.book._id}`"
          class="ed-cover block aspect-[2/3] self-start overflow-hidden bg-muted"
          :aria-label="review.book.title"
        >
          <img
            v-if="review.book.cover_url"
            :src="review.book.cover_url"
            :alt="review.book.title || 'Book cover'"
            class="h-full w-full object-cover"
            loading="lazy"
          />
        </NuxtLink>
        <div v-else class="aspect-[2/3] self-start bg-muted" />

        <div class="min-w-0">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="eyebrow truncate leading-normal">
                {{ review.book?.authors?.join(", ") || "Unknown author" }}
              </p>
              <NuxtLink
                v-if="review.book"
                :to="`/details/${review.book._id}`"
                class="mt-1.5 block font-serif text-xl leading-snug text-foreground transition-colors hover:text-primary md:text-2xl"
              >
                {{ review.book.title || "Unknown Book" }}
              </NuxtLink>
              <h3 v-else class="mt-1.5 font-serif text-xl leading-snug md:text-2xl">Unknown Book</h3>
            </div>

            <button
              type="button"
              class="inline-flex shrink-0 items-center gap-2 pt-0.5 text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-destructive"
              aria-label="Delete review"
              @click="confirmDeleteReview(review._id, review.book?.title)"
            >
              <Trash2 class="size-4" :stroke-width="1.5" />
              <span class="ed-link hidden sm:inline">Delete</span>
            </button>
          </div>

          <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
            <UiRating :model-value="review.rating" readonly :size="13" />
            <span class="text-[12px] tabular-nums text-muted-foreground">
              {{ formatDate(review.createdAt) }}
            </span>
          </div>

          <p class="mt-4 max-w-[64ch] whitespace-pre-line text-[15px] leading-relaxed text-foreground/85">
            {{ review.comment }}
          </p>
        </div>
      </li>
    </ul>

    <ProfilesTabsEmptyState
      v-else
      title="No reviews yet."
      action-label="Browse books"
    >
      You haven't written any reviews yet. Start reading and share your thoughts!
    </ProfilesTabsEmptyState>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { Trash2 } from "lucide-vue-next";
import { useReviewStore } from "@/stores/review";
import type { Book } from "@/types";

defineProps<{ loading: boolean }>();

const reviewStore = useReviewStore();
const { userReviews } = storeToRefs(reviewStore);

// `bookId` comes back populated on this endpoint; `book` names what it holds.
const reviews = computed(() =>
  userReviews.value.map((review) => ({
    ...review,
    book: typeof review.bookId === "object" ? (review.bookId as Book) : null,
  }))
);

function formatDate(value?: string) {
  return value
    ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "";
}

function confirmDeleteReview(reviewId: string, bookTitle?: string) {
  const label = bookTitle ? `"${bookTitle}"` : "this book";
  if (
    confirm(
      `Are you sure you want to delete your review for ${label}? This action cannot be undone.`
    )
  ) {
    reviewStore.deleteReview(reviewId);
  }
}
</script>
