const Review = require("../../model/Review");

const reviewsController = {
  getAllReviews: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Missing bookId" });
      }

      const reviews = await Review.find({ bookId: id })
        .populate("userId", "username")
        .populate("bookId", "title");

      res.status(200).json(reviews);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  getReviewsByUser: async (req, res) => {
    try {
      const userId = req.user.id;

      const reviews = await Review.find({ userId })
        .populate("bookId")
        .sort({ createdAt: -1 });

      res.status(200).json(reviews);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  createReview: async (req, res) => {
    try {
      const { bookId, rating, comment } = req.body;
      const userId = req.user.id;
      const review = new Review({ bookId, rating, comment, userId });
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
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getAverageRatingByBook: async (req, res) => {
    try {
      const { bookId } = req.params;

      const avg = await Review.aggregate([
        {
          $match: { bookId: new mongoose.Types.ObjectId(bookId) },
        },
        {
          $group: {
            _id: "$bookId",
            avgRating: { $avg: "$rating" },
            total: { $sum: 1 },
          },
        },
      ]);

      const average = avg[0]?.avgRating || 0;

      res.status(200).json({
        bookId,
        averageRating: parseFloat(average.toFixed(2)),
        totalReviews: avg[0]?.total || 0,
      });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = reviewsController;
