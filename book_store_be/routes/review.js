const router = require("express").Router();
const middlewareController = require("../controllers/middlewareController");
const reviewController = require("../controllers/reviews/reviewsController");

router.post(
  "/create",
  middlewareController.verifyToken,
  reviewController.createReview
);
router.delete(
  "/:id",
  middlewareController.verifyToken,
  reviewController.deleteReview
);
router.get(
  "/user/reviews",
  middlewareController.verifyToken,
  reviewController.getReviewsByUser
);
router.get("/average/:id", reviewController.getAverageRatingByBook);
router.get(
  "/:id",
  middlewareController.verifyToken,
  reviewController.getAllReviews
);

// ========== ADMIN ROUTES ==========
router.get(
  "/admin/all",
  middlewareController.verifyTokenAndAdmin,
  reviewController.getAllReviewsAdmin
);

// ========== ADMIN REPLY ROUTES ==========
router.post(
  "/:reviewId/reply",
  middlewareController.verifyTokenAndAdmin,
  reviewController.createReply
);
router.put(
  "/:reviewId/reply/:replyId",
  middlewareController.verifyTokenAndAdmin,
  reviewController.updateReply
);
router.delete(
  "/:reviewId/reply/:replyId",
  middlewareController.verifyTokenAndAdmin,
  reviewController.deleteReply
);

module.exports = router;
