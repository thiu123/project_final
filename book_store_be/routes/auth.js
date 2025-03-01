const router = require("express").Router();
const authController = require("../controllers/authController");

//Register
router.post("/register", authController.registerUser);
//Login
router.post("/login", authController.loginUser);

//Refresh Token
router.post("/refresh", authController.requestRefreshToken);

module.exports = router;