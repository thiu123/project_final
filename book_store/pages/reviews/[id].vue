<template>
  <div class="min-h-screen bg-background">
    <div class="container mx-auto max-w-7xl px-4 py-8 md:py-12">
      <nav aria-label="Breadcrumb" class="mb-8 md:mb-10">
        <ol class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
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
          <li class="font-medium text-foreground" aria-current="page">Reviews</li>
        </ol>
      </nav>

      <div class="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
        <aside class="hero-rise space-y-5 lg:sticky lg:top-28 lg:col-span-4">
          <NuxtLink
            :to="`/details/${bookId}`"
            class="group flex items-center gap-5 overflow-hidden rounded-3xl bg-muted/70 p-5 ring-1 ring-border"
          >
            <div class="relative w-20 shrink-0">
              <div
                aria-hidden="true"
                class="absolute -right-3 -top-3 size-12 rounded-full bg-accent transition-transform duration-500 group-hover:scale-125 dark:bg-accent/80"
              ></div>
              <div
                class="relative aspect-[2/3] -rotate-6 overflow-hidden rounded-md bg-card shadow-[0_16px_32px_-14px_hsl(var(--foreground)/0.5)] ring-1 ring-black/5 transition-transform duration-500 ease-out group-hover:rotate-0 dark:ring-white/10"
              >
                <img
                  v-if="book.cover_url"
                  :src="book.cover_url"
                  :alt="`Cover of ${book.title}`"
                  class="h-full w-full object-cover"
                />
                <UiSkeleton v-else class="h-full w-full rounded-none" />
              </div>
            </div>
            <div class="min-w-0">
              <p class="line-clamp-2 font-semibold leading-snug">
                {{ book.title || "Loading..." }}
              </p>
              <p v-if="book.authors?.[0]" class="mt-1 truncate text-sm text-muted-foreground">
                by {{ book.authors[0] }}
              </p>
              <span class="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                <ArrowLeft class="size-3.5 transition-transform group-hover:-translate-x-0.5" />
                Back to book
              </span>
            </div>
          </NuxtLink>

          <div class="rounded-3xl border border-border bg-card p-6">
            <div class="flex items-end gap-2">
              <span class="text-6xl font-bold leading-none tracking-tight tabular-nums">
                {{ displayRating.toFixed(1) }}
              </span>
              <span class="pb-1.5 text-lg font-semibold text-muted-foreground">/5</span>
            </div>
            <UiRating :model-value="displayRating" :size="20" readonly class="mt-3" />
            <p class="mt-2 text-sm text-muted-foreground">
              From {{ totalReviews }} {{ totalReviews === 1 ? "review" : "reviews" }}
            </p>

            <ul v-if="reviews.length" class="mt-6 space-y-1" aria-label="Filter by rating">
              <li v-for="row in breakdown" :key="row.stars">
                <button
                  type="button"
                  class="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-xs tabular-nums transition-colors disabled:pointer-events-none disabled:opacity-40"
                  :class="starFilter === row.stars ? 'bg-accent/50' : 'hover:bg-muted'"
                  :aria-pressed="starFilter === row.stars"
                  :disabled="row.count === 0"
                  @click="toggleStarFilter(row.stars)"
                >
                  <span class="flex w-7 items-center gap-0.5 font-semibold">
                    {{ row.stars }}
                    <Star class="size-3 fill-amber-400 text-amber-400" />
                  </span>
                  <span class="h-2 grow overflow-hidden rounded-full bg-muted">
                    <span
                      class="block h-full rounded-full bg-amber-400 transition-[width] duration-700 ease-out"
                      :style="{ width: `${row.percentage}%` }"
                    ></span>
                  </span>
                  <span class="w-6 text-right text-muted-foreground">{{ row.count }}</span>
                </button>
              </li>
            </ul>

            <UiButton
              variant="ink"
              block
              class="mt-6 h-12 rounded-full text-base font-semibold shadow-none"
              @click="openReviewForm(null)"
            >
              <Pencil />
              Write a review
            </UiButton>
          </div>
        </aside>

        <section class="lg:col-span-8" aria-labelledby="reviews-heading">
          <div
            class="hero-rise flex flex-wrap items-end justify-between gap-4"
            style="--rise-delay: 80ms"
          >
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Reader reviews
              </p>
              <h1
                id="reviews-heading"
                class="mt-2 text-3xl font-bold tracking-tight md:text-4xl"
              >
                What readers think
              </h1>
            </div>

            <div
              v-if="reviews.length > 1"
              role="group"
              aria-label="Sort reviews"
              class="inline-flex rounded-full bg-muted p-1"
            >
              <button
                v-for="option in SORT_OPTIONS"
                :key="option.value"
                type="button"
                class="rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all"
                :class="
                  sort === option.value
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                "
                :aria-pressed="sort === option.value"
                @click="sort = option.value"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <div v-if="starFilter" class="mt-5 flex flex-wrap items-center gap-2 text-sm">
            <span class="text-muted-foreground">Showing</span>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground transition-transform active:scale-95"
              @click="starFilter = null"
            >
              {{ starFilter }}-star reviews
              <X class="size-3.5" />
              <span class="sr-only">Clear filter</span>
            </button>
          </div>

          <div class="mt-6">
            <div v-if="loading" class="grid gap-4" aria-busy="true">
              <div
                v-for="n in 3"
                :key="n"
                class="rounded-2xl p-6 ring-1 ring-border"
              >
                <div class="flex items-center gap-3">
                  <UiSkeleton class="size-11 rounded-full" />
                  <div class="space-y-2">
                    <UiSkeleton class="h-4 w-32" />
                    <UiSkeleton class="h-3 w-24" />
                  </div>
                </div>
                <UiSkeleton class="mt-5 h-4 w-full" />
                <UiSkeleton class="mt-2 h-4 w-4/5" />
              </div>
            </div>

            <div
              v-else-if="locked"
              class="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border p-8 text-center"
            >
              <div class="relative mb-6">
                <div
                  class="flex size-16 -rotate-6 items-center justify-center rounded-2xl bg-accent text-accent-foreground"
                >
                  <LockKeyhole class="size-7" />
                </div>
                <Star class="absolute -right-3 -top-2 size-6 rotate-12 fill-amber-400 text-amber-400" />
              </div>
              <p class="text-lg font-semibold">Sign in to read reviews</p>
              <p class="mt-1 max-w-[38ch] text-sm text-muted-foreground">
                Reviews are shared with signed-in readers only.
              </p>
              <UiButton
                variant="ink"
                class="mt-6 h-11 rounded-full px-6 font-semibold shadow-none"
                @click="handleSignIn"
              >
                Sign in
              </UiButton>
            </div>

            <div v-else-if="visibleReviews.length" class="grid gap-4">
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

            <div
              v-else
              class="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border p-8 text-center"
            >
              <div class="relative mb-6">
                <div
                  class="flex size-16 -rotate-6 items-center justify-center rounded-2xl bg-accent text-accent-foreground"
                >
                  <MessageCircle class="size-7" />
                </div>
                <Star class="absolute -right-3 -top-2 size-6 rotate-12 fill-amber-400 text-amber-400" />
              </div>
              <p class="text-lg font-semibold">No reviews yet</p>
              <p class="mt-1 max-w-[38ch] text-sm text-muted-foreground">
                Read it already? Be the first to tell other readers what you thought.
              </p>
              <UiButton
                variant="outline"
                class="mt-6 h-11 rounded-full px-6 font-semibold"
                @click="openReviewForm(null)"
              >
                <Pencil />
                Write the first review
              </UiButton>
            </div>
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
import {
  ArrowLeft,
  LockKeyhole,
  MessageCircle,
  Pencil,
  Star,
  X,
} from "lucide-vue-next";
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
