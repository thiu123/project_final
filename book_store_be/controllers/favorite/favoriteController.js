const Favorite = require("../../model/Favorite");

const favoriteController = {
  toggleFavorites: async (req, res) => {
    try {
      const { bookId } = req.body;
      const userId = req.user.id;

      if (!bookId) {
        return res.status(400).json({ msg: "Book ID is required" });
      }

      const existingFavorite = await Favorite.findOne({ userId, bookId });

      if (existingFavorite) {
        await Favorite.findByIdAndDelete(existingFavorite._id);
      } else {
        const newFavorite = new Favorite({
          userId,
          bookId,
        });
        await newFavorite.save();
      }

      // Get updated favorites list for the user
      const userFavorites = await Favorite.find({ userId }).populate("bookId");
      return res.status(200).json(userFavorites);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getFavoritesForEachUser: async (req, res) => {
    try {
      const userId = req.user.id;
      const eachUserFavorites = await Favorite.find({ userId }).populate(
        "bookId"
      );
      return res.status(200).json(eachUserFavorites);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = favoriteController;
