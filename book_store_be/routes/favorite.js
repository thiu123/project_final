const router = require("express").Router();
const middlewareController = require("../controllers/middlewareController");
const favoriteController = require("../controllers/favorite/favoriteController");

router.post(
  "/toggle",
  middlewareController.verifyToken,
  favoriteController.toggleFavorites
);
router.get(
  "/",
  middlewareController.verifyToken,
  favoriteController.getFavoritesForEachUser
);

module.exports = router;
