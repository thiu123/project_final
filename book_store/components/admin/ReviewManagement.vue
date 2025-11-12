<template>
  <div>
    <!-- Header with Stats -->
    <v-row class="mb-6">
      <v-col cols="12" md="4" v-for="stat in reviewStats" :key="stat.title">
        <v-card elevation="2">
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <p class="text-caption text-grey mb-1">{{ stat.title }}</p>
                <h3 class="text-h4 font-weight-bold">{{ stat.value }}</h3>
              </div>
              <v-avatar :color="stat.color" size="56">
                <v-icon size="30" color="white">{{ stat.icon }}</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-card class="mb-6" elevation="2">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="4">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Search reviews..."
              variant="outlined"
              density="compact"
              hide-details
              clearable
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filterRating"
              :items="ratingFilters"
              label="Filter by Rating"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filterReplied"
              :items="repliedFilters"
              label="Reply Status"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            ></v-select>
          </v-col>
          <v-col cols="12" md="2">
            <v-btn
              color="primary"
              variant="tonal"
              block
              @click="resetFilters"
              prepend-icon="mdi-refresh"
            >
              Reset
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Reviews List -->
    <v-card elevation="2">
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6 font-weight-bold">All Reviews</span>
        <v-chip color="primary">{{ filteredReviews.length }} reviews</v-chip>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text v-if="loading" class="text-center py-8">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
        <p class="text-caption text-grey mt-4">Loading reviews...</p>
      </v-card-text>

      <v-card-text v-else-if="filteredReviews.length === 0" class="text-center py-12">
        <v-icon size="80" color="grey-lighten-2">mdi-comment-remove-outline</v-icon>
        <h3 class="text-h6 text-grey mt-4">No reviews found</h3>
        <p class="text-caption text-grey">Try adjusting your filters</p>
      </v-card-text>

      <v-list v-else lines="three" class="pa-0">
        <template v-for="(review, index) in paginatedReviews" :key="review._id">
          <v-list-item class="review-item">
            <template v-slot:prepend>
              <v-avatar size="56" class="mr-4">
                <img
                  :src="review.userId?.avatar_url || 'https://via.placeholder.com/56'"
                  :alt="review.userId?.username"
                />
              </v-avatar>
            </template>

            <v-list-item-title class="d-flex align-center mb-2">
              <span class="font-weight-bold mr-2">{{ review.userId?.username || 'Anonymous' }}</span>
              <v-rating
                :model-value="review.rating"
                color="amber"
                density="compact"
                size="small"
                readonly
              ></v-rating>
              <span class="text-caption text-grey ml-2">{{ formatDate(review.createdAt) }}</span>
            </v-list-item-title>

            <v-list-item-subtitle class="mb-3">
              <div class="d-flex align-center mb-2">
                <v-chip size="x-small" color="primary" variant="tonal" class="mr-2">
                  <v-icon start size="x-small">mdi-book</v-icon>
                  {{ review.bookId?.title || 'Unknown Book' }}
                </v-chip>
              </div>
              <p class="text-body-2 text-grey-darken-3 mt-2">{{ review.comment }}</p>
            </v-list-item-subtitle>

            <!-- Admin Replies Section -->
            <div v-if="review.replies && review.replies.length > 0" class="mt-3 ml-12">
              <v-card variant="tonal" color="blue-lighten-5" class="mb-2" v-for="reply in review.replies" :key="reply._id">
                <v-card-text class="py-2 px-3">
                  <div class="d-flex justify-space-between align-center mb-1">
                    <div class="d-flex align-center">
                      <v-icon size="small" color="primary" class="mr-1">mdi-shield-account</v-icon>
                      <span class="text-caption font-weight-bold text-primary">
                        {{ reply.adminId?.username || 'Admin' }}
                      </span>
                      <span class="text-caption text-grey ml-2">{{ formatDate(reply.createdAt) }}</span>
                    </div>
                    <div>
                      <v-btn
                        icon="mdi-pencil"
                        size="x-small"
                        variant="text"
                        @click="editReply(review, reply)"
                      ></v-btn>
                      <v-btn
                        icon="mdi-delete"
                        size="x-small"
                        variant="text"
                        color="error"
                        @click="confirmDeleteReply(review._id, reply._id)"
                      ></v-btn>
                    </div>
                  </div>
                  <p class="text-body-2 text-grey-darken-2">{{ reply.content }}</p>
                </v-card-text>
              </v-card>
            </div>

            <template v-slot:append>
              <div class="d-flex flex-column ga-2">
                <v-btn
                  color="primary"
                  variant="tonal"
                  size="small"
                  prepend-icon="mdi-reply"
                  @click="openReplyDialog(review)"
                >
                  Reply
                </v-btn>
                <v-btn
                  color="error"
                  variant="text"
                  size="small"
                  prepend-icon="mdi-delete"
                  @click="confirmDeleteReview(review._id)"
                >
                  Delete
                </v-btn>
              </div>
            </template>
          </v-list-item>

          <v-divider v-if="index < paginatedReviews.length - 1"></v-divider>
        </template>
      </v-list>

      <!-- Pagination -->
      <v-card-actions v-if="filteredReviews.length > itemsPerPage">
        <v-spacer></v-spacer>
        <v-pagination
          v-model="page"
          :length="totalPages"
          :total-visible="7"
          rounded="circle"
        ></v-pagination>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>

    <!-- Reply Dialog -->
    <v-dialog v-model="replyDialog" max-width="600">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">
          {{ editingReply ? 'Edit Reply' : 'Reply to Review' }}
        </v-card-title>
        <v-card-text>
          <v-textarea
            v-model="replyContent"
            label="Your reply"
            variant="outlined"
            rows="4"
            counter
            :rules="[v => !!v || 'Reply is required', v => v.length >= 10 || 'Reply must be at least 10 characters']"
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeReplyDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="submitReply"
            :loading="submitting"
            :disabled="!replyContent || replyContent.length < 10"
          >
            {{ editingReply ? 'Update' : 'Submit' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete this {{ deleteType }}? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" @click="performDelete" :loading="deleting">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import { getAllReviewsAdmin, createReply, updateReply, deleteReply, deleteReview } from "~/api/reviewApi";

export default {
  name: "ReviewManagement",
  data() {
    return {
      loading: false,
      reviews: [],
      search: "",
      filterRating: null,
      filterReplied: null,
      page: 1,
      itemsPerPage: 10,
      
      // Reply dialog
      replyDialog: false,
      replyContent: "",
      selectedReview: null,
      editingReply: null,
      submitting: false,
      
      // Delete dialog
      deleteDialog: false,
      deleteType: "",
      deleteReviewId: null,
      deleteReplyId: null,
      deleting: false,
      
      // Snackbar
      snackbar: false,
      snackbarText: "",
      snackbarColor: "success",
      
      // Filter options
      ratingFilters: [
        { title: "5 Stars", value: 5 },
        { title: "4 Stars", value: 4 },
        { title: "3 Stars", value: 3 },
        { title: "2 Stars", value: 2 },
        { title: "1 Star", value: 1 },
      ],
      repliedFilters: [
        { title: "Replied", value: true },
        { title: "Not Replied", value: false },
      ],
    };
  },
  computed: {
    reviewStats() {
      return [
        {
          title: "Total Reviews",
          value: this.reviews.length,
          icon: "mdi-comment-multiple",
          color: "primary",
        },
        {
          title: "Average Rating",
          value: this.averageRating,
          icon: "mdi-star",
          color: "warning",
        },
        {
          title: "Pending Replies",
          value: this.pendingReplies,
          icon: "mdi-reply",
          color: "info",
        },
      ];
    },
    averageRating() {
      if (this.reviews.length === 0) return "0.0";
      const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
      return (sum / this.reviews.length).toFixed(1);
    },
    pendingReplies() {
      return this.reviews.filter(r => !r.replies || r.replies.length === 0).length;
    },
    filteredReviews() {
      let filtered = this.reviews;
      
      // Search filter
      if (this.search) {
        const searchLower = this.search.toLowerCase();
        filtered = filtered.filter(r => 
          r.comment?.toLowerCase().includes(searchLower) ||
          r.userId?.username?.toLowerCase().includes(searchLower) ||
          r.bookId?.title?.toLowerCase().includes(searchLower)
        );
      }
      
      // Rating filter
      if (this.filterRating !== null) {
        filtered = filtered.filter(r => r.rating === this.filterRating);
      }
      
      // Replied filter
      if (this.filterReplied !== null) {
        filtered = filtered.filter(r => {
          const hasReplies = r.replies && r.replies.length > 0;
          return this.filterReplied ? hasReplies : !hasReplies;
        });
      }
      
      return filtered;
    },
    paginatedReviews() {
      const start = (this.page - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredReviews.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredReviews.length / this.itemsPerPage);
    },
  },
  methods: {
    async fetchReviews() {
      this.loading = true;
      try {
        const response = await getAllReviewsAdmin();
        this.reviews = response.data;
      } catch (error) {
        console.error("Error fetching reviews:", error);
        this.showSnackbar("Failed to load reviews", "error");
      } finally {
        this.loading = false;
      }
    },
    
    openReplyDialog(review) {
      this.selectedReview = review;
      this.replyContent = "";
      this.editingReply = null;
      this.replyDialog = true;
    },
    
    editReply(review, reply) {
      this.selectedReview = review;
      this.replyContent = reply.content;
      this.editingReply = reply;
      this.replyDialog = true;
    },
    
    closeReplyDialog() {
      this.replyDialog = false;
      this.replyContent = "";
      this.selectedReview = null;
      this.editingReply = null;
    },
    
    async submitReply() {
      if (!this.replyContent || this.replyContent.length < 10) return;
      
      this.submitting = true;
      try {
        if (this.editingReply) {
          // Update existing reply
          await updateReply(this.selectedReview._id, this.editingReply._id, this.replyContent);
          this.showSnackbar("Reply updated successfully", "success");
        } else {
          // Create new reply
          await createReply(this.selectedReview._id, this.replyContent);
          this.showSnackbar("Reply added successfully", "success");
        }
        
        await this.fetchReviews();
        this.closeReplyDialog();
      } catch (error) {
        console.error("Error submitting reply:", error);
        this.showSnackbar("Failed to submit reply", "error");
      } finally {
        this.submitting = false;
      }
    },
    
    confirmDeleteReview(reviewId) {
      this.deleteType = "review";
      this.deleteReviewId = reviewId;
      this.deleteReplyId = null;
      this.deleteDialog = true;
    },
    
    confirmDeleteReply(reviewId, replyId) {
      this.deleteType = "reply";
      this.deleteReviewId = reviewId;
      this.deleteReplyId = replyId;
      this.deleteDialog = true;
    },
    
    async performDelete() {
      this.deleting = true;
      try {
        if (this.deleteType === "review") {
          await deleteReview(this.deleteReviewId);
          this.showSnackbar("Review deleted successfully", "success");
        } else {
          await deleteReply(this.deleteReviewId, this.deleteReplyId);
          this.showSnackbar("Reply deleted successfully", "success");
        }
        
        await this.fetchReviews();
        this.deleteDialog = false;
      } catch (error) {
        console.error("Error deleting:", error);
        this.showSnackbar(`Failed to delete ${this.deleteType}`, "error");
      } finally {
        this.deleting = false;
      }
    },
    
    resetFilters() {
      this.search = "";
      this.filterRating = null;
      this.filterReplied = null;
      this.page = 1;
    },
    
    formatDate(date) {
      return new Date(date).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    
    showSnackbar(text, color = "success") {
      this.snackbarText = text;
      this.snackbarColor = color;
      this.snackbar = true;
    },
  },
  
  mounted() {
    this.fetchReviews();
  },
};
</script>

<style scoped>
.review-item {
  padding: 20px 16px;
}

.review-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}
</style>
