<template>
  <div class="min-h-screen bg-background">
    <div class="container mx-auto max-w-7xl px-4 pt-8 md:pt-12">
      <nav aria-label="Breadcrumb" class="mb-10">
        <ol class="flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
          <li>
            <NuxtLink to="/" class="transition-colors hover:text-foreground">Home</NuxtLink>
          </li>
          <li aria-hidden="true" class="text-border">/</li>
          <li class="max-w-[32ch] truncate">
            <NuxtLink :to="`/details/${bookId}`" class="transition-colors hover:text-foreground">
              {{ book.title || "Book" }}
            </NuxtLink>
          </li>
          <li aria-hidden="true" class="text-border">/</li>
          <li class="text-foreground" aria-current="page">Reviews</li>
        </ol>
      </nav>

      <header class="hero-rise border-b border-border pb-10">
        <p class="eyebrow">Reader reviews</p>
        <h1
          id="reviews-heading"
          class="mt-5 max-w-4xl font-serif text-4xl font-normal leading-[1.04] tracking-[-0.025em] md:text-6xl"
        >
          What readers think of <span class="italic">{{ book.title || "this book" }}</span>
        </h1>
      </header>

      <div class="mt-12 grid grid-cols-1 items-start gap-14 lg:grid-cols-12 lg:gap-16">
        <aside class="hero-rise space-y-10 lg:sticky lg:top-36 lg:col-span-4" style="--rise-delay: 80ms">
          <NuxtLink :to="`/details/${bookId}`" class="group flex items-center gap-5">
            <div class="ed-cover aspect-[2/3] w-16 shrink-0 overflow-hidden bg-muted">
              <img
                v-if="book.cover_url"
                :src="book.cover_url"
                :alt="`Cover of ${book.title}`"
                class="h-full w-full object-cover"
              />
            </div>
            <div class="min-w-0">
              <p class="line-clamp-2 font-serif text-lg leading-snug transition-colors group-hover:text-primary">
                {{ book.title || "Loading..." }}
              </p>
              <p v-if="book.authors?.[0]" class="mt-1 truncate text-sm text-muted-foreground">
                by {{ book.authors[0] }}
              </p>
              <span class="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em]">
                <ArrowLeft class="size-3.5 transition-transform group-hover:-translate-x-0.5" />
                <span class="ed-link">Back to the book</span>
              </span>
            </div>
          </NuxtLink>

          <div class="border-t border-border pt-10">
            <div class="flex items-baseline gap-3">
              <span class="font-serif text-7xl leading-none tracking-[-0.03em] tabular-nums">
                {{ displayRating.toFixed(1) }}
              </span>
              <span class="text-sm text-muted-foreground">out of 5</span>
            </div>
            <UiRating :model-value="displayRating" :size="16" readonly class="mt-5" />
            <p class="mt-2 text-sm text-muted-foreground">
              From {{ totalReviews }} {{ totalReviews === 1 ? "review" : "reviews" }}
            </p>

            <ul v-if="reviews.length" class="mt-8 space-y-1" aria-label="Filter by rating">
              <li v-for="row in breakdown" :key="row.stars">
                <button
                  type="button"
                  class="grid w-full grid-cols-[3.25rem_1fr_1.5rem] items-center gap-3 py-1.5 text-left text-xs tabular-nums transition-colors disabled:pointer-events-none disabled:opacity-40"
                  :class="starFilter === row.stars ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'"
                  :aria-pressed="starFilter === row.stars"
                  :disabled="row.count === 0"
                  @click="toggleStarFilter(row.stars)"
                >
                  <span :class="starFilter === row.stars && 'underline underline-offset-4'">
                    {{ row.stars }} star
                  </span>
                  <span class="h-px bg-border">
                    <span
                      class="block h-px bg-foreground transition-[width] duration-700 ease-out"
                      :style="{ width: `${row.percentage}%` }"
                    ></span>
                  </span>
                  <span class="text-right">{{ row.count }}</span>
                </button>
              </li>
            </ul>

            <UiButton
              variant="ink"
              size="cta"
              block
              class="mt-10 shadow-none"
              @click="openReviewForm(null)"
            >
              Write a review
            </UiButton>
          </div>
        </aside>

        <section class="lg:col-span-8" aria-labelledby="reviews-heading">
          <div
            class="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4"
          >
            <p class="text-sm text-muted-foreground">
              <template v-if="starFilter">
                Showing {{ visibleReviews.length }} {{ starFilter }}-star
                {{ visibleReviews.length === 1 ? "review" : "reviews" }}
                <button
                  type="button"
                  class="ed-link ml-2 inline-flex items-center gap-1 text-foreground"
                  @click="starFilter = null"
                >
                  Clear
                  <X class="size-3" />
                </button>
              </template>
              <template v-else>
                {{ reviews.length }} {{ reviews.length === 1 ? "review" : "reviews" }}
              </template>
            </p>

            <div v-if="reviews.length > 1" role="group" aria-label="Sort reviews" class="flex gap-6">
              <button
                v-for="option in SORT_OPTIONS"
                :key="option.value"
                type="button"
                class="text-[11px] font-medium uppercase tracking-[0.16em] transition-colors"
                :class="
                  sort === option.value
                    ? 'text-foreground underline underline-offset-[6px]'
                    : 'text-muted-foreground hover:text-foreground'
                "
                :aria-pressed="sort === option.value"
                @click="sort = option.value"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <div v-if="loading" class="divide-y divide-border" aria-busy="true">
            <div v-for="n in 3" :key="n" class="py-8">
              <div class="flex items-center gap-3">
                <UiSkeleton class="size-9 rounded-full" />
                <div class="space-y-2">
                  <UiSkeleton class="h-3 w-28 rounded-none" />
                  <UiSkeleton class="h-3 w-20 rounded-none" />
                </div>
              </div>
              <UiSkeleton class="mt-6 h-5 w-full rounded-none" />
              <UiSkeleton class="mt-3 h-5 w-4/5 rounded-none" />
            </div>
          </div>

          <div v-else-if="locked" class="py-16">
            <p class="font-serif text-3xl leading-tight md:text-4xl">
              Sign in to <span class="italic">read reviews.</span>
            </p>
            <p class="mt-3 text-[15px] text-muted-foreground">
              Reviews are shared with signed-in readers only.
            </p>
            <UiButton variant="ink" size="cta" class="mt-8 shadow-none" @click="handleSignIn">
              Sign in
            </UiButton>
          </div>

          <div v-else-if="visibleReviews.length" class="divide-y divide-border">
            <ReviewsReviewCard
              v-for="(review, index) in visibleReviews"
              :key="review._id"
              v-reveal="Math.min(index, 6) * 60"
              :review="review"
              :current-user="currentUser"
              :is-admin="isAdmin"
              @edit="openReviewForm"
              @delete="askToDeleteReview"
              @edit-reply="openReplyForm"
              @delete-reply="deleteReviewReply"
              @replied="reloadReviews"
              @error="notifyError"
            />
          </div>

          <div v-else class="py-16">
            <p class="font-serif text-3xl leading-tight md:text-4xl">
              No reviews <span class="italic">yet.</span>
            </p>
            <p class="mt-3 text-[15px] text-muted-foreground">
              Read it already? Be the first to tell other readers what you thought.
            </p>
            <UiButton variant="outline" size="cta" class="mt-8 shadow-none" @click="openReviewForm(null)">
              Write the first review
            </UiButton>
          </div>
        </section>
      </div>
    </div>

    <ReviewsReviewFormDialog
      v-model:open="reviewFormDialog"
      :review="editedReview"
      :saving="savingReview"
      @submit="saveReview"
    />

    <ReviewsReplyFormDialog
      v-model:open="replyFormDialog"
      :initial-content="editedReply?.content ?? ''"
      :saving="savingReply"
      @submit="saveReply"
    />

    <AdminConfirmDeleteDialog
      v-model:open="deleteReviewDialog"
      question="Are you sure you want to delete this review?"
      :loading="deletingReview"
      @confirm="deleteReview"
    />

    <AdminConfirmDeleteDialog
      v-model:open="deleteReplyDialog"
      question="Are you sure you want to delete this reply?"
      :loading="deletingReply"
      @confirm="deleteReply"
    />

    <SnackbarAlert
      v-model="snackbar.show"
      :text="snackbar.message"
      :color="snackbar.color"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ArrowLeft, X } from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth";
