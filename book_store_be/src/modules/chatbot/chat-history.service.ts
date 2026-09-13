import { Content } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';
import { RedisService } from '../../config/redis/redis.service';

const HISTORY_PREFIX = 'chatbot:history:';
const HISTORY_TTL_SECONDS = 3600;
const MAX_HISTORY_ENTRIES = 12;
const MAX_REMEMBERED_BOOKS = 40;
const MAX_STORED_TEXT = 2000;

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
  books: SessionBook[];
}

/**
 * Per-user conversation state in Redis.
 *
 * Only plain user/model text is kept, never the functionCall /
 * functionResponse parts: Gemini requires those to stay paired, and trimming
 * an overflowing history would eventually split a pair. The books are stored
 * separately for the same reason — a follow-up answered from context has no
 * tool results of its own, but the client still needs the ids.
 */
@Injectable()
export class ChatHistoryService {
  constructor(private readonly redis: RedisService) {}

  async get(userId: string): Promise<ChatSession> {
    const session = await this.redis.getJson<ChatSession>(this.key(userId));
    return {
      contents: this.startWithUserTurn(session?.contents ?? []),
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

    // Re-inserting a book moves it to the end, so the titles discussed most
    // recently are the last to be evicted.
    const merged = new Map(session.books.map((book) => [book.id, book]));
    for (const book of books) {
      merged.delete(book.id);
      merged.set(book.id, book);
    }

    await this.redis.setJson(this.key(userId), HISTORY_TTL_SECONDS, {
      contents: this.startWithUserTurn(
        session.contents.slice(-MAX_HISTORY_ENTRIES),
      ),
      books: [...merged.values()].slice(-MAX_REMEMBERED_BOOKS),
    } satisfies ChatSession);
  }

  async clear(userId: string): Promise<void> {
    await this.redis.del(this.key(userId));
  }

  private key(userId: string): string {
    return `${HISTORY_PREFIX}${userId}`;
  }

  // Gemini rejects a history that does not begin with a user turn, which is
  // exactly what trimming to the last N entries can produce.
  private startWithUserTurn(contents: Content[]): Content[] {
    const firstUser = contents.findIndex((entry) => entry.role === 'user');
    return firstUser <= 0 ? contents : contents.slice(firstUser);
  }

  private truncate(text: string): string {
    return text.length > MAX_STORED_TEXT
      ? `${text.slice(0, MAX_STORED_TEXT)}…`
      : text;
  }
}
