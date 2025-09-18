// controllers/bookAIController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Book = require("../../model/Book");

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI("AIzaSyCa39PwllE3HtLncHvq69YasJhqIJC5mfs");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Config limits
const MAX_BOOKS = 20;
const MAX_KEYWORDS = 5;

/**
 * Controller: Suggest books based on user preference
 */
const getSuggestionBooks = async (req, res) => {
  try {
    let { userPreferences } = req.body;

    if (!userPreferences || userPreferences.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Please provide your preferences.",
      });
    }

    // Limit number of keywords
    const keywords = userPreferences
      .split(",")
      .map((kw) => kw.trim())
      .slice(0, MAX_KEYWORDS);
    userPreferences = keywords.join(",");

    // Filter DB: top MAX_BOOKS by rating or matching subjects
    const allBooks = await Book.find({
      subjects: { $regex: userPreferences, $options: "i" },
    })
      .sort({ rating: -1 })
      .limit(MAX_BOOKS);

    if (allBooks.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          suggestions: [
            {
              title: "No books available",
              reason: "No books match your preferences.",
            },
          ],
        },
      });
    }

    // Build book context for AI
    const booksContext = allBooks
      .map(
        (book) =>
          `- Title: ${book.title}\n  Subjects: ${book.subjects.join(", ")}`
      )
      .join("\n");

    const prompt = `User preferences: "${userPreferences}"

Available books:
${booksContext}

Suggest 3–5 books that best match the user's preferences. 
Answer in English briefly and provide a short reason for each suggestion.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const suggestionText = response.text();

    // Map AI response to books (fallback: top 3)
    const suggestions = allBooks.slice(0, 5).map((book, index) => ({
      title: book.title,
      subjects: book.subjects,
      reason: suggestionText
        ? suggestionText.split("\n")[index] || "Suggested book"
        : `Suggested book: ${book.title}`,
      bookId: book._id,
    }));

    res.status(200).json({
      success: true,
      data: { suggestions },
    });
  } catch (error) {
    console.error("Error in suggestBooks:", error);
    res.status(500).json({
      success: false,
      message: "Error while suggesting books",
      error: error.message,
    });
  }
};

/**
 * Controller: Generate a short AI review for 1 book
 */
const generateSmartReview = async (req, res) => {
  try {
    const { bookQuery } = req.body;

    if (!bookQuery || bookQuery.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Please provide the book title or subject.",
      });
    }

    const book = await Book.findOne({
      $or: [
        { title: { $regex: bookQuery, $options: "i" } },
        { subjects: { $regex: bookQuery, $options: "i" } },
      ],
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Sorry, we couldn’t find the book "${bookQuery}" in our store.`,
      });
    }

    const prompt = `Write a short review (3–5 sentences) for the book:
Title: "${book.title}"
Subjects: ${book.subjects.join(", ")}

Write the review in simple English, as if recommending it to a reader.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const reviewText = response.text() || "This book is worth reading.";

    res.status(200).json({
      success: true,
      data: {
        bookFound: true,
        generatedReview: reviewText,
        bookInfo: {
          id: book._id,
          title: book.title,
          subjects: book.subjects,
        },
      },
    });
  } catch (error) {
    console.error("Error in generateReview:", error);
    res.status(500).json({
      success: false,
      message: "Error while generating review",
      error: error.message,
    });
  }
};

module.exports = {
  getSuggestionBooks,
  generateSmartReview,
};
