const express = require("express");
const router = express.Router();
const {
  getSuggestionBooks,
  generateSmartReview,
} = require("../controllers/chatbot/chatbotController");
const { verifyToken } = require("../controllers/middlewareController");

router.post("/suggestions", verifyToken, getSuggestionBooks);

router.post("/review/generate", verifyToken, generateSmartReview);

module.exports = router;
