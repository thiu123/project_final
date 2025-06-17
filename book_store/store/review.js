import { fetchReviews, createReview, deleteReview } from "@/api/reviewApi";

export default {
  namespaced: true,
  state: () => {
    return {
      reviews: [],
    };
  },
  mutations: {
    setReviews(state, reviews) {
      state.reviews = reviews;
    },
    addReview(state, review) {
      state.reviews.push(review);
    },
    deleteReview(state, reviewId) {
      state.reviews = state.reviews.filter((review) => review._id !== reviewId);
    },
  },
  actions: {
    async loadReviews({ commit }) {
      try {
        const res = await fetchReviews();
        commit("setReviews", res.data);
      } catch (err) {
        console.error("Failed to load reviews", error);
      }
    },
    async addNewReview({ commit }, { bookId, rating, comment }) {
      try {
        const res = await createReview(bookId, rating, comment);
        commit("addReview", res.data);
      } catch (err) {
        console.error("Error creating review:", err);
      }
    },
    async deleteReview({ commit }, reviewId) {
      try {
        await deleteReview(reviewId);
        commit("deleteReview", reviewId);
      } catch (err) {
        console.error("Error deleting review:", err);
      }
    },
  },
};
