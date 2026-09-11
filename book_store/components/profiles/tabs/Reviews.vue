<template>
  <div class="min-h-[80vh]">
    <ProfilesTabsSectionHeading :icon="Star" title="My Reviews" />

    <ProfilesTabsLoadingState v-if="loading" label="Loading reviews..." />

    <div v-else-if="reviews.length">
      <div
        v-for="review in reviews"
        :key="review._id"
        class="mb-6 overflow-hidden rounded-xl bg-gradient-to-br from-white to-[#f8f9fa] shadow transition-all duration-300 hover:shadow-lg dark:from-card dark:to-card"
      >
        <div class="p-8">
          <div class="mb-6 flex items-start">
            <img
              :src="review.book?.cover_url"
              :alt="review.book?.title || 'Book cover'"
              class="mr-6 h-[120px] w-20 shrink-0 rounded-lg bg-muted object-cover shadow-md transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
            <div class="grow">
              <div class="mb-3 flex items-start justify-between">
                <div>
                  <h3 class="mb-2 text-2xl font-bold text-foreground">
                    {{ review.book?.title || "Unknown Book" }}
                  </h3>
                  <p class="mb-3 text-sm text-muted-foreground">
                    by {{ review.book?.authors?.join(", ") || "Unknown Author" }}
                  </p>
                </div>
                <UiTooltipProvider :delay-duration="200">
                  <UiTooltip>
                    <UiTooltipTrigger as-child>
                      <UiButton
                        variant="ghost"
                        size="icon"
                        class="text-destructive transition-all duration-300 hover:scale-110 hover:text-destructive"
                        aria-label="Delete Review"
                        @click="confirmDeleteReview(review._id, review.book?.title)"
                      >
                        <Trash2 class="h-5 w-5" />
                      </UiButton>
                    </UiTooltipTrigger>
                    <UiTooltipContent>Delete Review</UiTooltipContent>
                  </UiTooltip>
                </UiTooltipProvider>
              </div>

              <div class="mb-4 flex items-center">
                <UiRating :model-value="review.rating" readonly :size="16" />
                <span class="ml-3 flex items-center text-xs text-muted-foreground">
                  <Calendar class="mr-1 h-3.5 w-3.5" />
                  {{ formatDate(review.createdAt) }}
                </span>
              </div>
            </div>
          </div>

          <UiSeparator class="mb-6" />

          <div class="rounded-xl border-l-4 border-waterblue bg-muted/50 p-6">
            <p class="text-base text-foreground">{{ review.comment }}</p>
          </div>
        </div>
      </div>
    </div>

    <ProfilesTabsEmptyState
      v-else
      :icon="Star"
      title="No reviews yet"
      :action-icon="Search"
      action-label="Browse Books"
    >
      You haven't written any reviews yet. Start reading and share your thoughts!
    </ProfilesTabsEmptyState>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { Calendar, Search, Star, Trash2 } from "lucide-vue-next";
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
  return value ? new Date(value).toLocaleDateString() : "";
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
