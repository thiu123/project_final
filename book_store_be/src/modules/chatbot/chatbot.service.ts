import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { RateLimitService } from '../../common/services/rate-limit.service';
import { ChatHistoryService, SessionBook } from './chat-history.service';
import { CHATBOT_TOOLS, ChatbotToolsService } from './chatbot.tools';
import {
  GeminiBusyError,
  GeminiQuotaError,
  GeminiService,
} from './gemini.service';

// Gemini's free tier is shared by every user, so each one gets a small budget.
const RATE_LIMIT = 15;
const RATE_LIMIT_WINDOW_SECONDS = 60;

const SYSTEM_INSTRUCTION = `You are the AI book advisor for an online bookstore that sells both print books and ebooks.

Rules:
- Only ever recommend books returned by the tools. Never invent a title, author or price; if the catalogue has nothing suitable, say so plainly.
- Call search_books whenever the user asks about books, genres, prices or availability. Call list_categories when you need to know what the store carries.
- Do not call a tool when the conversation above already contains the answer. Follow-ups about books you just listed ("which is cheapest?", "tell me more about the second one") must be answered from that earlier result.
- Always answer in the same language the user wrote in.
- Be warm and concise: two or three sentences of framing, then the books. Mention each book by its exact title so it can be linked.
- Prices are in the store's own currency; quote the number the tool gave you and nothing else.`;

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
  ) {}

  async chat(userId: string, message: string) {
    await this.enforceRateLimit(userId);

    try {
      const session = await this.history.get(userId);

      // Seeded with the books already shown, so a follow-up answered from
      // context still resolves to rows the client can link.
      const seen = new Map<string, SessionBook>(
        session.books.map((book) => [book.title.toLowerCase(), book]),
      );

      const turn = await this.gemini.runTurn({
        history: session.contents,
        message,
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
      await this.history.append(userId, message, reply, [...seen.values()]);

      this.logger.log(
        `chat(${userId}): ${turn.llmCalls} Gemini call(s), ${turn.toolCalls} tool call(s)`,
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

  private collectBooks(result: object, seen: Map<string, SessionBook>): void {
    const books = (result as { books?: SessionBook[] }).books;
    if (!Array.isArray(books)) return;
    for (const book of books) seen.set(book.title.toLowerCase(), book);
  }

  // Matches titles the reply names against the books the tools returned, so
  // the client can render real cards. Longer titles win over shorter ones
  // they contain.
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