import { useAuthDialogStore } from "@/stores/authDialog";
import { useReviewStore } from "@/stores/review";
import { useSnackbar } from "@/composables/useSnackbar";
import {
  deleteReply as deleteReplyApi,
  editReview,
  getAverageRating,
  updateReply,
} from "@/api/reviewApi";
import { getBookById } from "@/api/bookApi";
import { ratingBreakdown } from "@/utils/reviews";
import type { Book, Review, ReviewReply } from "@/types";

type ReviewSort = "newest" | "highest" | "lowest";

const SORT_OPTIONS: { value: ReviewSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "highest", label: "Top rated" },
  { value: "lowest", label: "Lowest" },
];

const route = useRoute();

const reviewStore = useReviewStore();
const authStore = useAuthStore();
const authDialog = useAuthDialogStore();

const { reviews } = storeToRefs(reviewStore);
const { currentUser } = storeToRefs(authStore);

const { snackbar, notify, notifyError } = useSnackbar();

const bookId = computed(() => route.params.id as string);
const isAdmin = computed(() => currentUser.value?.admin === true);

const book = ref<Partial<Book>>({});
const loading = ref(true);
const locked = ref(false);
const averageRating = ref(0);
const totalReviews = ref(0);
const sort = ref<ReviewSort>("newest");
const starFilter = ref<number | null>(null);

const reviewFormDialog = ref(false);
const editedReview = ref<Review | null>(null);
const savingReview = ref(false);

const replyFormDialog = ref(false);
const editedReply = ref<ReviewReply | null>(null);
const replyParentId = ref<string | null>(null);
const savingReply = ref(false);

const deleteReviewDialog = ref(false);
const reviewToDelete = ref<Review | null>(null);
const deletingReview = ref(false);

