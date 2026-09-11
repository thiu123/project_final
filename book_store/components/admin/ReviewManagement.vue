<template>
  <div>
    <!-- Header with Stats -->
    <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
      <UiCard
        v-for="stat in reviewStats"
        :key="stat.title"
        class="rounded-2xl transition duration-200 hover:-translate-y-1 hover:shadow-md"
      >
        <div class="flex items-center justify-between p-4">
          <div>
            <p class="mb-1 text-xs text-muted-foreground">{{ stat.title }}</p>
            <h3 class="text-3xl font-bold tabular-nums text-foreground">
              {{ stat.value }}
            </h3>
          </div>
          <span
            class="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg"
            :class="stat.avatarClass"
          >
            <component :is="stat.icon" class="h-[30px] w-[30px]" :class="stat.iconClass" />
          </span>
        </div>
      </UiCard>
    </div>

    <!-- Filters -->
    <UiCard class="mb-6 rounded-2xl">
      <div class="p-4">
        <div class="grid grid-cols-12 items-center gap-4">
          <div class="col-span-12 md:col-span-4">
            <UiInput v-model="search" placeholder="Search reviews...">
              <template #prepend>
                <Search class="h-4 w-4" />
              </template>
              <template #append>
                <button
                  v-if="search"
                  type="button"
                  class="pointer-events-auto rounded-full p-0.5 hover:text-foreground"
                  aria-label="Clear search"
                  @click="search = ''"
                >
                  <X class="h-4 w-4" />
                </button>
              </template>
            </UiInput>
          </div>
          <div class="col-span-12 md:col-span-3">
            <UiSelect v-model="filterRating">
              <UiSelectTrigger class="w-full">
                <UiSelectValue placeholder="Filter by Rating" />
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
          </div>
          <div class="col-span-12 md:col-span-3">
            <UiSelect v-model="filterReplied">
              <UiSelectTrigger class="w-full">
                <UiSelectValue placeholder="Reply Status" />
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
          </div>
          <div class="col-span-12 md:col-span-2">
            <UiButton
              variant="ghost"
              block
              class="bg-waterblue/15 text-waterblue hover:bg-waterblue/25 hover:text-waterblue"
              @click="resetFilters"
            >
              <RefreshCw class="h-4 w-4" />
              Reset
            </UiButton>
          </div>
        </div>
      </div>
    </UiCard>

    <!-- Reviews List -->
    <UiCard class="rounded-2xl">
      <div class="flex items-center justify-between p-4">
        <span class="text-lg font-bold text-foreground">All Reviews</span>
        <span
          class="inline-flex items-center rounded-full bg-customyellow px-2.5 py-0.5 text-xs font-semibold text-customblack"
        >
          {{ filteredReviews.length }} reviews
        </span>
      </div>

      <UiSeparator />

      <div v-if="loading" class="py-8 text-center">
        <UiSpinner class="mx-auto text-primary" />
        <p class="mt-4 text-xs text-muted-foreground">Loading reviews...</p>
      </div>

      <div v-else-if="filteredReviews.length === 0" class="py-12 text-center">
        <MessageSquareX class="mx-auto h-20 w-20 text-muted-foreground/30" />
        <h3 class="mt-4 text-lg font-semibold text-muted-foreground">
          No reviews found
        </h3>
        <p class="text-xs text-muted-foreground">Try adjusting your filters</p>
      </div>

      <div v-else class="divide-y divide-border">
        <div
          v-for="review in paginatedReviews"
          :key="review._id"
          class="flex flex-col gap-2.5 px-4 py-5 transition-colors hover:bg-muted/40 sm:flex-row sm:items-start"
        >
          <img
            :src="reviewUser(review)?.avatar_url || 'https://via.placeholder.com/56'"
            :alt="reviewUser(review)?.username"
            class="h-14 w-14 shrink-0 rounded-full bg-muted object-cover"
          />

          <div class="min-w-0 flex-1">
            <div class="mb-2 flex flex-wrap items-center">
              <span class="mr-2 font-bold">
                {{ reviewUser(review)?.username || "Anonymous" }}
              </span>
              <UiRating :model-value="review.rating" :size="16" readonly />
              <span class="ml-2 text-xs text-muted-foreground">
                {{ formatDate(review.createdAt) }}
              </span>
            </div>

            <div class="mb-3">
              <div class="mb-2 flex items-center">
                <span
                  class="mr-2 inline-flex items-center gap-1 rounded-full bg-waterblue/15 px-2 py-0.5 text-[11px] font-semibold text-waterblue"
                >
                  <BookOpen class="h-3 w-3" />
                  {{ reviewBook(review)?.title || "Unknown Book" }}
                </span>
              </div>
              <p class="mt-2 text-sm text-foreground/90">
                {{ review.comment }}
              </p>
            </div>

            <!-- Admin Replies Section -->
            <div
              v-if="review.replies && review.replies.length > 0"
              class="ml-0 mt-3 space-y-2 sm:ml-12"
            >
              <div
                v-for="reply in review.replies"
                :key="reply._id"
                class="rounded-lg bg-waterblue/10 px-3 py-2"
              >
                <div class="mb-1 flex items-center justify-between">
                  <div class="flex items-center">
                    <ShieldCheck class="mr-1 h-4 w-4 text-waterblue" />
                    <span class="text-xs font-bold text-waterblue">
                      {{ replyAdmin(reply)?.username || "Admin" }}
                    </span>
                    <span class="ml-2 text-xs text-muted-foreground">
                      {{ formatDate(reply.createdAt) }}
                    </span>
                  </div>
                  <div class="flex items-center">
                    <UiButton
                      variant="ghost"
                      size="iconSm"
                      class="h-6 w-6"
                      aria-label="Edit reply"
                      @click="editReply(review, reply)"
                    >
                      <Pencil class="h-3.5 w-3.5" />
                    </UiButton>
                    <UiButton
                      variant="ghost"
                      size="iconSm"
                      class="h-6 w-6 text-destructive hover:text-destructive"
                      aria-label="Delete reply"
                      @click="confirmDeleteReply(review._id, reply._id)"
                    >
                      <Trash2 class="h-3.5 w-3.5" />
                    </UiButton>
                  </div>
                </div>
                <p class="text-sm text-foreground/80">
                  {{ reply.content }}
                </p>
              </div>
            </div>
          </div>

          <div class="flex shrink-0 flex-row gap-2 sm:flex-col">
            <UiButton
              variant="ghost"
              size="sm"
              class="bg-waterblue/15 text-waterblue hover:bg-waterblue/25 hover:text-waterblue"
              @click="openReplyDialog(review)"
            >
              <Reply class="h-4 w-4" />
              Reply
            </UiButton>
            <UiButton
              variant="ghost"
              size="sm"
              class="text-destructive hover:text-destructive"
              @click="confirmDeleteReview(review._id)"
            >
              <Trash2 class="h-4 w-4" />
              Delete
            </UiButton>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="filteredReviews.length > itemsPerPage"
        class="flex justify-center border-t border-border py-3"
      >
        <UiPagination
          v-slot="{ page: currentPage }"
          v-model:page="page"
          :total="filteredReviews.length"
          :items-per-page="itemsPerPage"
          :sibling-count="1"
          show-edges
        >
          <UiPaginationContent v-slot="{ items }">
            <UiPaginationPrevious />
            <template v-for="(item, index) in items">
              <UiPaginationItem
                v-if="item.type === 'page'"
                :key="index"
                :value="item.value"
                :is-active="item.value === currentPage"
              >
                {{ item.value }}
              </UiPaginationItem>
              <UiPaginationEllipsis v-else :key="item.type" :index="index" />
            </template>
            <UiPaginationNext />
          </UiPaginationContent>
        </UiPagination>
      </div>
    </UiCard>

    <!-- Reply Dialog -->
    <UiDialog v-model:open="replyDialog">
      <UiDialogContent class="sm:max-w-xl">
        <UiDialogHeader>
          <UiDialogTitle>
            {{ editingReply ? "Edit Reply" : "Reply to Review" }}
          </UiDialogTitle>
        </UiDialogHeader>

        <UiTextarea
          v-model="replyContent"
          label="Your reply"
          :rows="4"
          :error-message="replyError"
          :hint="`${replyContent.length} characters`"
        />

        <UiDialogFooter>
          <UiButton variant="ghost" @click="closeReplyDialog">Cancel</UiButton>
          <UiButton
            class="bg-waterblue text-white hover:bg-waterblue/90"
            :loading="submitting"
            :disabled="!replyContent || replyContent.length < 10"
            @click="submitReply"
          >
            {{ editingReply ? "Update" : "Submit" }}
          </UiButton>
        </UiDialogFooter>
      </UiDialogContent>
    </UiDialog>

    <!-- Delete Confirmation Dialog -->
    <AdminConfirmDeleteDialog
      v-model:open="deleteDialog"
      :question="`Are you sure you want to delete this ${deleteType}?`"
      :loading="deleting"
      @confirm="performDelete"
    />

    <!-- Snackbar -->
    <SnackbarAlert
      v-model="snackbar"
      :text="snackbarText"
      :color="snackbarColor"
      :timeout="3000"
    />
  </div>
