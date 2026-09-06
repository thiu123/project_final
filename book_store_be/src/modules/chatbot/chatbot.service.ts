import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { RateLimitService } from '../../common/services/rate-limit.service';
import { RedisService } from '../../config/redis/redis.service';
import { BooksService } from '../books/books.service';
import { LeanBook } from '../books/books.types';
import { BookSort, QueryBooksDto } from '../books/dto/query-books.dto';
import { ChatHistoryService, SessionBook } from './chat-history.service';
import { CHATBOT_TOOLS, ChatbotToolsService } from './chatbot.tools';
import {
  GeminiBusyError,
  GeminiQuotaError,
  GeminiService,
} from './gemini.service';

/** Messages allowed per user per window. Gemini's free tier is shared by everyone. */
const RATE_LIMIT = 15;
const RATE_LIMIT_WINDOW_SECONDS = 60;

const REVIEW_CACHE_PREFIX = 'chatbot:review:';
const REVIEW_CACHE_TTL_SECONDS = 3600;

/** The languages the storefront serves; part of the review cache key. */
type ReviewLanguage = 'vi' | 'en';

/**
 * Filler stripped from "review Harry Potter" before searching the catalogue.
 *
 * Split in two because `\b` in JavaScript is ASCII-only: anchoring "đánh giá"
 * with it never matches, since `đ` is not a word character and a boundary
 * therefore cannot exist before it.
 */
const REVIEW_FILLER_ASCII =
  /\b(reviews?|books?|please|about|tell me|what do you think of|show me|give me|for me)\b/gi;
const REVIEW_FILLER_VI =
  /(đánh giá|nhận xét|giới thiệu|cho tôi|giúp tôi|của tôi|cuốn|quyển|sách|về)/gi;

const SYSTEM_INSTRUCTION = `You are the AI book advisor for an online bookstore that sells both print books and ebooks.

Rules:
- Only ever recommend books returned by the tools. Never invent a title, author or price; if the catalogue has nothing suitable, say so plainly.
- Call search_books whenever the user asks about books, genres, prices or availability. Call list_categories when you need to know what the store carries.
- Do not call a tool when the conversation above already contains the answer. Follow-ups about books you just listed ("which is cheapest?", "tell me more about the second one") must be answered from that earlier result.
- Always answer in the same language the user wrote in.
- Be warm and concise: two or three sentences of framing, then the books. Mention each book by its exact title so it can be linked.
- Prices are in the store's own currency; quote the number the tool gave you and nothing else.`;

/**
 * Reviews are written in a single call with no tools attached, so they need
 * their own instruction: the tool rules above told the model it may only speak
 * about books a tool returned, and with no tools available it answered with
 * nothing at all.
 */
const REVIEW_INSTRUCTION = `You are the AI book advisor for an online bookstore.
Write about the book you are given as if recommending it to a friend.
Never mention that you are an AI, and write in the language the prompt asks for.`;

const SUGGESTION_INSTRUCTION = `${SYSTEM_INSTRUCTION}
- The user wants recommendations. Return between three and five books, each with one short sentence on why it fits.`;

export interface Suggestion {
  title: string;
  subjects?: string[];
  reason: string;
  bookId?: string;
}

