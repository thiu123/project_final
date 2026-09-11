<template>
  <div class="px-2 sm:px-4">
    <div
      class="mx-auto my-8 w-full max-w-[1200px] overflow-hidden rounded-xl border border-border bg-card shadow"
    >
      <div
        class="flex items-center bg-gradient-to-br from-primary to-primary/80 px-8 py-5 text-lg font-bold tracking-wide text-primary-foreground"
      >
        <Star class="mr-3 h-7 w-7" />
        REVIEWS
      </div>

      <!-- Rating summary -->
      <div
        class="flex flex-col items-center gap-6 border-b border-border bg-card p-8 sm:flex-row"
      >
        <div class="flex flex-col items-center text-center">
          <div class="mb-2 font-bold text-primary">
            <span class="text-5xl font-bold">{{ displayRating }}</span>
            <span class="text-2xl text-muted-foreground">/5</span>
          </div>
          <UiRating :model-value="displayRating" :size="16" readonly class="mb-2" />
          <div class="text-xs text-muted-foreground">
            Based on {{ totalReviews }} reviews
          </div>
        </div>

        <div class="sm:ml-auto">
          <UiButton size="lg" class="rounded-lg shadow" @click="openReviewForm(null)">
            <Pencil class="h-4 w-4" />
            Write a Review
          </UiButton>
        </div>
      </div>

      <UiSeparator />

      <!-- Reviews -->
      <div v-if="loading" class="flex flex-col items-center justify-center p-8">
        <UiSpinner size="xl" class="text-primary" />
        <div class="mt-4 text-base text-muted-foreground">Loading reviews...</div>
      </div>

      <div v-else-if="reviews.length">
        <template v-for="(review, index) in reviews" :key="review._id">
          <ReviewsReviewCard
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
          <UiSeparator v-if="index < reviews.length - 1" />
        </template>
      </div>

      <div v-else class="flex flex-col items-center justify-center p-8 text-center">
        <MessageSquare class="mb-4 h-16 w-16 text-muted-foreground/50" />
        <div class="mb-2 text-lg font-semibold text-muted-foreground">
          No reviews yet
        </div>
        <div class="text-sm text-muted-foreground">
          Be the first to share your thoughts about this book!
        </div>
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
import { MessageSquare, Pencil, Star } from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth";
import { useReviewStore } from "@/stores/review";
import { useSnackbar } from "@/composables/useSnackbar";
import {
  deleteReply as deleteReplyApi,
  editReview,
  getAverageRating,
  updateReply,
} from "@/api/reviewApi";
import { getBookById } from "@/api/bookApi";
import type { Review, ReviewReply } from "@/types";

const route = useRoute();

const reviewStore = useReviewStore();
const authStore = useAuthStore();

const { reviews } = storeToRefs(reviewStore);
const { currentUser } = storeToRefs(authStore);

const { snackbar, notify, notifyError } = useSnackbar();

const bookId = computed(() => route.params.id as string);
const isAdmin = computed(() => currentUser.value?.admin === true);

const loading = ref(false);
const averageRating = ref(0);
const totalReviews = ref(0);
/** The book's own rating, shown before anyone has reviewed it. */
const bookRating = ref(0);

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
  totalReviews.value > 0 ? averageRating.value : bookRating.value
);

onMounted(reloadAll);

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
  } catch (error) {
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
    bookRating.value = bookResponse.data.rating || 0;
  } catch (error) {
    console.error("Error loading rating data:", error);
    averageRating.value = 0;
    totalReviews.value = 0;
    bookRating.value = 0;
  }
}

/** `null` opens the form blank, for writing a new review. */
function openReviewForm(review: Review | null) {
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
