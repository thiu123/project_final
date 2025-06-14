import Review from "../../models/Review.js";

const reviewsController = {
  getAllReviews: async (req, res) => {
    try {
      const reviews = await Review.find().populate("userId", "username").populate("bookId", "title");
      res.status(200).json(reviews);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  createReview: async (req, res) => {
    try {
      const { bookId, rating, comment } = req.body;
      const userId = req.user.id;
      const review = new Review({ bookId, rating, comment, userId  });
      if (!review) {
        return res.status(400).json({ msg: "Invalid review" });
      }
      await review.save();
      res.status(200).json(review);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  deleteReview: async (req, res) => {
    try {
      const { id } = req.params;
      const review = await Review.findByIdAndDelete(id);
      if (!review) {
        return res.status(404).json({ msg: "Review not found" });
      }
      res.status(200).json({ msg: "Review deleted successfully" });
    } catch(error) {
      return res.status(500).json({msg: error.message})
    }
  }
}