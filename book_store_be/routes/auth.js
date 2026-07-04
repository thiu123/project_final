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

// Forgot Password - Generate reset token
router.post("/forgot-password", authController.forgotPassword);

// Reset Password with token
router.post("/reset-password", authController.resetPassword);

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
