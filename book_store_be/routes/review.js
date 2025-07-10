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
router.get(
  "/:id",
  middlewareController.verifyToken,
  reviewController.getAllReviews
);
router.get("/average/:id", reviewController.getAverageRatingByBook);

module.exports = router;
