<template>
  <div>
    <AdminPageHeader
      title="Reviews"
      description="Read what customers say about each book and reply on behalf of the store."
    >
      <template #actions>
        <UiButton variant="outline" :loading="loading" @click="fetchReviews">
          <RefreshCw v-if="!loading" class="h-4 w-4" />
          Refresh
        </UiButton>
      </template>
    </AdminPageHeader>

    <AdminStatStrip :items="reviewStats" :loading="loading && !reviews.length" />

    <AdminPanel :loading="loading && reviews.length > 0">
      <template #toolbar>
        <AdminSearchInput
          v-model="search"
          placeholder="Search comment, customer or book"
        />
        <div class="flex items-center gap-2 md:ml-auto">
          <UiSelect v-model="filterRating">
            <UiSelectTrigger class="w-full bg-background md:w-36" aria-label="Filter by rating">
              <UiSelectValue placeholder="All ratings" />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem
                v-for="opt in ratingFilters"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>
          <UiSelect v-model="filterReplied">
            <UiSelectTrigger class="w-full bg-background md:w-40" aria-label="Filter by reply status">
              <UiSelectValue placeholder="Any reply status" />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem
                v-for="opt in repliedFilters"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>
          <UiButton
            v-if="hasFilters"
            variant="ghost"
            size="sm"
            class="shrink-0 text-muted-foreground"
            @click="resetFilters"
          >
            Clear
          </UiButton>
        </div>
      </template>

      <ul v-if="loading && !reviews.length" class="divide-y divide-border">
        <li v-for="n in 4" :key="n" class="flex gap-4 px-5 py-5">
          <UiSkeleton class="size-10 shrink-0 rounded-full bg-muted" />
          <div class="flex-1 space-y-2">
            <UiSkeleton class="h-3.5 w-40 bg-muted" />
            <UiSkeleton class="h-3 w-24 bg-muted" />
            <UiSkeleton class="h-3.5 w-3/4 bg-muted" />
          </div>
        </li>
      </ul>

      <AdminEmptyState
        v-else-if="filteredReviews.length === 0"
        :icon="MessageSquareX"
        title="No reviews found"
        :description="
          reviews.length
            ? 'Nothing matches these filters.'
            : 'Reviews appear here once customers rate a book.'
        "
      >
        <UiButton v-if="hasFilters" variant="outline" size="sm" @click="resetFilters">
          Clear filters
        </UiButton>
      </AdminEmptyState>

      <ul v-else class="divide-y divide-border">
        <li
          v-for="review in paginatedReviews"
          :key="review._id"
          class="flex flex-col gap-4 px-5 py-5 sm:flex-row"
        >
          <UserAvatar
            :src="reviewUser(review)?.avatar_url"
            :name="reviewUser(review)?.username"
            class="size-10 shrink-0"
          />

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span class="font-medium text-foreground">
                {{ reviewUser(review)?.username || "Anonymous" }}
              </span>
              <span class="text-xs text-muted-foreground">
                {{ formatDate(review.createdAt) }}
              </span>
              <AdminPill v-if="!review.replies?.length" tone="warning">
                Awaiting reply
              </AdminPill>
            </div>

            <div class="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <UiRating :model-value="review.rating" :size="14" readonly />
              <span class="inline-flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                <BookOpen class="h-3.5 w-3.5 shrink-0" />
                <span class="truncate">
                  {{ reviewBook(review)?.title || "Unknown book" }}
                </span>
              </span>
            </div>

            <p class="mt-2.5 max-w-[75ch] text-sm leading-relaxed text-foreground">
              {{ review.comment }}
            </p>

            <div v-if="review.replies?.length" class="mt-3 space-y-2">
              <div
                v-for="reply in review.replies"
                :key="reply._id"
                class="group rounded-lg border border-border bg-muted/40 px-3.5 py-2.5"
              >
                <div class="flex items-center justify-between gap-2">
                  <div class="flex min-w-0 items-center gap-1.5 text-xs">
                    <ShieldCheck class="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span class="truncate font-medium text-foreground">
                      {{ replyAdmin(reply)?.username || "Store" }}
                    </span>
                    <span class="shrink-0 text-muted-foreground">
                      {{ formatDate(reply.createdAt) }}
                    </span>
                  </div>
                  <div class="flex shrink-0 items-center">
                    <UiButton
                      variant="ghost"
                      size="iconSm"
                      class="h-7 w-7 text-muted-foreground hover:text-foreground"
                      aria-label="Edit reply"
                      title="Edit reply"
                      @click="editReply(review, reply)"
                    >
                      <Pencil class="h-3.5 w-3.5" />
                    </UiButton>
                    <UiButton
                      variant="ghost"
                      size="iconSm"
                      class="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete reply"
                      title="Delete reply"
                      @click="confirmDeleteReply(review._id, reply._id)"
                    >
                      <Trash2 class="h-3.5 w-3.5" />
                    </UiButton>
                  </div>
                </div>
                <p class="mt-1 text-sm text-foreground/90">{{ reply.content }}</p>
              </div>
            </div>
          </div>

          <div class="flex shrink-0 items-start gap-1">
            <UiButton variant="outline" size="sm" @click="openReplyDialog(review)">
              <Reply class="h-4 w-4" />
              Reply
            </UiButton>
            <UiButton
              variant="ghost"
              size="iconSm"
              class="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label="Delete review"
              title="Delete review"
              @click="confirmDeleteReview(review._id)"
            >
              <Trash2 class="h-4 w-4" />
            </UiButton>
          </div>
        </li>
      </ul>

      <template #footer>
        <AdminTablePagination
          v-model:page="page"
          :total="filteredReviews.length"
          :items-per-page="itemsPerPage"
          noun="reviews"
        />
      </template>
    </AdminPanel>

    <UiDialog v-model:open="replyDialog">
      <UiDialogContent class="sm:max-w-lg">
        <UiDialogHeader>
          <UiDialogTitle>
            {{ editingReply ? "Edit reply" : "Reply to review" }}
          </UiDialogTitle>
          <UiDialogDescription>
            Replies are public and show under the review on the book page.
          </UiDialogDescription>
        </UiDialogHeader>

        <blockquote
          v-if="selectedReview"
          class="line-clamp-3 border-l-2 border-border pl-3 text-sm text-muted-foreground"
        >
          {{ selectedReview.comment }}
        </blockquote>

        <UiTextarea
          v-model="replyContent"
          label="Your reply"
          :rows="4"
          :error-message="replyError"
          :hint="`${replyContent.length} characters, at least 10`"
        />

        <UiDialogFooter>
          <UiButton variant="outline" @click="closeReplyDialog">Cancel</UiButton>
          <UiButton
            variant="ink"
            :loading="submitting"
            :disabled="!replyContent || replyContent.length < 10"
            @click="submitReply"
          >
            {{ editingReply ? "Save reply" : "Post reply" }}
          </UiButton>
        </UiDialogFooter>
      </UiDialogContent>
    </UiDialog>

    <AdminConfirmDeleteDialog
      v-model:open="deleteDialog"
      :question="`This ${deleteType} will be removed from the book page.`"
      :title="`Delete ${deleteType}?`"
      :loading="deleting"
      @confirm="performDelete"
    />

    <SnackbarAlert
      v-model="snackbar"
      :text="snackbarText"
      :color="snackbarColor"
      :timeout="3000"
    />
  </div>
