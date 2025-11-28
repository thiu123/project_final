const { GoogleGenerativeAI } = require("@google/generative-ai");
const Book = require("../../model/Book");

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Config limits
const MAX_BOOKS = 20;

/**
 * Helper: Check if user request is generic (no specific genre/preference)
 */
const isGenericRequest = (userInput) => {
  const lowerInput = userInput.toLowerCase();

  // Patterns that indicate generic requests
  const genericPatterns = [
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

  // Check if request matches generic patterns
  const isGeneric = genericPatterns.some((pattern) => pattern.test(lowerInput));

  // Check if there are NO specific genres mentioned
  const hasSpecificGenre =
    /fantasy|sci-?fi|science fiction|romance|thriller|mystery|horror|adventure|manga|comic|programming|history|biography|drama|comedy/i.test(
      lowerInput
    );

  return isGeneric && !hasSpecificGenre;
};

/**
 * Helper: Extract key subjects/genres from user's long prompt
 */
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
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const keywords = response.text().trim();
    return keywords;
  } catch (error) {
    console.error("Error extracting keywords:", error);
    // Fallback: simple keyword extraction
    return userInput
      .toLowerCase()
      .split(/[,;\s]+/)
      .filter((word) => word.length > 3)
      .slice(0, 5)
      .join(", ");
  }
};

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

    // Step 1: Extract key subjects from long user input
    const extractedKeywords = await extractKeySubjects(userPreferences);
    console.log("Extracted keywords:", extractedKeywords);

    let allBooks;
    let isGenericQuery = false;

    // Step 2: Check if it's a generic request or specific genre request
    if (
      extractedKeywords.toLowerCase() === "general" ||
      isGenericRequest(userPreferences)
    ) {
      console.log("Generic request detected - showing top rated books");
      isGenericQuery = true;

      // Get top-rated books from all genres
      allBooks = await Book.find({}).sort({ rating: -1 }).limit(MAX_BOOKS);
    } else {
      // Search books matching specific keywords
      const keywordArray = extractedKeywords.split(",").map((k) => k.trim());
      const searchPattern = keywordArray.join("|");

      allBooks = await Book.find({
        subjects: { $regex: searchPattern, $options: "i" },
      })
        .sort({ rating: -1 })
        .limit(MAX_BOOKS);
    }

    if (allBooks.length === 0) {
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

    // Step 3: Let AI select and explain top 3-5 books naturally
    const booksContext = allBooks
      .map(
        (book) =>
          `Title: "${book.title}"\nSubjects: ${book.subjects.join(
            ", "
          )}\nRating: ${book.rating || "N/A"}`
      )
      .join("\n\n");

    let prompt;
    if (isGenericQuery) {
      prompt = `A user is looking for book recommendations without specific preferences. They asked: "${userPreferences}"

Here are our top-rated books:
${booksContext}

Select the best 3-5 books from different genres to give them variety. For each book, write a natural, friendly recommendation (1-2 sentences) explaining why it's worth reading.

Format your response EXACTLY like this:
1. [Book Title] - [Your natural recommendation]
2. [Book Title] - [Your natural recommendation]
3. [Book Title] - [Your natural recommendation]

Keep recommendations conversational and enthusiastic.`;
    } else {
      prompt = `A user is looking for books about: ${extractedKeywords}

Here are the available books in our store:
${booksContext}

Select the best 3-5 books that match the user's interest. For each book, write a natural, friendly recommendation (1-2 sentences) explaining why it's a good match.

Format your response EXACTLY like this:
1. [Book Title] - [Your natural recommendation]
2. [Book Title] - [Your natural recommendation]
3. [Book Title] - [Your natural recommendation]

Keep recommendations conversational and enthusiastic.`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();

    // Step 4: Parse AI response and match with actual books
    const suggestions = [];
    const lines = aiText.split("\n").filter((line) => line.trim());

    for (const line of lines) {
      // Match pattern: "1. Title - Reason" or "- Title - Reason"
      const match = line.match(/^[\d\-•]+\.?\s*(.+?)\s*[-–—]\s*(.+)$/);
      if (match) {
        const titlePart = match[1].trim().replace(/["""]/g, "");
        const reason = match[2].trim();

        // Find matching book
        const book = allBooks.find(
          (b) =>
            titlePart.toLowerCase().includes(b.title.toLowerCase()) ||
            b.title.toLowerCase().includes(titlePart.toLowerCase())
        );

        if (book && suggestions.length < 5) {
          suggestions.push({
            title: book.title,
            subjects: book.subjects,
            reason: reason,
            bookId: book._id,
          });
        }
      }
    }

    // Fallback if parsing fails
    if (suggestions.length === 0) {
      suggestions.push(
        ...allBooks.slice(0, 3).map((book) => ({
          title: book.title,
          subjects: book.subjects,
          reason: isGenericQuery
            ? `Highly rated ${book.subjects[0]} book that readers love!`
            : `This ${book.subjects[0]} book matches your interests perfectly!`,
          bookId: book._id,
        }))
      );
    }

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
 * Helper: Extract book title from user's review request
 */
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
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const title = response.text().trim().replace(/["""]/g, "");
    return title;
  } catch (error) {
    console.error("Error extracting book title:", error);
    // Fallback: remove common words
    return userInput
      .toLowerCase()
      .replace(/review|book|tell me about|what about|show me/gi, "")
      .trim();
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

    const extractedTitle = await extractBookTitle(bookQuery);
    console.log("Extracted book title:", extractedTitle);

    const book = await Book.findOne({
      $or: [
        { title: { $regex: extractedTitle, $options: "i" } },
        { subjects: { $regex: extractedTitle, $options: "i" } },
      ],
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: `I couldn't find a book called "${extractedTitle}" in our store. Could you try a different title?`,
      });
    }

    const prompt = `Write a natural, enthusiastic book review for:

Title: "${book.title}"
Genres: ${book.subjects.join(", ")}

Write as if you're talking to a friend about this book. Include:
- What makes it special or interesting
- Who would enjoy it
- The overall vibe or feeling of the book

Keep it conversational, 3-5 sentences. Use "you" to address the reader.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const reviewText =
      response.text().trim() || "This book is definitely worth checking out!";

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
