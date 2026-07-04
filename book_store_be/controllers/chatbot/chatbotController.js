const { GoogleGenerativeAI } = require("@google/generative-ai");
const Book = require("../../model/Book");
const bookSubjects = require("../../constants/bookSubjects");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const MAX_BOOKS = 20;
const MIN_API_DELAY = 2000; // minimum time between Gemini calls
const CACHE_TTL = 3600000; // how long a generated review stays cached (1 hour)
const CACHE_CLEANUP_INTERVAL = 600000; // how often we sweep expired reviews (10 min)

// ---------------------------------------------------------------------------
// Small utilities
// ---------------------------------------------------------------------------

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Escapes regex special characters so user/AI-derived text is safe in $regex
const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isQuotaError = (error) => {
  const message = error.message || "";
  return (
    message.includes("429") ||
    message.includes("quota") ||
    message.includes("Too Many Requests")
  );
};

// ---------------------------------------------------------------------------
// Gemini call helper — throttles requests and always returns plain text
// ---------------------------------------------------------------------------

let lastAPICall = 0;

const callGemini = async (prompt) => {
  if (Date.now() - lastAPICall < MIN_API_DELAY) {
    await sleep(MIN_API_DELAY);
  }
  lastAPICall = Date.now();

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
};

// ---------------------------------------------------------------------------
// Review cache — avoids re-generating (and re-billing) the same review
// ---------------------------------------------------------------------------

const reviewCache = new Map();

const getCachedReview = (bookId) => {
  const cached = reviewCache.get(bookId);
  if (!cached) return null;
  if (Date.now() - cached.timestamp < CACHE_TTL) return cached.review;
  reviewCache.delete(bookId); // expired, clean up now instead of waiting for the sweep
  return null;
};

const cacheReview = (bookId, review) => {
  reviewCache.set(bookId, { review, timestamp: Date.now() });
};

// Periodically purge expired entries so reviewCache doesn't grow forever
setInterval(() => {
  const now = Date.now();
  for (const [bookId, cached] of reviewCache.entries()) {
    if (now - cached.timestamp >= CACHE_TTL) reviewCache.delete(bookId);
  }
}, CACHE_CLEANUP_INTERVAL).unref();

// ---------------------------------------------------------------------------
// Fallbacks used only when the Gemini quota is exhausted
// ---------------------------------------------------------------------------

