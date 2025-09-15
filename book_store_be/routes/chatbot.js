const express = require("express");
const router = express.Router();
const {
  getSuggestionBooks,
  generateSmartReview,
  chatAboutBooks,
} = require("../controllers/chatbot/chatbotController");
const { verifyToken } = require("../controllers/middlewareController");


router.post("/suggestions", getSuggestionBooks);


router.post("/review/generate", verifyToken, generateSmartReview);

router.post("/chat", chatAboutBooks);

module.exports = router;
