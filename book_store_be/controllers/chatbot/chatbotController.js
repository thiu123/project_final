const { GoogleGenerativeAI } = require("@google/generative-ai");
const Book = require("../../model/Book");

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI("AIzaSyCa39PwllE3HtLncHvq69YasJhqIJC5mfs");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Controller for smart book suggestions
const getSuggestionBooks = async (req, res) => {
  try {
    const { userPreferences } = req.body;

    // Get all books from database
    const allBooks = await Book.find();

    if (allBooks.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          suggestions: [
            {
              title: "No books available",
              reason: "The store currently has no books.",
            },
          ],
        },
      });
    }

    // Build context with book info
    const booksContext = allBooks
      .map(
        (book) =>
          `- "${book.title}" by ${book.authors || "Unknown"} (${
            book.subjects || "No subject"
          })`
      )
      .join("\n");

    const prompt = `Based on the request: "${userPreferences}"

Available books:
${booksContext}

Please suggest 3–5 books that best match. Answer in simple English.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Fallback: random books if AI fails
    const randomBooks = allBooks.sort(() => 0.5 - Math.random()).slice(0, 3);

    res.status(200).json({
      success: true,
      data: {
        suggestions: randomBooks.map((book) => ({
          title: book.title,
          authors: book.authors,
          subjects: book.subjects,
          reason: text || `Suggested book: ${book.title}`,
          bookId: book._id,
        })),
      },
    });
  } catch (error) {
    console.error("Error in getSuggestionBooks:", error);
    res.status(500).json({
      success: false,
      message: "Error while suggesting books",
      error: error.message,
    });
  }
};

// Controller for smart book review
const generateSmartReview = async (req, res) => {
  try {
    const { bookQuery } = req.body;

    // Search book in DB
    const book = await Book.findOne({
      $or: [
        { title: { $regex: bookQuery, $options: "i" } },
        { authors: { $regex: bookQuery, $options: "i" } },
      ],
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book "${bookQuery}" was not found in the store.`,
      });
    }

    const prompt = `Please review the book "${book.title}" by ${book.authors}.
Genre: ${book.subjects}
Description: ${book.description || "No description"}

Write a short review in English (3–5 sentences).`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const reviewText = response.text();

    res.status(200).json({
      success: true,
      data: {
        bookFound: true,
        generatedReview: reviewText,
        bookInfo: {
          id: book._id,
          title: book.title,
          authors: book.authors,
          subjects: book.subjects,
        },
      },
    });
  } catch (error) {
    console.error("Error in generateSmartReview:", error);
    res.status(500).json({
      success: false,
      message: "Error while generating review",
      error: error.message,
    });
  }
};

// Controller for general book chat
const chatAboutBooks = async (req, res) => {
  try {
    const { message } = req.body;

    // Get some books for context
    const allBooks = await Book.find().limit(10);
    const booksContext = allBooks
      .map((book) => `- ${book.title} (${book.authors})`)
      .join("\n");

    const prompt = `User asks: "${message}"

Books available in the store:
${booksContext}

Answer the question in English, briefly and helpfully.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const replyText = response.text();

    res.status(200).json({
      success: true,
      data: {
        reply: replyText,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Error in chatAboutBooks:", error);
    res.status(500).json({
      success: false,
      message: "Error during chat",
      error: error.message,
    });
  }
};

module.exports = {
  getSuggestionBooks,
  generateSmartReview,
  chatAboutBooks,
};
