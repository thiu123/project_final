<template>
  <v-container fluid class="pa-0">
    <!-- Header Section -->
    <v-card flat class="reviews-container my-5 rounded-xl">
      <v-card-title class="header-section text-h5 font-weight-bold">
        REVIEWS
      </v-card-title>

      <!-- Rating Summary -->
      <v-card-text class="rating-summary pa-6">
        <v-row align="center" no-gutters>
          <v-col cols="auto">
            <div class="overall-rating text-h4">
              <span class="rating-number">4.0</span>
              <span class="rating-total">/5</span>
            </div>
          </v-col>

          <v-col cols="auto" class="mx-6">
            <div class="rating-breakdown">
              <v-row
                v-for="(rating, index) in ratingBreakdown"
                :key="index"
                align="center"
                no-gutters
                class="rating-row"
              >
                <v-col cols="auto">
                  <span class="star-number">{{ 5 - index }}</span>
                </v-col>
                <v-col cols="auto" class="mx-2">
                  <v-icon color="orange" size="small">mdi-star</v-icon>
                </v-col>
                <v-col cols="auto">
                  <span class="rating-count">({{ rating.count }})</span>
                </v-col>
              </v-row>
            </div>
          </v-col>

          <v-spacer></v-spacer>

          <v-col cols="auto">
            <v-btn
              color="primary"
              variant="elevated"
              rounded="lg"
              class="write-review-btn"
              @click="showCreateReviewsDialog = true"
            >
              <v-icon start>mdi-pencil</v-icon>
              Write a Review
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>

      <v-dialog v-model="showCreateReviewsDialog" max-width="600">
        <v-card rounded="xl">
          <v-card-title class="justify-center text-h6"
            >WRITE A BOOK REVIEW</v-card-title
          >

          <!-- Rating -->
          <v-card-text class="text-center mt-4">
            <v-rating v-model="rating" color="amber" length="5" size="32" />
          </v-card-text>

          <!-- Comment box -->
          <v-card-text class="px-4 pt-0">
            <v-textarea
              v-model="comment"
              label="Enter your review of the product"
              variant="outlined"
              rows="4"
              auto-grow
              outlined
            />
          </v-card-text>

          <!-- Buttons -->
          <v-card-actions class="justify-end px-4 pb-4">
            <v-btn variant="text" @click="showCreateReviewsDialog = false"
              >Cancel</v-btn
            >
            <v-btn
              color="red"
              @click="handleWriteReview($route.params.id, rating, comment)"
              >Submit Review</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-divider></v-divider>

      <!-- Reviews List -->
      <v-card-text class="pa-0">
        <template v-if="isLoaded">
          <v-list v-if="loading">
            <v-row class="fill-height ma-0" align="center" justify="center">
              <v-col cols="auto">
                <v-progress-circular
                  indeterminate
                  color="primary"
                ></v-progress-circular>
              </v-col>
            </v-row>
          </v-list>

          <v-list v-else-if="reviews && reviews.length > 0">
            <div
              v-for="(review, index) in reviews"
              :key="index"
              class="review-item"
            >
              <v-container>
                <!-- Reviewer Info -->
                <v-row class="mb-2">
                  <v-col cols="12">
                    <div class="reviewer-info d-flex flex-column">
                      <h3 class="reviewer-name mb-1">
                        {{ review.userId?.username || "Anonymous" }}
                      </h3>
                      <div class="">
                        <v-rating
                          :model-value="review.rating"
                          color="amber"
                          density="compact"
                          readonly
                          size="small"
                        ></v-rating>
                        <div class="review-date">
                          {{ review.createdAt }}
                        </div>
                      </div>
                    </div>
                  </v-col>
                </v-row>

                <!-- Review Content -->
                <v-row>
                  <v-col cols="12">
                    <div class="review-content">
                      <p class="review-text">{{ review.comment }}</p>
                    </div>
                  </v-col>
                </v-row>
              </v-container>

              <v-divider v-if="index < reviews.length - 1"></v-divider>
            </div>
          </v-list>

          <v-list v-else>
            <v-row class="fill-height ma-0" align="center" justify="center">
              <v-col cols="auto">
                <p class="text-center">No reviews available for this book.</p>
              </v-col>
            </v-row>
          </v-list>
        </template>

        <template v-else>
          <v-list>
            <v-row class="fill-height ma-0" align="center" justify="center">
              <v-col cols="auto">
                <v-progress-circular
                  indeterminate
                  color="primary"
                ></v-progress-circular>
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
export default {
  name: "BookReviewsUI",
  data() {
    return {
      rating: 0,
      showCreateReviewsDialog: false,
      ratingBreakdown: [
        { count: 20 },
        { count: 2 },
        { count: 2 },
        { count: 0 },
        { count: 0 },
      ],
      loading: false,
      isLoaded: false,
    };
  },
  computed: {
    ...mapState("review", ["reviews"]),
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
      await this.loadReviews(this.$route.params.id);
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      this.loading = false;
      this.isLoaded = true;
    }
  },

  methods: {
    ...mapActions("review", ["addNewReview", "loadReviews"]),
    async handleWriteReview(bookId, rating, comment) {
      this.loading = true;
      try {
        await this.addNewReview({ bookId, rating, comment });
        console.log("Review written successfully", { bookId, rating, comment });
        this.showCreateReviewsDialog = false;
        this.rating = 0;
        this.comment = "";
        await this.loadReviews(this.$route.params.id);
        console.log("Reviews reloaded after writing a new review");
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
  background-color: #f5f5f5;
}

.header-section {
  background-color: #4a90e2 !important;
  color: white !important;
  font-size: 18px !important;
  font-weight: bold !important;
  letter-spacing: 1px !important;
  padding: 15px 25px !important;
}

.rating-summary {
  background-color: white !important;
  border-bottom: 2px solid #e0e0e0;
}

.overall-rating {
  display: flex;
  align-items: baseline;
  gap: 5px;
}

.rating-number {
  font-size: 48px;
  font-weight: bold;
  color: #333;
}

.rating-total {
  font-size: 24px;
  color: #666;
}

.rating-breakdown .rating-row {
  margin-bottom: 5px;
}

.star-number {
  font-weight: bold;
  color: #333;
  min-width: 12px;
}

.rating-count {
  color: #666;
  font-size: 14px;
}

/* .write-review-btn {
  text-transform: none !important;
  font-weight: bold !important;
} */

.review-item {
  background-color: white;
  padding: 25px 0;
}

.reviewer-info {
  margin-bottom: 15px;
}

.reviewer-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0 0 8px 0;
}

.review-date {
  color: #666;
  font-size: 14px;
}

.review-content {
  line-height: 1.6;
}

.review-text {
  color: #333;
  margin: 0;
  font-size: 14px;
  text-align: justify;
  line-height: 1.6;
}

/* Responsive Design */
@media (max-width: 768px) {
  .rating-summary .v-row {
    flex-direction: column !important;
    align-items: flex-start !important;
  }

  .rating-summary .v-col:last-child {
    width: 100%;
    margin-top: 20px;
  }

  /* .write-review-btn {
    width: 100%;
  } */
}
</style>