</template>

<script setup lang="ts">
import type { Component } from "vue";
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
  Search,
  ShieldCheck,
  Star,
  Trash2,
  X,
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
  { label: "All Ratings", value: "all" },
  { label: "5 Stars", value: "5" },
  { label: "4 Stars", value: "4" },
  { label: "3 Stars", value: "3" },
  { label: "2 Stars", value: "2" },
  { label: "1 Star", value: "1" },
];
const repliedFilters = [
  { label: "All", value: "all" },
  { label: "Replied", value: "replied" },
  { label: "Not Replied", value: "not-replied" },
];

interface ReviewStat {
  title: string;
  value: string | number;
  icon: Component;
  avatarClass: string;
  iconClass: string;
}

const reviewStats = computed<ReviewStat[]>(() => [
  {
    title: "Total Reviews",
    value: reviews.value.length,
    icon: MessagesSquare,
    avatarClass: "bg-waterblue",
    iconClass: "text-white",
  },
  {
    title: "Average Rating",
    value: averageRating.value,
    icon: Star,
    avatarClass: "bg-customyellow",
    iconClass: "text-customblack",
  },
  {
    title: "Pending Replies",
    value: pendingReplies.value,
    icon: Reply,
    avatarClass: "bg-darkgreen",
    iconClass: "text-white",
  },
]);

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