/** A book the reply actually names, resolved back to a real catalogue row. */
export interface ReferencedBook {
  bookId: string;
  title: string;
  subjects: string[];
  price: number;
  rating: number | null;
  inStock: boolean;
}

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(
    private readonly gemini: GeminiService,
    private readonly tools: ChatbotToolsService,
    private readonly history: ChatHistoryService,
    private readonly rateLimit: RateLimitService,
    private readonly booksService: BooksService,
    private readonly redis: RedisService,
  ) {}

  // ---------------------------------------------------------------------
  // Chat
  // ---------------------------------------------------------------------

  /**
   * One conversational turn with memory and catalogue access.
   *
   * Costs a single Gemini call when the model can answer from the running
   * history ("which of those is cheapest?", "thanks") and two when it needs a
   * catalogue lookup.
   */
  async chat(userId: string, message: string) {
    const text = this.requireText(message, 'Please type a message.');
    await this.enforceRateLimit(userId);

    try {
      const session = await this.history.get(userId);

      // Seeded with the books already shown this conversation, so a follow-up
      // the model answers from context still resolves to linkable rows.
      const seen = new Map<string, SessionBook>(
        session.books.map((book) => [book.title.toLowerCase(), book]),
      );

      const turn = await this.gemini.runTurn({
        history: session.contents,
        message: text,
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: CHATBOT_TOOLS,
        executor: async (call) => {
          const result = await this.tools.execute(call);
          this.collectBooks(result, seen);
          return result;
        },
      });

      const reply =
        turn.text || "I'm not sure how to answer that — could you rephrase?";
      await this.history.append(userId, text, reply, [...seen.values()]);

      this.logger.log(
        `chat(${userId}): ${turn.llmCalls} Gemini call(s), ${turn.toolCalls.length} tool call(s)`,
      );

      return {
        success: true,
        data: { reply, books: this.resolveReferenced(reply, seen) },
      };
    } catch (error) {
      throw this.toHttpError(error, 'Error while answering your message');
    }
  }

  async clearHistory(userId: string) {
    await this.history.clear(userId);
    return { success: true };
  }

  // ---------------------------------------------------------------------
  // Suggestions
  // ---------------------------------------------------------------------

  /**
   * Recommendation-shaped wrapper over the same pipeline. Unlike the previous
   * version it never regex-parses the model's prose into structured data: the
   * books come from the tool results, and only the wording comes from Gemini.
   */
  async suggestBooks(userId: string, userPreferences: string) {
    const text = this.requireText(
      userPreferences,
      'Please provide your preferences.',
    );
    await this.enforceRateLimit(userId);

    try {
      const seen = new Map<string, SessionBook>();

      const turn = await this.gemini.runTurn({
        history: [],
        message: text,
        systemInstruction: SUGGESTION_INSTRUCTION,
        tools: CHATBOT_TOOLS,
        executor: async (call) => {
          const result = await this.tools.execute(call);
          this.collectBooks(result, seen);
          return result;
        },
      });

      const referenced = this.resolveReferenced(turn.text, seen);
      const suggestions: Suggestion[] = referenced.length
        ? referenced.map((book) => ({
            title: book.title,
            subjects: book.subjects,
            reason: this.reasonFor(turn.text, book.title),
            bookId: book.bookId,
          }))
        : await this.fallbackSuggestions();

      return { success: true, data: { reply: turn.text, suggestions } };
    } catch (error) {
      throw this.toHttpError(error, 'Error while suggesting books');
    }
  }

  /** Top-rated books, used when Gemini is unavailable or named nothing we stock. */
  private async fallbackSuggestions(): Promise<Suggestion[]> {
    const query = new QueryBooksDto();
    query.page = 1;
    query.limit = 5;
    query.sort = BookSort.Rating;

    const { items } = await this.booksService.findAll(query);
    return items.map((book) => ({
      title: book.title,
      subjects: book.subjects ?? [],
      reason: 'One of the highest-rated books in our store right now.',
      bookId: String(book._id),
    }));
  }

  // ---------------------------------------------------------------------
  // Reviews
  // ---------------------------------------------------------------------

  /**
   * Costs one Gemini call, down from two: the title is now pulled out locally
   * and matched with the indexed catalogue search rather than by asking the
   * model to extract it.
   */
  async generateSmartReview(userId: string, bookQuery: string) {
    const text = this.requireText(
      bookQuery,
      'Please provide the book title or subject.',
    );

    const book = await this.findBookForReview(text);
    if (!book) {
      throw new HttpException(
        {
          success: false,
          message: `I couldn't find that book in our store. Could you try a different title?`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const bookId = String(book._id);
    const bookInfo = {
      id: bookId,
      title: book.title,
      subjects: book.subjects ?? [],
    };

    const language = this.detectLanguage(text);
    const cacheKey = `${REVIEW_CACHE_PREFIX}${bookId}:${language}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return {
        success: true,
        data: {
          bookFound: true,
          generatedReview: cached,
          cached: true,
          bookInfo,
        },
      };
    }

    await this.enforceRateLimit(userId);

    try {
      const review = await this.gemini.generate(
        this.buildReviewPrompt(bookInfo.title, bookInfo.subjects, language),
        REVIEW_INSTRUCTION,
      );

      // An empty completion is a failure, not a review: serve the template
      // instead, and never cache it or the book gets a blank review for an hour.
      if (!review) {
        this.logger.warn(
          `Gemini returned an empty review for "${bookInfo.title}"`,
        );
        return {
          success: true,
          data: {
            bookFound: true,
            generatedReview: this.fallbackReview(bookInfo.title, bookInfo.subjects, language),
            usedAI: false,
            bookInfo,
          },
        };
      }

      await this.redis.setEx(
        cacheKey,
        REVIEW_CACHE_TTL_SECONDS,
        review,
      );
      return {
        success: true,
        data: {
          bookFound: true,
          generatedReview: review,
          usedAI: true,
          bookInfo,
        },
      };
    } catch (error) {
      if (error instanceof GeminiQuotaError) {
        return {
          success: true,
          data: {
            bookFound: true,
            generatedReview: this.fallbackReview(bookInfo.title, bookInfo.subjects, language),
            usedAI: false,
            bookInfo,
          },
        };
      }
      throw this.toHttpError(error, 'Error while generating review');
    }
  }

  private async findBookForReview(bookQuery: string): Promise<LeanBook | null> {
    const stripped = bookQuery
      .replace(REVIEW_FILLER_ASCII, ' ')
      .replace(REVIEW_FILLER_VI, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Try the cleaned-up title first, then the raw query in case the stripping
    // removed something that was actually part of the title ("The Book Thief").
    for (const term of [stripped, bookQuery].filter(Boolean)) {
      const query = new QueryBooksDto();
      query.page = 1;
      query.limit = 1;
      query.sort = BookSort.Rating;
      query.search = term;

      const { items } = await this.booksService.findAll(query);
      if (items.length) return items[0];
    }

    return null;
  }

  private buildReviewPrompt(
    title: string,
    subjects: string[],
    language: ReviewLanguage,
  ): string {
    const languageName = language === 'vi' ? 'Vietnamese' : 'English';
    return `Write a natural, enthusiastic review of "${title}" (genres: ${subjects.join(', ')}).
Talk as if recommending it to a friend: what makes it special, who would enjoy it, and the overall feel.
Keep it to 3-5 conversational sentences addressed to the reader.
Write the review in ${languageName}.`;
  }

  /**
   * Crude but sufficient: Vietnamese is the only non-English language the
   * storefront ships, and its diacritics are unmistakable. The result is part
   * of the review cache key, so a Vietnamese reader never gets served the
   * English review generated for someone else.
   */
  private detectLanguage(text: string): ReviewLanguage {
    return /[ăâêôơưđàáảãạèéẻẽẹìíỉĩịòóỏõọùúủũụỳýỷỹỵ]/i.test(text) ? 'vi' : 'en';
  }

  /** Used when Gemini is out of quota or returns nothing, so it follows the reader's language. */
  private fallbackReview(
    title: string,
    subjects: string[],
    language: ReviewLanguage,
  ): string {
    const genre = subjects[0] ?? 'this genre';
    if (language === 'vi') {
      return `"${title}" là một trong những cuốn được bạn đọc quay lại nhiều nhất ở thể loại ${genre}. Nếu bạn thích ${subjects.join(
        ' và ',
      )} thì cuốn này rất đáng thử.`;
    }
    return `"${title}" is one of the titles our readers keep coming back to in ${genre}. If ${subjects.join(
      ' and ',
    )} is your thing, it is well worth a look.`;
  }

  // ---------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------

  /** Records every book a tool returned, so replies can be linked to real rows. */
  private collectBooks(result: object, seen: Map<string, SessionBook>): void {
    const books = (result as { books?: SessionBook[] }).books;
    if (!Array.isArray(books)) return;
    for (const book of books) seen.set(book.title.toLowerCase(), book);
  }

  /**
   * Matches titles the reply names against the books the tools returned, so the
   * client can render real, clickable cards. Longer titles are checked first so
   * a series entry wins over the shorter title it contains.
   */
  private resolveReferenced(
    reply: string,
    seen: Map<string, SessionBook>,
  ): ReferencedBook[] {
    const haystack = reply.toLowerCase();
    return [...seen.entries()]
      .sort(([a], [b]) => b.length - a.length)
      .filter(([title]) => title.length > 2 && haystack.includes(title))
      .map(([, book]) => ({
        bookId: book.id,
        title: book.title,
        subjects: book.subjects,
        price: book.price,
        rating: book.rating,
        inStock: book.inStock,
      }));
  }

  /** Pulls the sentence mentioning a title, to use as that book's reason. */
  private reasonFor(reply: string, title: string): string {
    const sentence = reply
      .split(/(?<=[.!?])\s+|\n+/)
      .find((part) => part.toLowerCase().includes(title.toLowerCase()));
    return (
      sentence?.replace(/^[\d\-*•.\s]+/, '').trim() ||
      'A good match for what you asked for.'
    );
  }

  private requireText(value: string | undefined, message: string): string {
    const text = value?.trim();
    if (!text) {
      throw new HttpException(
        { success: false, message },
        HttpStatus.BAD_REQUEST,
      );
    }
    return text;
  }

  private async enforceRateLimit(userId: string): Promise<void> {
    const result = await this.rateLimit.consume(
      `chatbot:${userId}`,
      RATE_LIMIT,
      RATE_LIMIT_WINDOW_SECONDS,
    );
    if (result.allowed) return;

    throw new HttpException(
      {
        success: false,
        message: `You've sent a lot of messages just now. Please wait ${result.retryAfter}s and try again.`,
        errorType: 'rate_limited',
        retryAfter: result.retryAfter,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  private toHttpError(error: unknown, fallbackMessage: string): HttpException {
    if (error instanceof HttpException) return error;

    if (error instanceof GeminiBusyError) {
      return new HttpException(
        {
          success: false,
          message:
            'The advisor is handling a lot of requests right now. Please try again shortly.',
          errorType: 'busy',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    if (error instanceof GeminiQuotaError) {
      return new HttpException(
        {
          success: false,
          message:
            'Our AI service is at capacity for the moment. Please try again in a few minutes.',
          errorType: 'quota_exceeded',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    this.logger.error(`${fallbackMessage}: ${(error as Error).message}`);
    return new HttpException(
      { success: false, message: fallbackMessage },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
