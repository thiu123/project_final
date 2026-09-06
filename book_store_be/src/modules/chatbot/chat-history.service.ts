import { Content } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';
import { RedisService } from '../../config/redis/redis.service';

const HISTORY_PREFIX = 'chatbot:history:';

/** Conversations resume for this long after the last message. */
const HISTORY_TTL_SECONDS = 3600;

/** Turns kept per user (one exchange is two entries), oldest dropped first. */
const MAX_HISTORY_ENTRIES = 12;

/** Books remembered per conversation, so follow-ups can still be linked. */
const MAX_REMEMBERED_BOOKS = 40;

/** Guards against one very long message crowding out the rest of the history. */
const MAX_STORED_TEXT = 2000;

/** The catalogue row shape the chatbot shows the model and the client. */
export interface SessionBook {
  id: string;
  title: string;
  authors: string[];
  price: number;
  rating: number | null;
  subjects: string[];
  inStock: boolean;
}

export interface ChatSession {
  contents: Content[];
  /** Every book surfaced so far this conversation, newest last. */
  books: SessionBook[];
}

/**
 * Per-user conversation state in Redis.
 *
 * Only the plain user/model text is kept — never the `functionCall` /
 * `functionResponse` parts. Gemini requires those to stay correctly paired, and
 * trimming an overflowing history would eventually split a pair and make the
 * conversation unreplayable.
 *
 * The books are stored separately for the same reason. Once the model starts
 * answering follow-ups from context instead of re-searching, the turn has no
 * tool results of its own, and without this the client would lose the ids it
 * needs to render a book card.
 */
@Injectable()
export class ChatHistoryService {
  constructor(private readonly redis: RedisService) {}

  private key(userId: string): string {
    return `${HISTORY_PREFIX}${userId}`;
  }

  async get(userId: string): Promise<ChatSession> {
    const session = await this.redis.getJson<ChatSession>(this.key(userId));
    return {
      contents: this.sanitize(session?.contents ?? []),
      books: session?.books ?? [],
    };
  }

  async append(
    userId: string,
    userText: string,
    modelText: string,
    books: SessionBook[],
  ): Promise<void> {
    const session = await this.get(userId);

    session.contents.push(
      { role: 'user', parts: [{ text: this.truncate(userText) }] },
      { role: 'model', parts: [{ text: this.truncate(modelText) }] },
    );

    // Re-inserting a book moves it to the newest end, so the titles most
    // recently discussed are the last to be evicted.
    const merged = new Map(session.books.map((book) => [book.id, book]));
    for (const book of books) {
      merged.delete(book.id);
      merged.set(book.id, book);
    }

    await this.redis.setJson(this.key(userId), HISTORY_TTL_SECONDS, {
      contents: this.sanitize(session.contents.slice(-MAX_HISTORY_ENTRIES)),
      books: [...merged.values()].slice(-MAX_REMEMBERED_BOOKS),
    } satisfies ChatSession);
  }

  async clear(userId: string): Promise<void> {
    await this.redis.del(this.key(userId));
  }

  /**
   * Gemini rejects a history that does not begin with a user turn, which is
   * exactly what trimming to the last N entries can produce.
   */
  private sanitize(contents: Content[]): Content[] {
    const firstUser = contents.findIndex((entry) => entry.role === 'user');
    return firstUser <= 0 ? contents : contents.slice(firstUser);
  }

  private truncate(text: string): string {
    return text.length > MAX_STORED_TEXT
      ? `${text.slice(0, MAX_STORED_TEXT)}…`
      : text;
  }
}
