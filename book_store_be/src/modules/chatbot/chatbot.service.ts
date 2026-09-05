import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { HttpException, HttpStatus, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BOOK_SUBJECTS } from '../../constants/book-subjects';
import { Book, BookDocument } from '../books/schemas/book.schema';

const MAX_BOOKS = 20;
const MIN_API_DELAY_MS = 2000; // minimum time between Gemini calls
const REVIEW_CACHE_TTL_MS = 3_600_000; // generated reviews stay cached 1 hour
const CACHE_CLEANUP_INTERVAL_MS = 600_000; // sweep expired reviews every 10 min

export interface Suggestion {
  title: string;
  subjects?: string[];
  reason: string;
  bookId?: Types.ObjectId;
}

interface BookSearch {
  books: BookDocument[];
  isGenericQuery: boolean;
  extractedKeywords: string;
}

const ALL_GENRE_NAMES = BOOK_SUBJECTS.flatMap((subject) =>
  [subject.category, ...(subject.subcategories || [])].map((name) => name.toLowerCase()),
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

const RECOMMENDATION_FORMAT = `Format your response EXACTLY like this:
1. [Book Title] - [Your natural recommendation]
2. [Book Title] - [Your natural recommendation]
3. [Book Title] - [Your natural recommendation]

Keep recommendations conversational and enthusiastic.`;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Escapes regex special characters so user/AI-derived text is safe inside $regex. */
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isQuotaError = (error: unknown): boolean => {
  const message = (error as Error)?.message || '';
  return (
    message.includes('429') || message.includes('quota') || message.includes('Too Many Requests')
  );
};

@Injectable()
export class ChatbotService implements OnModuleDestroy {
  private readonly logger = new Logger(ChatbotService.name);
  private readonly model: GenerativeModel;

  private lastApiCall = 0;
  private readonly reviewCache = new Map<string, { review: string; timestamp: number }>();
  private readonly cleanupTimer: NodeJS.Timeout;

  constructor(
    @InjectModel(Book.name) private readonly bookModel: Model<BookDocument>,
    configService: ConfigService,
  ) {
    const genAI = new GoogleGenerativeAI(configService.get<string>('GEMINI_KEY') ?? '');
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Periodically purge expired entries so the review cache doesn't grow forever
    this.cleanupTimer = setInterval(() => this.sweepReviewCache(), CACHE_CLEANUP_INTERVAL_MS);
    this.cleanupTimer.unref();
  }

  onModuleDestroy(): void {
    clearInterval(this.cleanupTimer);
  }

  // ---------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------

  async suggestBooks(userPreferences?: string) {
    if (!userPreferences || userPreferences.trim() === '') {
      throw new HttpException(
        { success: false, message: 'Please provide your preferences.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const search = await this.findBooksForRequest(userPreferences);

      if (search.books.length === 0) {
        return {
          success: true,
          data: {
            suggestions: [
              {
                title: 'No books available',
                reason:
                  "I couldn't find any books matching those preferences. Try different genres or themes.",
              },
            ],
          },
        };
      }

      const prompt = this.buildSuggestionPrompt(search, userPreferences);

      let suggestions: Suggestion[];
      let note: string | undefined;
      try {
        const aiText = await this.callGemini(prompt);
        suggestions = this.parseSuggestionsFromText(aiText, search.books);
        if (suggestions.length === 0) {
          // AI replied but in an unexpected format: fall back to simple picks
          suggestions = this.buildFallbackSuggestions(search.books, search.isGenericQuery, 3);
        }
      } catch (apiError) {
        if (!isQuotaError(apiError)) throw apiError;
        this.logger.warn('Gemini API quota exceeded. Using fallback suggestions.');
        suggestions = this.buildFallbackSuggestions(search.books, search.isGenericQuery, 5);
        note = 'AI service temporarily unavailable, showing top recommendations';
      }

      return {
        success: true,
        data: { suggestions },
        ...(note && { note }),
      };
    } catch (error) {
      throw this.toHttpError(error, 'Error while suggesting books', 'Please try again in a few moments.');
    }
  }

  async generateSmartReview(bookQuery?: string) {
    if (!bookQuery || bookQuery.trim() === '') {
      throw new HttpException(
        { success: false, message: 'Please provide the book title or subject.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const { book, extractedTitle } = await this.findBookForReview(bookQuery);

      if (!book) {
        throw new HttpException(
          {
            success: false,
            message: `I couldn't find a book called "${extractedTitle}" in our store. Could you try a different title?`,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const bookId = book._id.toString();
      const cachedReview = this.getCachedReview(bookId);
      if (cachedReview) {
        this.logger.log(`Returning cached review for: ${book.title}`);
        return {
          success: true,
          data: {
            bookFound: true,
            generatedReview: cachedReview,
            cached: true,
            bookInfo: this.toBookInfo(book),
          },
        };
      }

      let reviewText: string;
      let usedAI = true;
      try {
        reviewText =
          (await this.callGemini(this.buildReviewPrompt(book))) ||
          'This book is definitely worth checking out!';
      } catch (apiError) {
        if (!isQuotaError(apiError)) throw apiError;
        this.logger.warn('Gemini API quota exceeded. Using fallback review generation.');
        reviewText = this.generateFallbackReview(book);
        usedAI = false;
      }

      this.reviewCache.set(bookId, { review: reviewText, timestamp: Date.now() });

      return {
        success: true,
        data: {
          bookFound: true,
          generatedReview: reviewText,
          usedAI,
          bookInfo: this.toBookInfo(book),
        },
      };
    } catch (error) {
      throw this.toHttpError(
        error,
        'Error while generating review',
        'Please try again in a few moments, or check back later.',
      );
    }
  }

  // ---------------------------------------------------------------------
  // Gemini helper: throttles requests and always returns plain text
  // ---------------------------------------------------------------------

  private async callGemini(prompt: string): Promise<string> {
    if (Date.now() - this.lastApiCall < MIN_API_DELAY_MS) {
      await sleep(MIN_API_DELAY_MS);
    }
    this.lastApiCall = Date.now();

    const result = await this.model.generateContent(prompt);
    return result.response.text().trim();
  }

  // ---------------------------------------------------------------------
  // Suggestions
  // ---------------------------------------------------------------------

  /** e.g. "suggest best book for me" is generic; "suggest a good manga" is not. */
  private isGenericRequest(userInput: string): boolean {
    const lowerInput = userInput.toLowerCase();
    const matchesGenericPattern = GENERIC_REQUEST_PATTERNS.some((pattern) =>
      pattern.test(lowerInput),
    );
    const mentionsSpecificGenre = ALL_GENRE_NAMES.some((genre) => lowerInput.includes(genre));
    return matchesGenericPattern && !mentionsSpecificGenre;
  }

  private async extractKeySubjects(userInput: string): Promise<string> {
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
      return await this.callGemini(prompt);
    } catch (error) {
      this.logger.error(`Error extracting keywords: ${(error as Error).message}`);
      if (isQuotaError(error)) {
        this.logger.warn('Gemini API quota exceeded, using fallback keyword extraction');
      }
      // Fallback: naive keyword extraction from the raw input
      return userInput
        .toLowerCase()
        .split(/[,;\s]+/)
        .filter((word) => word.length > 3)
        .slice(0, 5)
        .join(', ');
    }
  }

  /**
   * Finds the books to recommend: either books matching the extracted
   * keywords, or (for generic requests) the store's top-rated books.
   */
  private async findBooksForRequest(userPreferences: string): Promise<BookSearch> {
    const extractedKeywords = await this.extractKeySubjects(userPreferences);
    this.logger.log(`Extracted keywords: ${extractedKeywords}`);

    const isGenericQuery =
      extractedKeywords.toLowerCase() === 'general' || this.isGenericRequest(userPreferences);

    if (isGenericQuery) {
      this.logger.log('Generic request detected - showing top rated books');
      const books = await this.bookModel.find({}).sort({ rating: -1 }).limit(MAX_BOOKS);
      return { books, isGenericQuery, extractedKeywords };
    }

    const searchPattern = extractedKeywords
      .split(',')
      .map((keyword) => escapeRegex(keyword.trim()))
      .filter(Boolean)
      .join('|');

    const books = await this.bookModel
      .find({ subjects: { $regex: searchPattern, $options: 'i' } })
      .sort({ rating: -1 })
      .limit(MAX_BOOKS);

    return { books, isGenericQuery, extractedKeywords };
  }

  private formatBooksContext(books: BookDocument[]): string {
    return books
      .map(
        (book) =>
          `Title: "${book.title}"\nSubjects: ${book.subjects.join(', ')}\nRating: ${
            book.rating || 'N/A'
          }`,
      )
      .join('\n\n');
  }

  private buildSuggestionPrompt(
    { books, isGenericQuery, extractedKeywords }: BookSearch,
    userPreferences: string,
  ): string {
    const booksContext = this.formatBooksContext(books);

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
  }

  /** Turns Gemini's "1. Title - reason" lines into structured suggestions. */
  private parseSuggestionsFromText(aiText: string, books: BookDocument[]): Suggestion[] {
    const suggestions: Suggestion[] = [];

    for (const line of aiText.split('\n')) {
      if (suggestions.length >= 5) break;

      // Match pattern: "1. Title - Reason" or "- Title - Reason"
      const match = line.match(/^[\d\-•]+\.?\s*(.+?)\s*[-–—]\s*(.+)$/);
      if (!match) continue;

      const titlePart = match[1].trim().replace(/["“”]/g, '');
      const reason = match[2].trim();
      const book = books.find(
        (b) =>
          titlePart.toLowerCase().includes(b.title.toLowerCase()) ||
          b.title.toLowerCase().includes(titlePart.toLowerCase()),
      );

      if (book) {
        suggestions.push({ title: book.title, subjects: book.subjects, reason, bookId: book._id });
      }
    }

    return suggestions;
  }

  private buildFallbackSuggestions(
    books: BookDocument[],
    isGenericQuery: boolean,
    count: number,
  ): Suggestion[] {
    return books.slice(0, count).map((book) => ({
      title: book.title,
      subjects: book.subjects,
      reason: isGenericQuery
        ? `A highly-rated ${book.subjects[0]} book that's popular among readers. Worth checking out!`
        : `This ${book.subjects[0]} book aligns with your interests and has great reviews.`,
      bookId: book._id,
    }));
  }

  // ---------------------------------------------------------------------
  // Reviews
  // ---------------------------------------------------------------------

  private async extractBookTitle(userInput: string): Promise<string> {
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
      const title = await this.callGemini(prompt);
      return title.replace(/["“”]/g, '');
    } catch (error) {
      this.logger.error(`Error extracting book title: ${(error as Error).message}`);
      if (isQuotaError(error)) {
        this.logger.warn('Gemini API quota exceeded, using fallback title extraction');
      }
      // Fallback: strip common phrasing from the raw input
      return userInput
        .toLowerCase()
        .replace(/review|book|tell me about|what about|show me/gi, '')
        .trim();
    }
  }

  private async findBookForReview(bookQuery: string) {
    const extractedTitle = await this.extractBookTitle(bookQuery);
    this.logger.log(`Extracted book title: ${extractedTitle}`);

    const pattern = escapeRegex(extractedTitle);
    const book = await this.bookModel.findOne({
      $or: [
        { title: { $regex: pattern, $options: 'i' } },
        { subjects: { $regex: pattern, $options: 'i' } },
      ],
    });

    return { book, extractedTitle };
  }

  private buildReviewPrompt(book: BookDocument): string {
    return `Write a natural, enthusiastic book review for:

Title: "${book.title}"
Genres: ${book.subjects.join(', ')}

Write as if you're talking to a friend about this book. Include:
- What makes it special or interesting
- Who would enjoy it
- The overall vibe or feeling of the book

Keep it conversational, 3-5 sentences. Use "you" to address the reader.`;
  }

  /** Used only when the Gemini quota is exhausted. */
  private generateFallbackReview(book: BookDocument): string {
    const genre = book.subjects[0];
    const templates = [
      `"${book.title}" is a captivating read in the ${genre} genre. Many readers have found it engaging and thought-provoking. If you enjoy ${book.subjects.join(
        ' and ',
      )}, this book is definitely worth adding to your reading list!`,
      `This ${genre} title, "${book.title}", has been popular among our readers. It offers a unique perspective that fans of ${book.subjects.join(
        ', ',
      )} will appreciate. A must-read for anyone interested in these genres!`,
      `"${book.title}" stands out in the ${genre} category. Readers who love ${book.subjects.join(
        ' and ',
      )} will find this book both entertaining and meaningful. Don't miss out on this gem!`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private toBookInfo(book: BookDocument) {
    return { id: book._id, title: book.title, subjects: book.subjects };
  }

  // ---------------------------------------------------------------------
  // Review cache: avoids re-generating (and re-billing) the same review
  // ---------------------------------------------------------------------

  private getCachedReview(bookId: string): string | null {
    const cached = this.reviewCache.get(bookId);
    if (!cached) return null;
    if (Date.now() - cached.timestamp < REVIEW_CACHE_TTL_MS) return cached.review;
    this.reviewCache.delete(bookId);
    return null;
  }

  private sweepReviewCache(): void {
    const now = Date.now();
    for (const [bookId, cached] of this.reviewCache.entries()) {
      if (now - cached.timestamp >= REVIEW_CACHE_TTL_MS) this.reviewCache.delete(bookId);
    }
  }

  // ---------------------------------------------------------------------
  // Errors
  // ---------------------------------------------------------------------

  private toHttpError(error: unknown, fallbackMessage: string, quotaHint: string): HttpException {
    if (error instanceof HttpException) return error;

    this.logger.error(`${fallbackMessage}: ${(error as Error).message}`);

    if (isQuotaError(error)) {
      return new HttpException(
        {
          success: false,
          message: `Our AI service is currently experiencing high demand. ${quotaHint}`,
          errorType: 'quota_exceeded',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return new HttpException(
      { success: false, message: fallbackMessage, error: (error as Error).message },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
