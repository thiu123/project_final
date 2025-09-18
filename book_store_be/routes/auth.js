const router = require("express").Router();
const authController = require("../controllers/authController");
const middlewareController = require("../controllers/middlewareController");
const passport = require("passport");

//Register
router.post("/register", authController.registerUser);
//Login
router.post("/login", authController.loginUser);

//Change Password
router.put(
  "/change-password",
  middlewareController.verifyToken,
  authController.changePassword
);

//Refresh Token
router.post("/refresh", authController.requestRefreshToken);

authController.googleAuth();
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  authController.googleCallback
);

module.exports = router;
