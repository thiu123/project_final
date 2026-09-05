import { defineStore } from "pinia";
import { ref } from "vue";
import {
  fetchReviews,
  fetchUserReviews,
  createReview,
  deleteReview as deleteReviewApi,
} from "@/api/reviewApi";
import type { Review } from "@/types";

export const useReviewStore = defineStore("review", () => {
  const reviews = ref<Review[]>([]);
  const userReviews = ref<Review[]>([]);

  async function loadReviews(bookId: string) {
    try {
      const res = await fetchReviews(bookId);
      reviews.value = res.data || [];
      return res.data;
    } catch (error) {
      console.error("Failed to load reviews", error);
      throw error;
    }
  }

  async function loadUserReviewsAction() {
    try {
      const res = await fetchUserReviews();
      userReviews.value = res.data || [];
      return res.data;
    } catch (error) {
      console.error("Failed to load user reviews", error);
      throw error;
    }
  }

  async function addNewReview({
    bookId,
    rating,
    comment,
  }: {
    bookId: string;
    rating: number;
    comment: string;
  }) {
    try {
      const res = await createReview(bookId, rating, comment);
      if (res.data) reviews.value.push(res.data);
      return res.data;
    } catch (err) {
      console.error("Error creating review:", err);
      throw err;
    }
  }

  async function deleteReview(reviewId: string) {
    try {
      await deleteReviewApi(reviewId);
      reviews.value = reviews.value.filter((review) => review._id !== reviewId);
      userReviews.value = userReviews.value.filter(
        (review) => review._id !== reviewId
      );
    } catch (err) {
      console.error("Error deleting review:", err);
      throw err;
    }
  }

  return {
    reviews,
    userReviews,
    loadReviews,
    loadUserReviewsAction,
    addNewReview,
    deleteReview,
  };
});
