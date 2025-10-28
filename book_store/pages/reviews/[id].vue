<template>
  <v-container fluid class="pa-0">
    <!-- Header Section -->
    <v-card flat class="reviews-container my-8 rounded-xl elevation-2">
      <v-card-title
        class="header-section text-h5 font-weight-bold d-flex align-center"
      >
        <v-icon start color="white" size="large" class="me-3"
          >mdi-star-outline</v-icon
        >
        REVIEWS
      </v-card-title>

      <!-- Rating Summary -->
      <v-card-text class="rating-summary pa-8">
        <v-row align="center" no-gutters>
          <v-col cols="auto">
            <div class="overall-rating text-center">
              <div class="text-h2 font-weight-bold text-primary mb-2">
                <span class="rating-number">{{ displayRating }}</span>
                <span class="text-h5 text-medium-emphasis">/5</span>
              </div>
              <v-rating
                :model-value="displayRating"
                color="amber"
                density="compact"
                readonly
                size="small"
                class="mb-2"
              ></v-rating>
              <div class="text-caption text-medium-emphasis">
                Based on {{ totalReviews }} reviews
              </div>
            </div>
          </v-col>

          <v-col cols="auto" class="mx-8">
            <div class="rating-breakdown">
              <v-row
                v-for="(rating, index) in ratingBreakdown"
                :key="index"
                align="center"
                no-gutters
                class="rating-row mb-1"
              >
                <v-col cols="auto" class="me-2">
                  <span class="text-body-2 font-weight-medium">{{
                    5 - index
                  }}</span>
                </v-col>
                <v-col cols="auto" class="me-2">
                  <v-icon color="amber" size="small">mdi-star</v-icon>
                </v-col>
                <!-- <v-col cols="auto">
                  <v-progress-linear
                    :model-value="(rating.count / 24) * 100"
                    color="amber"
                    height="8"
                    rounded
                    class="me-3"
                  ></v-progress-linear>
                </v-col>
                <v-col cols="auto">
                  <span class="text-caption text-medium-emphasis"
                    >({{ rating.count }})</span
                  >
                </v-col> -->
              </v-row>
            </div>
          </v-col>

          <v-spacer></v-spacer>

          <v-col cols="auto">
            <v-btn
              color="primary"
              variant="elevated"
              rounded="lg"
              size="large"
              class="write-review-btn elevation-2"
              @click="showCreateReviewsDialog = true"
            >
              <v-icon start>mdi-pencil-plus</v-icon>
              Write a Review
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Create Review Dialog -->
      <v-dialog v-model="showCreateReviewsDialog" max-width="600" persistent>
        <v-card rounded="xl" class="elevation-8">
          <v-card-title
            class="text-h6 text-center pa-6 pb-4 bg-primary text-white"
          >
            <v-icon start color="white" class="me-2">mdi-pencil</v-icon>
            WRITE A BOOK REVIEW
          </v-card-title>

          <v-card-text class="pa-6">
            <!-- Rating -->
            <div class="text-center mb-6">
              <div class="text-body-1 text-medium-emphasis mb-3">
                Rate this book:
              </div>
              <v-rating
                v-model="rating"
                color="amber"
                length="5"
                size="40"
                hover
                class="mb-2"
              />
              <div class="text-caption text-medium-emphasis">
                {{
                  rating > 0
                    ? `${rating} star${rating > 1 ? "s" : ""}`
                    : "Select rating"
                }}
              </div>
            </div>

            <!-- Comment box -->
            <v-textarea
              v-model="comment"
              label="Share your thoughts about this book..."
              variant="outlined"
              rows="4"
              auto-grow
              color="primary"
              class="mb-4"
              :rules="[(v) => !!v || 'Review comment is required']"
            />
          </v-card-text>

          <!-- Buttons -->
          <v-card-actions class="pa-6 pt-0">
            <v-spacer></v-spacer>
            <v-btn
              variant="text"
              @click="showCreateReviewsDialog = false"
              class="me-3"
            >
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              variant="elevated"
              @click="handleWriteReview($route.params.id, rating, comment)"
              :disabled="!rating || !comment.trim()"
              :loading="loading"
            >
              <v-icon start>mdi-send</v-icon>
              Submit Review
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Delete Confirmation Dialog -->
      <v-dialog v-model="showDeleteDialog" max-width="450" persistent>
        <v-card rounded="xl" class="elevation-8">
          <v-card-title
            class="text-h6 text-center pa-6 pb-4 bg-error text-white"
          >
            <v-icon start color="white" class="me-2">mdi-delete-alert</v-icon>
            Delete Review
          </v-card-title>
          <v-card-text class="pa-6 text-center">
            <v-icon color="error" size="large" class="mb-4"
              >mdi-alert-circle</v-icon
            >
            <div class="text-body-1 mb-2">
              Are you sure you want to delete this review?
            </div>
            <div class="text-caption text-medium-emphasis">
              This action cannot be undone.
            </div>
          </v-card-text>
          <v-card-actions class="pa-6 pt-0">
            <v-spacer></v-spacer>
            <v-btn
              variant="text"
              @click="showDeleteDialog = false"
              class="me-3"
            >
              Cancel
            </v-btn>
            <v-btn
              color="error"
              variant="elevated"
              @click="confirmDeleteReview"
              :loading="deleteLoading"
            >
              <v-icon start>mdi-delete</v-icon>
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Edit Reply Dialog -->
      <v-dialog v-model="editReplyDialog" max-width="600" persistent>
        <v-card rounded="xl" class="elevation-8">
          <v-card-title
            class="text-h6 text-center pa-6 pb-4 bg-primary text-white"
          >
            <v-icon start color="white" class="me-2">mdi-pencil</v-icon>
            EDIT ADMIN REPLY
          </v-card-title>

          <v-card-text class="pa-6">
            <v-textarea
              v-model="editReplyContent"
              label="Reply content"
              variant="outlined"
              rows="4"
              auto-grow
              :rules="[(v) => !!v || 'Reply content is required']"
            ></v-textarea>
          </v-card-text>

          <v-card-actions class="pa-6 pt-0">
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="editReplyDialog = false" class="me-3">
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              variant="elevated"
              @click="confirmEditReply"
              :disabled="!editReplyContent || editReplyContent.trim() === ''"
            >
              <v-icon start>mdi-check</v-icon>
              Update Reply
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-divider></v-divider>

      <!-- Reviews List -->
      <v-card-text class="pa-0">
        <template v-if="isLoaded">
          <v-list v-if="loading" class="pa-8">
            <v-row class="fill-height ma-0" align="center" justify="center">
              <v-col cols="auto" class="text-center">
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="64"
                ></v-progress-circular>
                <div class="text-body-1 text-medium-emphasis mt-4">
                  Loading reviews...
                </div>
              </v-col>
            </v-row>
          </v-list>

          <v-list v-else-if="reviews && reviews.length > 0" class="pa-0">
            <div
              v-for="(review, index) in reviews"
              :key="index"
              class="review-item"
            >
              <v-container class="pa-6">
                <!-- Reviewer Info -->
                <v-row class="mb-4" align="center">
                  <v-col cols="11">
                    <div class="d-flex align-center">
                      <v-avatar color="primary" size="40" class="me-3">
                        <template v-if="review.userId?.avatar_url">
                          <v-img
                            :src="review.userId.avatar_url"
                            alt="User avatar"
                          />
                        </template>
                        <template v-else>
                          <v-icon color="white" size="20">mdi-account</v-icon>
                        </template>
                      </v-avatar>

                      <div class="flex-grow-1">
                        <div class="d-flex align-center mb-1">
                          <h3
                            class="text-h6 font-weight-bold text-primary mb-0 me-3"
                          >
                            {{ review.userId?.username || "Anonymous" }}
                          </h3>
                          <v-chip
                            size="small"
                            color="success"
                            variant="tonal"
                            class="text-caption"
                          >
                            Verified
                          </v-chip>
                        </div>
                        <div class="d-flex align-center">
                          <v-rating
                            :model-value="review.rating"
                            color="amber"
                            density="compact"
                            readonly
                            size="small"
                            class="me-2"
                          ></v-rating>
                          <span class="text-caption text-medium-emphasis">
                            {{ formatDate(review.createdAt) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="1" class="d-flex justify-end">
                    <!-- Delete button - only show for current user's reviews -->
                    <v-btn
                      v-if="isCurrentUserReview(review)"
                      icon
                      size="small"
                      color="error"
                      variant="text"
                      @click="showDeleteConfirmation(review._id)"
                      class="delete-btn"
                    >
                      <v-icon size="small">mdi-delete</v-icon>
                      <v-tooltip activator="parent" location="top">
                        Delete my review
                      </v-tooltip>
                    </v-btn>
                  </v-col>
                </v-row>

                <!-- Review Content -->
                <v-row>
                  <v-col cols="12">
                    <div class="review-content">
                      <p class="text-body-1 text-high-emphasis line-height-1-6">
                        {{ review.comment }}
                      </p>
                    </div>
                  </v-col>
                </v-row>

                <!-- Admin Replies Section -->
                <v-row
                  v-if="review.replies && review.replies.length > 0"
                  class="mt-2"
                >
                  <v-col cols="12">
                    <div class="admin-replies ml-8">
                      <div
                        v-for="(reply, replyIndex) in review.replies"
                        :key="replyIndex"
                        class="admin-reply pa-4 mb-3 rounded-lg"
                        style="
                          background: rgba(25, 118, 210, 0.05);
                          border-left: 3px solid #1976d2;
                        "
                      >
                        <div class="d-flex align-center mb-2">
                          <v-avatar color="primary" size="32" class="me-2">
                            <v-icon color="white" size="16"
                              >mdi-shield-account</v-icon
                            >
                          </v-avatar>
                          <div class="flex-grow-1">
                            <span
                              class="text-subtitle-2 font-weight-bold text-primary"
                            >
                              {{ reply.adminId?.username || "Admin" }}
                            </span>
                            <v-chip
                              size="x-small"
                              color="primary"
                              variant="flat"
                              class="ml-2"
                            >
                              Admin
                            </v-chip>
                            <span
                              class="text-caption text-medium-emphasis ml-2"
                            >
                              · {{ formatDate(reply.createdAt) }}
                            </span>
                          </div>
                          <!-- Edit/Delete buttons for admin's own reply -->
                          <div v-if="isAdmin && isCurrentUserReply(reply)">
                            <v-btn
                              icon
                              size="x-small"
                              variant="text"
                              color="primary"
                              @click="showEditReplyDialog(review._id, reply)"
                            >
                              <v-icon size="small">mdi-pencil</v-icon>
                            </v-btn>
                            <v-btn
                              icon
                              size="x-small"
                              variant="text"
                              color="error"
                              @click="confirmDeleteReply(review._id, reply._id)"
                            >
                              <v-icon size="small">mdi-delete</v-icon>
                            </v-btn>
                          </div>
                        </div>
                        <p class="text-body-2 mb-0 ml-10">
                          {{ reply.content }}
                        </p>
                      </div>
                    </div>
                  </v-col>
                </v-row>

                <!-- Admin Reply Form (only visible to admin) -->
                <v-row v-if="isAdmin" class="mt-3">
                  <v-col cols="12">
                    <div class="admin-reply-form ml-8">
                      <v-textarea
                        v-model="replyTexts[review._id]"
                        label="Write admin reply..."
                        variant="outlined"
                        rows="2"
                        density="comfortable"
                        hide-details
                        class="mb-2"
                      ></v-textarea>
                      <v-btn
                        color="primary"
                        variant="flat"
                        size="small"
                        :disabled="
                          !replyTexts[review._id] ||
                          replyTexts[review._id].trim() === ''
                        "
                        @click="submitReply(review._id)"
                        :loading="replyLoading[review._id]"
                      >
                        <v-icon start size="small">mdi-send</v-icon>
                        Post Reply
                      </v-btn>
                    </div>
                  </v-col>
                </v-row>
              </v-container>

              <v-divider v-if="index < reviews.length - 1"></v-divider>
            </div>
          </v-list>

          <v-list v-else class="pa-8">
            <v-row class="fill-height ma-0" align="center" justify="center">
              <v-col cols="auto" class="text-center">
                <v-icon color="grey-lighten-1" size="64" class="mb-4"
                  >mdi-comment-outline</v-icon
                >
                <div class="text-h6 text-medium-emphasis mb-2">
                  No reviews yet
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Be the first to share your thoughts about this book!
                </div>
              </v-col>
            </v-row>
          </v-list>
        </template>

        <template v-else>
          <v-list class="pa-8">
            <v-row class="fill-height ma-0" align="center" justify="center">
              <v-col cols="auto" class="text-center">
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="64"
                ></v-progress-circular>
                <div class="text-body-1 text-medium-emphasis mt-4">
                  Loading...
                </div>
              </v-col>
            </v-row>
          </v-list>
        </template>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { mapActions, mapState } from "vuex";
import { createReply, updateReply, deleteReply } from "~/api/reviewApi";

export default {
  name: "BookReviewsUI",
  data() {
    return {
      rating: 0,
      comment: "",
      showCreateReviewsDialog: false,
      showDeleteDialog: false,
      deleteLoading: false,
      reviewToDelete: null,
      averageRating: 0,
      totalReviews: 0,
      bookRating: 0, // Rating từ database
      ratingBreakdown: [
        { count: 20 },
        { count: 2 },
        { count: 2 },
        { count: 0 },
        { count: 0 },
      ],
      loading: false,
      isLoaded: false,
      // Reply management
      replyTexts: {},
      replyLoading: {},
      editReplyDialog: false,
      editingReply: null,
      editingReviewId: null,
      editReplyContent: "",
    };
  },
  computed: {
    ...mapState("review", ["reviews"]),
    ...mapState("auth", ["currentUser"]),
    isAdmin() {
      return this.currentUser?.admin === true;
    },
    // Hiển thị rating: nếu có review thì dùng average, không thì dùng rating mặc định từ database
    displayRating() {
      if (this.totalReviews > 0) {
        return this.averageRating;
      }
      return this.bookRating;
    },
  },
  watch: {
    reviews(newVal) {
      if (newVal && newVal.length > 0) {
        console.log("Reviews updated:", newVal);
      }
    },
  },
  async mounted() {
    this.isLoaded = false;
    this.loading = true;
    try {
      const bookId = this.$route.params.id;

      // Load reviews
      await this.loadReviews(bookId);

      // Load average rating và book info
      await this.loadRatingData(bookId);
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      this.loading = false;
      this.isLoaded = true;
    }
  },

  methods: {
    ...mapActions("review", ["addNewReview", "loadReviews", "deleteReview"]),

    async loadRatingData(bookId) {
      try {
        // Lấy average rating từ reviews
        const { getAverageRating } = await import("~/api/reviewApi");
        const ratingResponse = await getAverageRating(bookId);
        this.averageRating = ratingResponse.data.averageRating;
        this.totalReviews = ratingResponse.data.totalReviews;

        // Lấy thông tin book để có rating mặc định
        const axios = (await import("axios")).default;
        const bookResponse = await axios.get(
          `http://localhost:5000/api/books/${bookId}`
        );
        this.bookRating = bookResponse.data.rating || 0;
      } catch (error) {
        console.error("Error loading rating data:", error);
        this.averageRating = 0;
        this.totalReviews = 0;
        this.bookRating = 0;
      }
    },

    // Format date for display
    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },

    // Check if the review belongs to the current user
    isCurrentUserReview(review) {
      return (
        this.currentUser &&
        review.userId &&
        (review.userId._id === this.currentUser._id ||
          review.userId === this.currentUser._id)
      );
    },

    // Check if reply belongs to current admin
    isCurrentUserReply(reply) {
      return (
        this.currentUser &&
        reply.adminId &&
        (reply.adminId._id === this.currentUser._id ||
          reply.adminId === this.currentUser._id)
      );
    },

    // Submit admin reply
    async submitReply(reviewId) {
      const content = this.replyTexts[reviewId];
      if (!content || content.trim() === "") return;

      this.$set(this.replyLoading, reviewId, true);
      try {
        await createReply(reviewId, content);
        this.$set(this.replyTexts, reviewId, "");
        await this.loadReviews(this.$route.params.id);
        console.log("Reply added successfully");
      } catch (error) {
        console.error("Error adding reply:", error);
        alert("Failed to add reply. Please try again.");
      } finally {
        this.$set(this.replyLoading, reviewId, false);
      }
    },

    // Show edit reply dialog
    showEditReplyDialog(reviewId, reply) {
      this.editingReviewId = reviewId;
      this.editingReply = reply;
      this.editReplyContent = reply.content;
      this.editReplyDialog = true;
    },

    // Update reply
    async confirmEditReply() {
      if (!this.editReplyContent || this.editReplyContent.trim() === "") return;

      try {
        await updateReply(
          this.editingReviewId,
          this.editingReply._id,
          this.editReplyContent
        );
        this.editReplyDialog = false;
        this.editingReply = null;
        this.editingReviewId = null;
        this.editReplyContent = "";
        await this.loadReviews(this.$route.params.id);
        console.log("Reply updated successfully");
      } catch (error) {
        console.error("Error updating reply:", error);
        alert("Failed to update reply. Please try again.");
      }
    },

    // Delete reply
    async confirmDeleteReply(reviewId, replyId) {
      if (!confirm("Are you sure you want to delete this reply?")) return;

      try {
        await deleteReply(reviewId, replyId);
        await this.loadReviews(this.$route.params.id);
        console.log("Reply deleted successfully");
      } catch (error) {
        console.error("Error deleting reply:", error);
        alert("Failed to delete reply. Please try again.");
      }
    },

    // Show delete confirmation dialog
    showDeleteConfirmation(reviewId) {
      this.reviewToDelete = reviewId;
      this.showDeleteDialog = true;
    },

    // Confirm and delete the review
    async confirmDeleteReview() {
      if (!this.reviewToDelete) return;

      this.deleteLoading = true;
      try {
        await this.deleteReview(this.reviewToDelete);
        console.log("Review deleted successfully");
        this.showDeleteDialog = false;
        this.reviewToDelete = null;
        // Reload reviews and rating data
        const bookId = this.$route.params.id;
        await this.loadReviews(bookId);
        await this.loadRatingData(bookId);
      } catch (error) {
        console.error("Error deleting review:", error);
        // You might want to show an error message to the user here
      } finally {
        this.deleteLoading = false;
      }
    },

    async handleWriteReview(bookId, rating, comment) {
      this.loading = true;
      try {
        await this.addNewReview({ bookId, rating, comment });
        console.log("Review written successfully", { bookId, rating, comment });
        this.showCreateReviewsDialog = false;
        this.rating = 0;
        this.comment = "";
        // Reload reviews and rating data
        await this.loadReviews(bookId);
        await this.loadRatingData(bookId);
        console.log("Reviews and rating reloaded after writing a new review");
      } catch (error) {
        console.error("Error writing review:", error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.reviews-container {
  max-width: 1200px;
  margin: 0 auto;
  background-color: #fafafa;
}

.header-section {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
  color: white !important;
  font-size: 18px !important;
  font-weight: bold !important;
  letter-spacing: 1px !important;
  padding: 20px 30px !important;
  border-radius: 12px 12px 0 0 !important;
}

.rating-summary {
  background-color: white !important;
  border-bottom: 1px solid #e0e0e0;
}

.overall-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rating-number {
  font-size: 48px;
  font-weight: bold;
  color: #1976d2;
}

.rating-breakdown .rating-row {
  margin-bottom: 8px;
}

.review-item {
  background-color: white;
  transition: all 0.3s ease;
}

.review-item:hover {
  background-color: #f8f9fa;
}

.review-content {
  line-height: 1.6;
}

.line-height-1-6 {
  line-height: 1.6;
}

.ai-review-btn {
  background: linear-gradient(135deg, #6a1b9a 0%, #8e24aa 100%) !important;
  color: white !important;
  transition: all 0.3s ease;
}

.ai-review-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(106, 27, 154, 0.3) !important;
}

.delete-btn {
  opacity: 0.6;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .rating-summary .v-row {
    flex-direction: column !important;
    align-items: center !important;
  }

  .rating-summary .v-col:last-child {
    width: 100%;
    margin-top: 20px;
  }

  .header-section {
    padding: 15px 20px !important;
  }

  .rating-summary {
    padding: 20px !important;
  }
}

@media (max-width: 480px) {
  .reviews-container {
    margin: 0 10px;
  }
}
</style>
