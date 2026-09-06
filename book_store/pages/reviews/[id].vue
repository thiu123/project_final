<template>
  <div class="px-2 sm:px-4">
    <!-- Header Section -->
    <div
      class="mx-auto my-8 w-full max-w-[1200px] overflow-hidden rounded-xl border border-border bg-card shadow"
    >
      <div
        class="flex items-center bg-gradient-to-br from-primary to-primary/80 px-8 py-5 text-lg font-bold tracking-wide text-primary-foreground"
      >
        <Star class="mr-3 h-7 w-7" />
        REVIEWS
      </div>

      <!-- Rating Summary -->
      <div
        class="flex flex-col items-center gap-6 border-b border-border bg-card p-8 sm:flex-row"
      >
        <div class="flex flex-col items-center text-center">
          <div class="mb-2 font-bold text-primary">
            <span class="text-5xl font-bold">{{ displayRating }}</span>
            <span class="text-2xl text-muted-foreground">/5</span>
          </div>
          <UiRating
            :model-value="displayRating"
            :size="16"
            readonly
            class="mb-2"
          />
          <div class="text-xs text-muted-foreground">
            Based on {{ totalReviews }} reviews
          </div>
        </div>

        <div class="mx-8">
          <div
            v-for="star in [5, 4, 3, 2, 1]"
            :key="star"
            class="mb-2 flex items-center"
          >
            <span class="mr-2 text-sm font-medium">{{ star }}</span>
            <Star class="h-4 w-4 fill-amber-400 text-amber-400" />
          </div>
        </div>

        <div class="sm:ml-auto">
          <UiButton
            size="lg"
            class="rounded-lg shadow"
            @click="showCreateReviewsDialog = true"
          >
            <Pencil class="h-4 w-4" />
            Write a Review
          </UiButton>
        </div>
      </div>

      <!-- Create Review Dialog -->
      <UiDialog v-model:open="showCreateReviewsDialog">
        <UiDialogContent
          hide-close
          class="gap-0 overflow-hidden p-0 sm:max-w-xl"
          @pointer-down-outside.prevent
          @escape-key-down.prevent
        >
          <UiDialogTitle class="sr-only">Write a Book Review</UiDialogTitle>

          <div
            class="flex items-center justify-center bg-primary p-6 pb-4 text-lg font-semibold text-primary-foreground"
          >
            <Pencil class="mr-2 h-5 w-5" />
            WRITE A BOOK REVIEW
          </div>

          <div class="p-6">
            <!-- Rating -->
            <div class="mb-6 text-center">
              <div class="mb-3 text-base text-muted-foreground">
                Rate this book:
              </div>
              <UiRating v-model="rating" :length="5" :size="40" class="mb-2" />
              <div class="text-xs text-muted-foreground">
                {{
                  rating > 0
                    ? `${rating} star${rating > 1 ? "s" : ""}`
                    : "Select rating"
                }}
              </div>
            </div>

            <!-- Comment box -->
            <UiTextarea
              v-model="comment"
              label="Share your thoughts about this book..."
              :rows="4"
              wrapper-class="mb-4"
              :error-message="commentError"
              @blur="validateComment"
            />
          </div>

          <!-- Buttons -->
          <div class="flex items-center justify-end p-6 pt-0">
            <UiButton
              variant="ghost"
              class="mr-3"
              @click="showCreateReviewsDialog = false"
            >
              Cancel
            </UiButton>
            <UiButton
              :disabled="!rating || !comment.trim()"
              :loading="loading"
              @click="handleWriteReview(bookId, rating, comment)"
            >
              <Send class="h-4 w-4" />
              Submit Review
            </UiButton>
          </div>
        </UiDialogContent>
      </UiDialog>

      <!-- Delete Confirmation Dialog -->
      <UiDialog v-model:open="showDeleteDialog">
        <UiDialogContent
          hide-close
          class="gap-0 overflow-hidden p-0 sm:max-w-md"
          @pointer-down-outside.prevent
          @escape-key-down.prevent
        >
          <UiDialogTitle class="sr-only">Delete Review</UiDialogTitle>

          <div
            class="flex items-center justify-center bg-destructive p-6 pb-4 text-lg font-semibold text-destructive-foreground"
          >
            <Trash2 class="mr-2 h-5 w-5" />
            Delete Review
          </div>
          <div class="p-6 text-center">
            <AlertCircle class="mx-auto mb-4 h-8 w-8 text-destructive" />
            <div class="mb-2 text-base">
              Are you sure you want to delete this review?
            </div>
            <div class="text-xs text-muted-foreground">
              This action cannot be undone.
            </div>
          </div>
          <div class="flex items-center justify-end p-6 pt-0">
            <UiButton
              variant="ghost"
              class="mr-3"
              @click="showDeleteDialog = false"
            >
              Cancel
            </UiButton>
            <UiButton
              variant="destructive"
              :loading="deleteLoading"
              @click="confirmDeleteReview"
            >
              <Trash2 class="h-4 w-4" />
              Delete
            </UiButton>
          </div>
        </UiDialogContent>
      </UiDialog>

      <!-- Edit Review Dialog -->
      <UiDialog v-model:open="showEditDialog">
        <UiDialogContent
          hide-close
          class="gap-0 overflow-hidden p-0 sm:max-w-lg"
          @pointer-down-outside.prevent
          @escape-key-down.prevent
        >
          <UiDialogTitle class="sr-only">Edit Review</UiDialogTitle>

          <div
            class="bg-primary px-6 py-4 text-lg font-semibold text-primary-foreground"
          >
            Edit Review
          </div>
          <div class="px-6 pt-4">
            <UiRating v-model="editRating" :length="5" :size="32" />
            <UiTextarea
              v-model="editComment"
              label="Your review"
              :rows="4"
              wrapper-class="mt-4"
            />
          </div>
          <div class="flex items-center justify-end gap-2 p-6">
            <UiButton variant="ghost" @click="showEditDialog = false"
              >Cancel</UiButton
            >
            <UiButton :loading="editLoading" @click="confirmEditReview">
              Save
            </UiButton>
          </div>
        </UiDialogContent>
      </UiDialog>

      <!-- Edit Reply Dialog -->
      <UiDialog v-model:open="editReplyDialog">
        <UiDialogContent
          hide-close
          class="gap-0 overflow-hidden p-0 sm:max-w-xl"
          @pointer-down-outside.prevent
          @escape-key-down.prevent
        >
          <UiDialogTitle class="sr-only">Edit Admin Reply</UiDialogTitle>

          <div
            class="flex items-center justify-center bg-primary p-6 pb-4 text-lg font-semibold text-primary-foreground"
          >
            <Pencil class="mr-2 h-5 w-5" />
            EDIT ADMIN REPLY
          </div>

          <div class="p-6">
            <UiTextarea
              v-model="editReplyContent"
              label="Reply content"
              :rows="4"
              :error-message="editReplyError"
              @blur="validateEditReply"
            />
          </div>

          <div class="flex items-center justify-end p-6 pt-0">
            <UiButton
              variant="ghost"
              class="mr-3"
              @click="editReplyDialog = false"
            >
              Cancel
            </UiButton>
            <UiButton
              :disabled="!editReplyContent || editReplyContent.trim() === ''"
              @click="confirmEditReply"
            >
              <Check class="h-4 w-4" />
              Update Reply
            </UiButton>
          </div>
        </UiDialogContent>
      </UiDialog>

      <UiSeparator />

      <!-- Reviews List -->
      <div>
        <template v-if="isLoaded">
          <div
            v-if="loading"
            class="flex flex-col items-center justify-center p-8 text-center"
          >
            <UiSpinner size="xl" class="text-primary" />
            <div class="mt-4 text-base text-muted-foreground">
              Loading reviews...
            </div>
          </div>

          <div v-else-if="reviews && reviews.length > 0">
            <div
              v-for="(review, index) in reviews"
              :key="index"
              class="bg-card transition-colors hover:bg-muted/40"
            >
              <div class="p-6">
                <!-- Reviewer Info -->
                <div class="mb-4 flex items-start justify-between gap-2">
                  <div class="flex grow items-center">
                    <UiAvatar
                      class="mr-3 size-10 bg-primary text-primary-foreground"
                    >
                      <UiAvatarImage
                        :src="reviewAvatar(review) || ''"
                        alt="User avatar"
                      />
                      <UiAvatarFallback
                        class="flex h-full w-full items-center justify-center"
                      >
                        <User class="h-5 w-5" />
                      </UiAvatarFallback>
                    </UiAvatar>

                    <div class="grow">
                      <div class="mb-1 flex items-center">
                        <h3 class="mr-3 text-lg font-bold text-primary">
                          {{ reviewUsername(review) }}
                        </h3>
                      </div>
                      <div class="flex items-center">
                        <UiRating
                          :model-value="review.rating"
                          :size="16"
                          readonly
                          class="mr-2"
                        />
                        <span class="text-xs text-muted-foreground">
                          {{ formatDate(review.createdAt) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Edit/Delete buttons - only show for current user's reviews -->
                  <div v-if="isCurrentUserReview(review)" class="flex shrink-0">
                    <UiTooltipProvider :delay-duration="200">
                      <UiTooltip>
                        <UiTooltipTrigger as-child>
                          <UiButton
                            variant="ghost"
                            size="iconSm"
                            class="mr-1 text-primary"
                            aria-label="Edit review"
                            @click="openEditDialog(review)"
                          >
                            <Pencil class="h-4 w-4" />
                          </UiButton>
                        </UiTooltipTrigger>
                        <UiTooltipContent side="top">
                          Edit review
                        </UiTooltipContent>
                      </UiTooltip>
                      <UiTooltip>
                        <UiTooltipTrigger as-child>
                          <UiButton
                            variant="ghost"
                            size="iconSm"
                            class="text-destructive opacity-60 transition-all hover:scale-110 hover:opacity-100"
                            aria-label="Delete my review"
                            @click="showDeleteConfirmation(review._id)"
                          >
                            <Trash2 class="h-4 w-4" />
                          </UiButton>
                        </UiTooltipTrigger>
                        <UiTooltipContent side="top">
                          Delete my review
                        </UiTooltipContent>
                      </UiTooltip>
                    </UiTooltipProvider>
                  </div>
                </div>

                <!-- Review Content -->
                <p class="text-base leading-relaxed text-foreground">
                  {{ review.comment }}
                </p>

                <!-- Admin Replies Section -->
                <div
                  v-if="review.replies && review.replies.length > 0"
                  class="ml-8 mt-4"
                >
                  <div
                    v-for="(reply, replyIndex) in review.replies"
                    :key="replyIndex"
                    class="mb-3 rounded-lg border-l-[3px] border-l-primary bg-primary/5 p-4"
                  >
                    <div class="mb-2 flex items-center">
                      <UiAvatar
                        class="mr-2 size-8 bg-primary text-primary-foreground"
                      >
                        <UiAvatarFallback
                          class="flex h-full w-full items-center justify-center"
                        >
                          <ShieldCheck class="h-4 w-4" />
                        </UiAvatarFallback>
                      </UiAvatar>
                      <div class="grow">
                        <span class="text-sm font-bold text-primary">
                          {{ replyAdminName(reply) }}
                        </span>
                        <UiBadge class="ml-2 px-1.5 text-[10px]">
                          Admin
                        </UiBadge>
                        <span class="ml-2 text-xs text-muted-foreground">
                          · {{ formatDate(reply.createdAt) }}
                        </span>
                      </div>
                      <!-- Edit/Delete buttons for admin's own reply -->
                      <div v-if="isAdmin && isCurrentUserReply(reply)">
                        <UiButton
                          variant="ghost"
                          size="iconSm"
                          class="text-primary"
                          aria-label="Edit reply"
                          @click="showEditReplyDialog(review._id, reply)"
                        >
                          <Pencil class="h-4 w-4" />
                        </UiButton>
                        <UiButton
                          variant="ghost"
                          size="iconSm"
                          class="text-destructive"
                          aria-label="Delete reply"
                          @click="confirmDeleteReply(review._id, reply._id)"
                        >
                          <Trash2 class="h-4 w-4" />
                        </UiButton>
                      </div>
                    </div>
                    <p class="mb-0 ml-10 text-sm">
                      {{ reply.content }}
                    </p>
                  </div>
                </div>

                <!-- Admin Reply Form (only visible to admin) -->
                <div v-if="isAdmin" class="ml-8 mt-3">
                  <UiTextarea
                    v-model="replyTexts[review._id]"
                    label="Write admin reply..."
                    :rows="2"
                    wrapper-class="mb-2"
                  />
                  <UiButton
                    size="sm"
                    :disabled="
                      !replyTexts[review._id] ||
                      replyTexts[review._id].trim() === ''
                    "
                    :loading="replyLoading[review._id]"
                    @click="submitReply(review._id)"
                  >
                    <Send class="h-3.5 w-3.5" />
                    Post Reply
                  </UiButton>
                </div>
              </div>

              <UiSeparator v-if="index < reviews.length - 1" />
            </div>
          </div>

          <div
            v-else
            class="flex flex-col items-center justify-center p-8 text-center"
          >
            <MessageSquare class="mb-4 h-16 w-16 text-muted-foreground/50" />
            <div class="mb-2 text-lg font-semibold text-muted-foreground">
              No reviews yet
            </div>
            <div class="text-sm text-muted-foreground">
              Be the first to share your thoughts about this book!
            </div>
          </div>
        </template>

        <template v-else>
          <div class="flex flex-col items-center justify-center p-8 text-center">
            <UiSpinner size="xl" class="text-primary" />
            <div class="mt-4 text-base text-muted-foreground">Loading...</div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { useReviewStore } from "@/stores/review";
import {
  AlertCircle,
  Check,
  MessageSquare,
  Pencil,
  Send,
  ShieldCheck,
  Star,
  Trash2,
  User,
} from "lucide-vue-next";
import {
  createReply,
  updateReply,
  deleteReply,
  editReview,
  getAverageRating,
} from "@/api/reviewApi";
import { getBookById } from "@/api/bookApi";
import type { Review, ReviewReply, User as UserType } from "@/types";

const route = useRoute();

const reviewStore = useReviewStore();
const authStore = useAuthStore();

const { reviews } = storeToRefs(reviewStore);
const { currentUser } = storeToRefs(authStore);

const bookId = computed(() => route.params.id as string);

const rating = ref(0);
const comment = ref("");
const commentError = ref("");
const showCreateReviewsDialog = ref(false);
const showDeleteDialog = ref(false);
const deleteLoading = ref(false);
const reviewToDelete = ref<string | null>(null);
const averageRating = ref(0);
const totalReviews = ref(0);
const bookRating = ref(0); // Rating từ database
const loading = ref(false);
const isLoaded = ref(false);
// Reply management
const replyTexts = reactive<Record<string, string>>({});
const replyLoading = reactive<Record<string, boolean>>({});
const editReplyDialog = ref(false);
const editingReply = ref<ReviewReply | null>(null);
const editingReviewId = ref<string | null>(null);
const editReplyContent = ref("");
const editReplyError = ref("");
// Edit review
const showEditDialog = ref(false);
const editLoading = ref(false);
const editReviewId = ref<string | null>(null);
const editRating = ref(0);
const editComment = ref("");

const isAdmin = computed(() => currentUser.value?.admin === true);

// Hiển thị rating: nếu có review thì dùng average, không thì dùng rating mặc định từ database
const displayRating = computed(() => {
  if (totalReviews.value > 0) {
    return averageRating.value;
  }
  return bookRating.value;
});

watch(reviews, (newVal) => {
  if (newVal && newVal.length > 0) {
    console.log("Reviews updated:", newVal);
  }
});

onMounted(async () => {
  isLoaded.value = false;
  loading.value = true;
  try {
    await reviewStore.loadReviews(bookId.value);
    await loadRatingData(bookId.value);
  } catch (error) {
    console.error("Error loading reviews:", error);
  } finally {
    loading.value = false;
    isLoaded.value = true;
  }
});

async function loadRatingData(id: string) {
  try {
    // Lấy average rating từ reviews
    const ratingResponse = await getAverageRating(id);
    averageRating.value = ratingResponse.data.averageRating;
    totalReviews.value = ratingResponse.data.totalReviews;

    // Lấy thông tin book để có rating mặc định
    const bookResponse = await getBookById(id);
    bookRating.value = bookResponse.data.rating || 0;
  } catch (error) {
    console.error("Error loading rating data:", error);
    averageRating.value = 0;
    totalReviews.value = 0;
    bookRating.value = 0;
  }
}

// Format date for display
function formatDate(dateString?: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Validation (was a Vuetify rules array on the textarea)
function validateComment() {
  commentError.value = comment.value ? "" : "Review comment is required";
}

function validateEditReply() {
  editReplyError.value = editReplyContent.value
    ? ""
    : "Reply content is required";
}

// Display helpers (userId/adminId can be populated objects or plain ids)
function reviewUsername(review: Review): string {
  return (review.userId as UserType | null)?.username || "Anonymous";
}

function reviewAvatar(review: Review): string | null {
  return (review.userId as UserType | null)?.avatar_url || null;
}

function replyAdminName(reply: ReviewReply): string {
  return (reply.adminId as UserType | null)?.username || "Admin";
}

// Check if the review belongs to the current user
function isCurrentUserReview(review: Review) {
  const userId = review.userId as any;
  return (
    !!currentUser.value &&
    !!userId &&
    (userId._id === currentUser.value._id || userId === currentUser.value._id)
  );
}

// Check if reply belongs to current admin
function isCurrentUserReply(reply: ReviewReply) {
  const adminId = reply.adminId as any;
  return (
    !!currentUser.value &&
    !!adminId &&
    (adminId._id === currentUser.value._id || adminId === currentUser.value._id)
  );
}

// Submit admin reply
async function submitReply(reviewId: string) {
  const content = replyTexts[reviewId];
  if (!content || content.trim() === "") return;

  replyLoading[reviewId] = true;
  try {
    await createReply(reviewId, content);
    replyTexts[reviewId] = "";
    await reviewStore.loadReviews(bookId.value);
    console.log("Reply added successfully");
  } catch (error) {
    console.error("Error adding reply:", error);
    alert("Failed to add reply. Please try again.");
  } finally {
    replyLoading[reviewId] = false;
  }
}

// Show edit reply dialog
function showEditReplyDialog(reviewId: string, reply: ReviewReply) {
  editingReviewId.value = reviewId;
  editingReply.value = reply;
  editReplyContent.value = reply.content;
  editReplyError.value = "";
  editReplyDialog.value = true;
}

// Update reply
async function confirmEditReply() {
  if (!editReplyContent.value || editReplyContent.value.trim() === "") return;

  try {
    await updateReply(
      editingReviewId.value as string,
      editingReply.value?._id as string,
      editReplyContent.value
    );
    editReplyDialog.value = false;
    editingReply.value = null;
    editingReviewId.value = null;
    editReplyContent.value = "";
    await reviewStore.loadReviews(bookId.value);
    console.log("Reply updated successfully");
  } catch (error) {
    console.error("Error updating reply:", error);
    alert("Failed to update reply. Please try again.");
  }
}

// Delete reply
async function confirmDeleteReply(reviewId: string, replyId?: string) {
  if (!confirm("Are you sure you want to delete this reply?")) return;

  try {
    await deleteReply(reviewId, replyId as string);
    await reviewStore.loadReviews(bookId.value);
    console.log("Reply deleted successfully");
  } catch (error) {
    console.error("Error deleting reply:", error);
    alert("Failed to delete reply. Please try again.");
  }
}

// Open edit dialog
function openEditDialog(review: Review) {
  editReviewId.value = review._id;
  editRating.value = review.rating;
  editComment.value = review.comment;
  showEditDialog.value = true;
}

// Confirm edit review
async function confirmEditReview() {
  if (!editRating.value || !editComment.value.trim()) {
    alert("Please provide rating and comment");
    return;
  }

  editLoading.value = true;
  try {
    await editReview(
      editReviewId.value as string,
      editRating.value,
      editComment.value
    );

    showEditDialog.value = false;
    editReviewId.value = null;
    editRating.value = 0;
    editComment.value = "";

    await reviewStore.loadReviews(bookId.value);
    await loadRatingData(bookId.value);
    console.log("Review updated successfully");
  } catch (error) {
    console.error("Error updating review:", error);
    alert("Failed to update review");
  } finally {
    editLoading.value = false;
  }
}

// Show delete confirmation dialog
function showDeleteConfirmation(reviewId: string) {
  reviewToDelete.value = reviewId;
  showDeleteDialog.value = true;
}

// Confirm and delete the review
async function confirmDeleteReview() {
  if (!reviewToDelete.value) return;

  deleteLoading.value = true;
  try {
    await reviewStore.deleteReview(reviewToDelete.value);
    showDeleteDialog.value = false;
    reviewToDelete.value = null;
    await reviewStore.loadReviews(bookId.value);
    await loadRatingData(bookId.value);
  } catch (error) {
    console.error("Error deleting review:", error);
  } finally {
    deleteLoading.value = false;
  }
}

async function handleWriteReview(
  reviewBookId: string,
  reviewRating: number,
  reviewComment: string
) {
  loading.value = true;
  try {
    await reviewStore.addNewReview({
      bookId: reviewBookId,
      rating: reviewRating,
      comment: reviewComment,
    });
    console.log("Review written successfully", {
      bookId: reviewBookId,
      rating: reviewRating,
      comment: reviewComment,
    });
    showCreateReviewsDialog.value = false;
    rating.value = 0;
    comment.value = "";
    commentError.value = "";
    // Reload reviews and rating data
    await reviewStore.loadReviews(reviewBookId);
    await loadRatingData(reviewBookId);
    console.log("Reviews and rating reloaded after writing a new review");
  } catch (error) {
    console.error("Error writing review:", error);
  } finally {
    loading.value = false;
  }
}
</script>