</template>

<script setup lang="ts">
import type { AdminStat } from "@/types/admin";
import {
  getAllReviewsAdmin,
  createReply,
  updateReply,
  deleteReply,
  deleteReview,
} from "~/api/reviewApi";
import type { Book, Review, ReviewReply, User } from "@/types";
import {
  BookOpen,
  MessageSquareX,
  MessagesSquare,
  Pencil,
  RefreshCw,
  Reply,
  ShieldCheck,
  Star,
  Trash2,
} from "lucide-vue-next";

const loading = ref(false);
const reviews = ref<Review[]>([]);
const search = ref("");
const filterRating = ref("");
const filterReplied = ref("");
const page = ref(1);
const itemsPerPage = 10;

// Reply dialog
const replyDialog = ref(false);
const replyContent = ref("");
const selectedReview = ref<Review | null>(null);
const editingReply = ref<ReviewReply | null>(null);
const submitting = ref(false);

// Delete dialog
const deleteDialog = ref(false);
const deleteType = ref("");
const deleteReviewId = ref<string | null>(null);
const deleteReplyId = ref<string | null>(null);
const deleting = ref(false);

// Snackbar
const snackbar = ref(false);
const snackbarText = ref("");
const snackbarColor = ref("success");

// Filter options
const ratingFilters = [
  { label: "All ratings", value: "all" },
  { label: "5 stars", value: "5" },
  { label: "4 stars", value: "4" },
  { label: "3 stars", value: "3" },
  { label: "2 stars", value: "2" },
  { label: "1 star", value: "1" },
];
const repliedFilters = [
  { label: "Any reply status", value: "all" },
  { label: "Replied", value: "replied" },
  { label: "Awaiting reply", value: "not-replied" },
];

const reviewStats = computed<AdminStat[]>(() => [
  { label: "Total reviews", value: reviews.value.length, icon: MessagesSquare },
  { label: "Average rating", value: `${averageRating.value} / 5`, icon: Star },
  { label: "Awaiting reply", value: pendingReplies.value, icon: Reply },
]);

const hasFilters = computed(() =>
  Boolean(
    search.value ||
      (filterRating.value && filterRating.value !== "all") ||
      (filterReplied.value && filterReplied.value !== "all")
  )
);

