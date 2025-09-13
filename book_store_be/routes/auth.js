const router = require("express").Router();
const authController = require("../controllers/authController");
const middlewareController = require("../controllers/middlewareController");

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

module.exports = router;