const deleteReplyDialog = ref(false);
const replyToDelete = ref<{ reviewId: string; replyId?: string } | null>(null);
const deletingReply = ref(false);

const displayRating = computed(() =>
  totalReviews.value > 0 ? averageRating.value : book.value.rating || 0
);

const breakdown = computed(() => ratingBreakdown(reviews.value));

const visibleReviews = computed(() => {
  const filtered = starFilter.value
    ? reviews.value.filter((review) => review.rating === starFilter.value)
    : [...reviews.value];

  const time = (review: Review) => new Date(review.createdAt ?? 0).getTime();

  return filtered.sort((a, b) => {
    if (sort.value === "highest") return b.rating - a.rating || time(b) - time(a);
    if (sort.value === "lowest") return a.rating - b.rating || time(b) - time(a);
    return time(b) - time(a);
  });
});

onMounted(reloadAll);

watch(currentUser, (user) => {
  if (user && locked.value) reloadReviews();
});

async function reloadAll() {
  loading.value = true;
  try {
    await Promise.all([reloadReviews(), loadRatingData()]);
  } finally {
    loading.value = false;
  }
}

async function reloadReviews() {
  try {
    await reviewStore.loadReviews(bookId.value);
    locked.value = false;
  } catch (error: any) {
    if (error.response?.status === 401) {
      reviews.value = [];
      locked.value = true;
      return;
    }
    console.error("Error loading reviews:", error);
    notifyError("Failed to load reviews.");
  }
}

async function loadRatingData() {
  try {
    const [ratingResponse, bookResponse] = await Promise.all([
      getAverageRating(bookId.value),
      getBookById(bookId.value),
    ]);
    averageRating.value = ratingResponse.data.averageRating;
    totalReviews.value = ratingResponse.data.totalReviews;
    book.value = bookResponse.data;
  } catch (error) {
    console.error("Error loading rating data:", error);
    averageRating.value = 0;
    totalReviews.value = 0;
  }
}

function toggleStarFilter(stars: number) {
  starFilter.value = starFilter.value === stars ? null : stars;
}

function handleSignIn() {
  authDialog.openSignIn("Sign in to read reader reviews.");
}

/** `null` opens the form blank, for writing a new review. */
function openReviewForm(review: Review | null) {
  const signedIn = authDialog.ensureSignedIn("Sign in to write a review.", () =>
    openReviewForm(review)
  );
  if (!signedIn) return;

  editedReview.value = review;
  reviewFormDialog.value = true;
}

async function saveReview(rating: number, comment: string) {
  savingReview.value = true;
  try {
    if (editedReview.value) {
      await editReview(editedReview.value._id, rating, comment);
      notify("Review updated");
    } else {
      await reviewStore.addNewReview({ bookId: bookId.value, rating, comment });
      notify("Thanks for your review!");
    }
    reviewFormDialog.value = false;
    await Promise.all([reloadReviews(), loadRatingData()]);
  } catch (error) {
    console.error("Error saving review:", error);
    notifyError("Failed to save your review. Please try again.");
  } finally {
    savingReview.value = false;
  }
}

function askToDeleteReview(review: Review) {
  reviewToDelete.value = review;
  deleteReviewDialog.value = true;
}

async function deleteReview() {
  if (!reviewToDelete.value) return;

  deletingReview.value = true;
  try {
    await reviewStore.deleteReview(reviewToDelete.value._id);
    deleteReviewDialog.value = false;
    reviewToDelete.value = null;
    notify("Review deleted");
    await Promise.all([reloadReviews(), loadRatingData()]);
  } catch (error) {
    console.error("Error deleting review:", error);
    notifyError("Failed to delete review.");
  } finally {
    deletingReview.value = false;
  }
}

function openReplyForm(review: Review, reply: ReviewReply) {
  replyParentId.value = review._id;
  editedReply.value = reply;
  replyFormDialog.value = true;
}

async function saveReply(content: string) {
  if (!replyParentId.value || !editedReply.value?._id) return;

  savingReply.value = true;
  try {
    await updateReply(replyParentId.value, editedReply.value._id, content);
    replyFormDialog.value = false;
    notify("Reply updated");
    await reloadReviews();
  } catch (error) {
    console.error("Error updating reply:", error);
    notifyError("Failed to update reply. Please try again.");
  } finally {
    savingReply.value = false;
  }
}

function deleteReviewReply(review: Review, reply: ReviewReply) {
  replyToDelete.value = { reviewId: review._id, replyId: reply._id };
  deleteReplyDialog.value = true;
}

async function deleteReply() {
  if (!replyToDelete.value?.replyId) return;

  deletingReply.value = true;
  try {
    await deleteReplyApi(
      replyToDelete.value.reviewId,
      replyToDelete.value.replyId
    );
    deleteReplyDialog.value = false;
    replyToDelete.value = null;
    notify("Reply deleted");
    await reloadReviews();
  } catch (error) {
    console.error("Error deleting reply:", error);
    notifyError("Failed to delete reply. Please try again.");
  } finally {
    deletingReply.value = false;
  }
}
</script>