const averageRating = computed(() => {
  if (reviews.value.length === 0) return "0.0";
  const sum = reviews.value.reduce((acc, r) => acc + r.rating, 0);
  return (sum / reviews.value.length).toFixed(1);
});

const pendingReplies = computed(
  () =>
    reviews.value.filter((r) => !r.replies || r.replies.length === 0).length
);

const filteredReviews = computed<Review[]>(() => {
  let filtered = reviews.value;

  // Search filter
  if (search.value) {
    const searchLower = search.value.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.comment?.toLowerCase().includes(searchLower) ||
        reviewUser(r)?.username?.toLowerCase().includes(searchLower) ||
        reviewBook(r)?.title?.toLowerCase().includes(searchLower)
    );
  }

  // Rating filter
  if (filterRating.value && filterRating.value !== "all") {
    filtered = filtered.filter((r) => r.rating === Number(filterRating.value));
  }

  // Replied filter
  if (filterReplied.value && filterReplied.value !== "all") {
    filtered = filtered.filter((r) => {
      const hasReplies = !!(r.replies && r.replies.length > 0);
      return filterReplied.value === "replied" ? hasReplies : !hasReplies;
    });
  }

  return filtered;
});

const paginatedReviews = computed<Review[]>(() => {
  const start = (page.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredReviews.value.slice(start, end);
});

watch([search, filterRating, filterReplied], () => {
  page.value = 1;
});

const replyError = computed(() => {
  if (!replyContent.value) return "";
  if (replyContent.value.length < 10) {
    return "Reply must be at least 10 characters";
  }
  return "";
});

function reviewUser(review: Review): User | null {
  return typeof review.userId === "object" && review.userId !== null
    ? review.userId
    : null;
}

function reviewBook(review: Review): Book | null {
  return typeof review.bookId === "object" && review.bookId !== null
    ? review.bookId
    : null;
}

function replyAdmin(reply: ReviewReply): User | null {
  return typeof reply.adminId === "object" && reply.adminId !== null
    ? reply.adminId
    : null;
}

async function fetchReviews() {
  loading.value = true;
  try {
    const response = await getAllReviewsAdmin();
    reviews.value = response.data;
  } catch (error: any) {
    console.error("Error fetching reviews:", error);
    showSnackbar("Failed to load reviews", "error");
  } finally {
    loading.value = false;
  }
}

function openReplyDialog(review: Review) {
  selectedReview.value = review;
  replyContent.value = "";
  editingReply.value = null;
  replyDialog.value = true;
}

function editReply(review: Review, reply: ReviewReply) {
  selectedReview.value = review;
  replyContent.value = reply.content;
  editingReply.value = reply;
  replyDialog.value = true;
}

function closeReplyDialog() {
  replyDialog.value = false;
  replyContent.value = "";
  selectedReview.value = null;
  editingReply.value = null;
}

async function submitReply() {
  if (!replyContent.value || replyContent.value.length < 10) return;

  submitting.value = true;
  try {
    if (editingReply.value) {
      // Update existing reply
      await updateReply(
        selectedReview.value!._id,
        editingReply.value._id as string,
        replyContent.value
      );
      showSnackbar("Reply updated successfully", "success");
    } else {
      // Create new reply
      await createReply(selectedReview.value!._id, replyContent.value);
      showSnackbar("Reply added successfully", "success");
    }

    await fetchReviews();
    closeReplyDialog();
  } catch (error: any) {
    console.error("Error submitting reply:", error);
    showSnackbar("Failed to submit reply", "error");
  } finally {
    submitting.value = false;
  }
}

function confirmDeleteReview(reviewId: string) {
  deleteType.value = "review";
  deleteReviewId.value = reviewId;
  deleteReplyId.value = null;
  deleteDialog.value = true;
}

function confirmDeleteReply(reviewId: string, replyId?: string) {
  deleteType.value = "reply";
  deleteReviewId.value = reviewId;
  deleteReplyId.value = replyId ?? null;
  deleteDialog.value = true;
}

async function performDelete() {
  deleting.value = true;
  try {
    if (deleteType.value === "review") {
      await deleteReview(deleteReviewId.value as string);
      showSnackbar("Review deleted successfully", "success");
    } else {
      await deleteReply(
        deleteReviewId.value as string,
        deleteReplyId.value as string
      );
      showSnackbar("Reply deleted successfully", "success");
    }

    await fetchReviews();
    deleteDialog.value = false;
  } catch (error: any) {
    console.error("Error deleting:", error);
    showSnackbar(`Failed to delete ${deleteType.value}`, "error");
  } finally {
    deleting.value = false;
  }
}

function resetFilters() {
  search.value = "";
  filterRating.value = "";
  filterReplied.value = "";
  page.value = 1;
}

function formatDate(date?: string): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function showSnackbar(text: string, color = "success") {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
}

onMounted(() => {
  fetchReviews();
});
</script>