const generateFallbackReview = (book) => {
  const templates = [
    `"${book.title}" is a captivating read in the ${
      book.subjects[0]
    } genre. Many readers have found it engaging and thought-provoking. If you enjoy ${book.subjects.join(
      " and "
    )}, this book is definitely worth adding to your reading list!`,
    `This ${book.subjects[0]} title, "${
      book.title
    }", has been popular among our readers. It offers a unique perspective that fans of ${book.subjects.join(
      ", "
    )} will appreciate. A must-read for anyone interested in these genres!`,
    `"${book.title}" stands out in the ${
      book.subjects[0]
    } category. Readers who love ${book.subjects.join(
      " and "
    )} will find this book both entertaining and meaningful. Don't miss out on this gem!`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
};

const buildFallbackSuggestions = (books, isGenericQuery, count) =>
  books.slice(0, count).map((book) => ({
    title: book.title,
    subjects: book.subjects,
    reason: isGenericQuery
      ? `A highly-rated ${book.subjects[0]} book that's popular among readers. Worth checking out!`
      : `This ${book.subjects[0]} book aligns with your interests and has great reviews.`,
    bookId: book._id,
  }));

// ---------------------------------------------------------------------------
// Shared error responses
// ---------------------------------------------------------------------------

const sendQuotaExceeded = (res, message) =>
  res.status(429).json({ success: false, message, errorType: "quota_exceeded" });

// ---------------------------------------------------------------------------
// Genre detection — figures out whether the user asked for something specific
// ---------------------------------------------------------------------------

const ALL_GENRE_NAMES = bookSubjects.flatMap((subject) =>
  [subject.category, ...(subject.subcategories || [])].map((name) =>
    name.toLowerCase()
  )
);

const GENERIC_REQUEST_PATTERNS = [
  /best book/i,
  /good book/i,
  /recommend.*book/i,
  /suggest.*book/i,
  /what.*should.*read/i,
  /help.*find.*book/i,
  /any.*book/i,
  /what.*book/i,
  /popular book/i,
  /top book/i,
];

// e.g. "suggest best book for me" -> generic; "suggest a good manga" -> not generic
const isGenericRequest = (userInput) => {
  const lowerInput = userInput.toLowerCase();
  const matchesGenericPattern = GENERIC_REQUEST_PATTERNS.some((pattern) =>
    pattern.test(lowerInput)
  );
  const mentionsSpecificGenre = ALL_GENRE_NAMES.some((genre) =>
    lowerInput.includes(genre)
  );
  return matchesGenericPattern && !mentionsSpecificGenre;
};

// ---------------------------------------------------------------------------
// Book suggestions
// ---------------------------------------------------------------------------

const extractKeySubjects = async (userInput) => {
  const prompt = `Extract only the key book genres, subjects, or themes from this user request.
Return ONLY the relevant keywords separated by commas (maximum 5 keywords).
Do not include any extra words or explanations.
If the user request is too general (like "best book", "any book", "good book") without specific genre, return "general".

User request: "${userInput}"

Example:
Input: "I'm looking for some fantasy books with magic and adventure for my teenage son"
Output: fantasy, magic, adventure

Input: "Can you recommend sci-fi novels about space exploration?"
Output: science fiction, space, exploration

Input: "suggest best book for me"
Output: general

Input: "help me find a good book to read"
Output: general

Now extract keywords from the user request above:`;

  try {
    return await callGemini(prompt);
  } catch (error) {
    console.error("Error extracting keywords:", error);
    if (isQuotaError(error)) {
      console.warn("Gemini API quota exceeded, using fallback keyword extraction");
    }
    // Fallback: naive keyword extraction from the raw input
    return userInput
      .toLowerCase()
      .split(/[,;\s]+/)
      .filter((word) => word.length > 3)
      .slice(0, 5)
      .join(", ");
  }
};

// Finds the books to recommend for a user's request: either books matching
// their extracted keywords, or — for generic requests — the store's top-rated books.
const findBooksForRequest = async (userPreferences) => {
  const extractedKeywords = await extractKeySubjects(userPreferences);
  console.log("Extracted keywords:", extractedKeywords);

  const isGenericQuery =
    extractedKeywords.toLowerCase() === "general" ||
    isGenericRequest(userPreferences);

  if (isGenericQuery) {
    console.log("Generic request detected - showing top rated books");
    const books = await Book.find({}).sort({ rating: -1 }).limit(MAX_BOOKS);
    return { books, isGenericQuery, extractedKeywords };
  }

  const searchPattern = extractedKeywords
    .split(",")
    .map((keyword) => escapeRegex(keyword.trim()))
    .filter(Boolean)
    .join("|");

  const books = await Book.find({
    subjects: { $regex: searchPattern, $options: "i" },
  })
    .sort({ rating: -1 })
    .limit(MAX_BOOKS);

  return { books, isGenericQuery, extractedKeywords };
};

const formatBooksContext = (books) =>
  books
    .map(
      (book) =>
        `Title: "${book.title}"\nSubjects: ${book.subjects.join(
          ", "
        )}\nRating: ${book.rating || "N/A"}`
    )
    .join("\n\n");

const RECOMMENDATION_FORMAT = `Format your response EXACTLY like this:
1. [Book Title] - [Your natural recommendation]
2. [Book Title] - [Your natural recommendation]
3. [Book Title] - [Your natural recommendation]

Keep recommendations conversational and enthusiastic.`;

const buildSuggestionPrompt = (books, { isGenericQuery, extractedKeywords, userPreferences }) => {
  const booksContext = formatBooksContext(books);

  if (isGenericQuery) {
    return `A user is looking for book recommendations without specific preferences. They asked: "${userPreferences}"

Here are our top-rated books:
${booksContext}

Select the best 3-5 books from different genres to give them variety. For each book, write a natural, friendly recommendation (1-2 sentences) explaining why it's worth reading.

${RECOMMENDATION_FORMAT}`;
  }

  return `A user is looking for books about: ${extractedKeywords}

Here are the available books in our store:
${booksContext}

Select the best 3-5 books that match the user's interest. For each book, write a natural, friendly recommendation (1-2 sentences) explaining why it's a good match.

${RECOMMENDATION_FORMAT}`;
};

// Turns Gemini's "1. Title - reason" lines into { title, subjects, reason, bookId }
const parseSuggestionsFromText = (aiText, books) => {
  const suggestions = [];

  for (const line of aiText.split("\n")) {
    if (suggestions.length >= 5) break;

    // Match pattern: "1. Title - Reason" or "- Title - Reason"
    const match = line.match(/^[\d\-•]+\.?\s*(.+?)\s*[-–—]\s*(.+)$/);
    if (!match) continue;

    const titlePart = match[1].trim().replace(/["""]/g, "");
    const reason = match[2].trim();
    const book = books.find(
      (b) =>
        titlePart.toLowerCase().includes(b.title.toLowerCase()) ||
        b.title.toLowerCase().includes(titlePart.toLowerCase())
    );

    if (book) {
      suggestions.push({ title: book.title, subjects: book.subjects, reason, bookId: book._id });
    }
  }

  return suggestions;
};

const getSuggestionBooks = async (req, res) => {
  try {
    const { userPreferences } = req.body;

    if (!userPreferences || userPreferences.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Please provide your preferences.",
      });
    }

    const { books, isGenericQuery, extractedKeywords } = await findBooksForRequest(
      userPreferences
    );

    if (books.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          suggestions: [
            {
              title: "No books available",
              reason:
                "I couldn't find any books matching those preferences. Try different genres or themes.",
            },
          ],
        },
      });
    }

    const prompt = buildSuggestionPrompt(books, {
      isGenericQuery,
      extractedKeywords,
      userPreferences,
    });

    let suggestions;
    let note;
    try {
      const aiText = await callGemini(prompt);
      suggestions = parseSuggestionsFromText(aiText, books);
      if (suggestions.length === 0) {
        // AI replied but in an unexpected format — fall back to simple picks
        suggestions = buildFallbackSuggestions(books, isGenericQuery, 3);
      }
    } catch (apiError) {
      if (!isQuotaError(apiError)) throw apiError;
      console.warn("Gemini API quota exceeded. Using fallback suggestions.");
      suggestions = buildFallbackSuggestions(books, isGenericQuery, 5);
      note = "AI service temporarily unavailable, showing top recommendations";
    }

    res.status(200).json({
      success: true,
      data: { suggestions },
      ...(note && { note }),
    });
  } catch (error) {
    console.error("Error in suggestBooks:", error);

    if (isQuotaError(error)) {
      return sendQuotaExceeded(
        res,
        "Our AI service is currently experiencing high demand. Please try again in a few moments."
      );
    }

    res.status(500).json({
      success: false,
      message: "Error while suggesting books",
      error: error.message,
    });
  }
};

// ---------------------------------------------------------------------------
// Book review
// ---------------------------------------------------------------------------

const extractBookTitle = async (userInput) => {
  const prompt = `Extract ONLY the book title from this user request. Return just the book title, nothing else.

User request: "${userInput}"

Examples:
Input: "Can you review the book Harry Potter for me?"
Output: Harry Potter

Input: "I want to know about Naruto manga"
Output: Naruto

Input: "review The Lord of the Rings please"
Output: The Lord of the Rings

Input: "What do you think about 1984?"
Output: 1984

Now extract the book title from the user request above:`;

  try {
    const title = await callGemini(prompt);
    return title.replace(/["""]/g, "");
  } catch (error) {
    console.error("Error extracting book title:", error);
    if (isQuotaError(error)) {
      console.warn("Gemini API quota exceeded, using fallback title extraction");
    }
    // Fallback: strip common phrasing from the raw input
    return userInput
      .toLowerCase()
      .replace(/review|book|tell me about|what about|show me/gi, "")
      .trim();
  }
};

const findBookForReview = async (bookQuery) => {
  const extractedTitle = await extractBookTitle(bookQuery);
  console.log("Extracted book title:", extractedTitle);

  const pattern = escapeRegex(extractedTitle);
  const book = await Book.findOne({
    $or: [
      { title: { $regex: pattern, $options: "i" } },
      { subjects: { $regex: pattern, $options: "i" } },
    ],
  });

  return { book, extractedTitle };
};

const buildReviewPrompt = (book) => `Write a natural, enthusiastic book review for:

Title: "${book.title}"
Genres: ${book.subjects.join(", ")}

Write as if you're talking to a friend about this book. Include:
- What makes it special or interesting
- Who would enjoy it
- The overall vibe or feeling of the book

Keep it conversational, 3-5 sentences. Use "you" to address the reader.`;

const toBookInfo = (book) => ({
  id: book._id,
  title: book.title,
  subjects: book.subjects,
});

const generateSmartReview = async (req, res) => {
  try {
    const { bookQuery } = req.body;

    if (!bookQuery || bookQuery.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Please provide the book title or subject.",
      });
    }

    const { book, extractedTitle } = await findBookForReview(bookQuery);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: `I couldn't find a book called "${extractedTitle}" in our store. Could you try a different title?`,
      });
    }

    const cachedReview = getCachedReview(book._id.toString());
    if (cachedReview) {
      console.log("Returning cached review for:", book.title);
      return res.status(200).json({
        success: true,
        data: {
          bookFound: true,
          generatedReview: cachedReview,
          cached: true,
          bookInfo: toBookInfo(book),
        },
      });
    }

    let reviewText;
    let usedAI = true;
    try {
      reviewText =
        (await callGemini(buildReviewPrompt(book))) ||
        "This book is definitely worth checking out!";
    } catch (apiError) {
      if (!isQuotaError(apiError)) throw apiError;
      console.warn("Gemini API quota exceeded. Using fallback review generation.");
      reviewText = generateFallbackReview(book);
      usedAI = false;
    }

    cacheReview(book._id.toString(), reviewText);

    res.status(200).json({
      success: true,
      data: {
        bookFound: true,
        generatedReview: reviewText,
        usedAI,
        bookInfo: toBookInfo(book),
      },
    });
  } catch (error) {
    console.error("Error in generateReview:", error);

    if (isQuotaError(error)) {
      return sendQuotaExceeded(
        res,
        "Our AI service is currently experiencing high demand. Please try again in a few moments, or check back later."
      );
    }

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
