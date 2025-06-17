const router = require("express").Router();
const middlewareController = require("../controllers/middlewareController");
const reviewController = require("../controllers/reviews/reviewsController")

router.post("/", middlewareController.verifyToken, reviewController.createReview);
router.delete("/:id", middlewareController.verifyToken, reviewController.deleteReview);
router.get("/", middlewareController.verifyToken, reviewController.getAllReviews);

module.exports = router;