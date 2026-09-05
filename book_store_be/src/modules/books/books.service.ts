import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RedisService } from '../../config/redis/redis.service';
import { BOOK_CACHE_TTL_SECONDS } from '../../constants/app.constants';
import { CreateBookDto, UpdateBookDto } from './dto/book.dto';
import { Book, BookDocument } from './schemas/book.schema';

const HOME_CACHE_KEY = 'books:home';
const ALL_CACHE_PREFIX = 'books:all:';
const BOOKS_PER_HOME_GROUP = 10;

@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);

  constructor(
    @InjectModel(Book.name) private readonly bookModel: Model<BookDocument>,
    private readonly redis: RedisService,
  ) {}

  async getAllBooks(subject?: string) {
    const cacheKey = `${ALL_CACHE_PREFIX}${subject || 'all'}`;

    const cached = await this.redis.getJson<Book[]>(cacheKey);
    if (cached) return cached;

    const filter = subject ? { subjects: subject } : {};
    const books = await this.bookModel.find(filter);

    await this.redis.setJson(cacheKey, BOOK_CACHE_TTL_SECONDS, books);
    return books;
  }

  async getBookById(id: string) {
    const cacheKey = this.bookKey(id);

    const cached = await this.redis.getJson<Book>(cacheKey);
    if (cached) return cached;

    const book = await this.bookModel.findById(id);
    await this.redis.setJson(cacheKey, BOOK_CACHE_TTL_SECONDS, book);
    return book;
  }

  async addBook(dto: CreateBookDto) {
    const book = await new this.bookModel(dto).save();
    await this.clearBooksCache();
    return { message: 'Add book successfully', book };
  }

  async updateBook(id: string, dto: UpdateBookDto) {
    const book = await this.bookModel.findByIdAndUpdate(id, dto, { new: true });
    if (!book) {
      throw new HttpException({ message: "Can't find book" }, HttpStatus.NOT_FOUND);
    }

    await this.redis.del(this.bookKey(id));
    await this.clearBooksCache();
    return { message: 'Update book successfully', book };
  }

  async deleteBook(id: string) {
    const book = await this.bookModel.findByIdAndDelete(id);

    await this.redis.del(this.bookKey(id));
    await this.clearBooksCache();
    return { message: 'Delete book successfully', book };
  }

  async searchBooksByTitle(title?: string) {
    const query = title?.trim();
    if (!query) return [];

    return this.bookModel.find({ title: { $regex: query, $options: 'i' } });
  }

  /**
   * Single endpoint for the home page: one DB query, grouped by subject and
   * capped to the newest books per group to keep the payload small.
   */
  async homeBooks() {
    const cached = await this.redis.getJson<unknown>(HOME_CACHE_KEY);
    if (cached) return cached;

    // Exclude the heavy `description` field: home cards don't show it
    const allBooksSorted = await this.bookModel
      .find({})
      .select('-description')
      .sort({ createdAt: -1 });

    const subjects: Record<string, BookDocument[]> = {};
    for (const book of allBooksSorted) {
      for (const subject of book.subjects || []) {
        const key = subject.toLowerCase();
        subjects[key] ??= [];
        if (subjects[key].length < BOOKS_PER_HOME_GROUP) {
          subjects[key].push(book);
        }
      }
    }

    const result = {
      all: allBooksSorted.slice(0, BOOKS_PER_HOME_GROUP),
      subjects,
    };
    await this.redis.setJson(HOME_CACHE_KEY, BOOK_CACHE_TTL_SECONDS, result);
    return result;
  }

  private bookKey(id: string): string {
    return `book:${id}`;
  }

  /** Invalidates every list cache (all subjects) and the home cache. */
  private async clearBooksCache(): Promise<void> {
    try {
      const keys = await this.redis.keys(`${ALL_CACHE_PREFIX}*`);
      await this.redis.del(...keys, HOME_CACHE_KEY);
    } catch (error) {
      this.logger.error(`Error when deleting cache: ${(error as Error).message}`);
    }
  }
}
