import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage } from 'mongoose';
import { Paginated, paginate } from '../../common/dto/pagination.dto';
import { BOOK_CACHE_TTL_SECONDS } from '../../constants/app.constants';
import { BOOK_SUBJECTS } from '../../constants/book-subjects';
import {
  HOME_SECTION_SIZE,
  HOME_SECTION_SUBJECTS,
} from '../../constants/home-sections';
import { RedisService } from '../../config/redis/redis.service';
import { CreateBookDto, UpdateBookDto } from './dto/book.dto';
import {
  BOOK_SORT_SPEC,
  MAX_PAGE_SIZE,
  QueryBooksDto,
} from './dto/query-books.dto';
import { Book, BookDocument } from './schemas/book.schema';
import { CategoryNode, HomePayload, LeanBook } from './books.types';
import {
  expandSubject,
  normalizeSubject,
  slugifySubject,
} from './subject.util';

/** Every derived cache lives under this prefix so one wildcard clears them all. */
const LIST_CACHE_PREFIX = 'books:';
const HOME_CACHE_KEY = 'books:home';
const CATEGORIES_CACHE_KEY = 'books:categories';

/** Typeahead results are capped; the full result set comes from the list endpoint. */
const SEARCH_SUGGESTION_LIMIT = 8;
const MAX_SEARCH_SUGGESTIONS = 25;

/** Aggregated per-subject stats used to build the category tree. */
interface SubjectStat {
  _id: string;
  count: number;
  cover_url: string | null;
}

/**
 * Counts books per subject and picks the newest book's cover as the category
 * thumbnail. Shared between `getCategories` and the home `$facet`.
 */
const SUBJECT_STATS_PIPELINE: PipelineStage.FacetPipelineStage[] = [
  { $unwind: '$subjects' },
  { $sort: { createdAt: -1 } },
  {
    $group: {
      _id: '$subjects',
      count: { $sum: 1 },
      cover_url: { $first: '$cover_url' },
    },
  },
];

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);

  constructor(
    @InjectModel(Book.name) private readonly bookModel: Model<BookDocument>,
    private readonly redis: RedisService,
  ) {}

  // ---------------------------------------------------------------------
  // Listing: pagination + filtering + sorting, all in MongoDB
  // ---------------------------------------------------------------------

  async findAll(query: QueryBooksDto): Promise<Paginated<LeanBook>> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, query.limit || 12));
    const cacheKey = this.listCacheKey(query, page, limit);

    const cached = await this.redis.getJson<Paginated<LeanBook>>(cacheKey);
    if (cached) return cached;

    const filter = this.buildFilter(query);

    // countDocuments runs alongside the page fetch instead of after it.
    const [items, total] = await Promise.all([
      this.bookModel
        .find(filter)
        .sort(BOOK_SORT_SPEC[query.sort])
        .skip((page - 1) * limit)
        .limit(limit)
        .lean<LeanBook[]>()
        .exec(),
      this.bookModel.countDocuments(filter).exec(),
    ]);

    const result = paginate(items, page, limit, total);
    await this.redis.setJson(cacheKey, BOOK_CACHE_TTL_SECONDS, result);
    return result;
  }

  /** Translates the query DTO into a single MongoDB filter. */
  private buildFilter(query: QueryBooksDto): FilterQuery<BookDocument> {
    const filter: FilterQuery<BookDocument> = {};

    if (query.subject) {
      const subjects = expandSubject(query.subject);
      if (subjects.length > 0) filter.subjects = { $in: subjects };
    }

    if (query.search) {
      // Substring match so partial typing works; the term is escaped first.
      const pattern = new RegExp(escapeRegex(query.search), 'i');
      filter.$or = [{ title: pattern }, { authors: pattern }];
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.price = {};
      if (query.minPrice !== undefined) filter.price.$gte = query.minPrice;
      if (query.maxPrice !== undefined) filter.price.$lte = query.maxPrice;
    }

    if (query.inStock) filter.stock = { $gt: 0 };

    return filter;
  }

  private listCacheKey(
    query: QueryBooksDto,
    page: number,
    limit: number,
  ): string {
    const parts = [
      `p${page}`,
      `l${limit}`,
      `s${query.sort}`,
      query.subject ? `sub:${normalizeSubject(query.subject)}` : '',
      query.search ? `q:${query.search.toLowerCase()}` : '',
      query.minPrice !== undefined ? `min:${query.minPrice}` : '',
      query.maxPrice !== undefined ? `max:${query.maxPrice}` : '',
      query.inStock ? 'instock' : '',
    ].filter(Boolean);
    return `${LIST_CACHE_PREFIX}list:${parts.join('|')}`;
  }

  // ---------------------------------------------------------------------
  // Categories, derived from real data
  // ---------------------------------------------------------------------

  /**
   * Curated taxonomy joined with live per-subject counts and a cover image.
   * A category's count rolls up its subcategories, matching what `?subject=`
   * returns for that category.
   */
  async getCategories(): Promise<CategoryNode[]> {
    const cached =
      await this.redis.getJson<CategoryNode[]>(CATEGORIES_CACHE_KEY);
    if (cached) return cached;

    const categories = this.buildCategoryTree(
      await this.aggregateSubjectStats(),
    );
    await this.redis.setJson(
      CATEGORIES_CACHE_KEY,
      BOOK_CACHE_TTL_SECONDS,
      categories,
    );
    return categories;
  }

  /** One pass over the collection: count books and pick a cover per subject. */
  private async aggregateSubjectStats(): Promise<Map<string, SubjectStat>> {
    const stats = await this.bookModel
      .aggregate<SubjectStat>(SUBJECT_STATS_PIPELINE as PipelineStage[])
      .exec();

    return new Map(stats.map((stat) => [normalizeSubject(stat._id), stat]));
  }

  private buildCategoryTree(stats: Map<string, SubjectStat>): CategoryNode[] {
    const toNode = (label: string): CategoryNode => {
      const subject = normalizeSubject(label);
      const stat = stats.get(subject);
      return {
        name: label,
        slug: slugifySubject(label),
        subject,
        count: stat?.count ?? 0,
        cover_url: stat?.cover_url ?? null,
        subcategories: [],
      };
    };

    return BOOK_SUBJECTS.map((entry) => {
      const node = toNode(entry.category);
      node.subcategories = (entry.subcategories ?? []).map(toNode);

      // Rolled-up count mirrors what ?subject=<category> actually returns.
      node.count += node.subcategories.reduce(
        (sum, child) => sum + child.count,
        0,
      );

      // Fall back to a subcategory cover when the category itself has no books.
      node.cover_url ??=
        node.subcategories.find((child) => child.cover_url)?.cover_url ?? null;

      return node;
    });
  }

  // ---------------------------------------------------------------------
  // Home page: one small payload, three bounded queries
  // ---------------------------------------------------------------------

  /**
   * The whole home payload comes from ONE aggregation.
   *
   * The four sections were originally four separate queries. Against a remote
   * Atlas cluster the round trips, not the row count, dominated the response
   * time, so they are folded into a single `$facet` command instead.
   */
  async getHome(): Promise<HomePayload> {
    const cached = await this.redis.getJson<HomePayload>(HOME_CACHE_KEY);
    if (cached) return cached;

    const subjects = [...HOME_SECTION_SUBJECTS];

    const [facet] = await this.bookModel
      .aggregate<{
        latest: Book[];
        bestSellers: Book[];
        groups: { _id: string; books: Book[] }[];
        subjectStats: SubjectStat[];
      }>([
        {
          $facet: {
            latest: [
              { $sort: { createdAt: -1, _id: -1 } },
              { $limit: HOME_SECTION_SIZE },
              { $project: { description: 0 } },
            ],
            bestSellers: [
              { $match: { sold: { $gt: 0 } } },
              { $sort: { sold: -1, _id: -1 } },
              { $limit: HOME_SECTION_SIZE },
              { $project: { description: 0 } },
            ],
            groups: [
              { $match: { subjects: { $in: subjects } } },
              { $sort: { createdAt: -1, _id: -1 } },
              { $unwind: '$subjects' },
              { $match: { subjects: { $in: subjects } } },
              { $group: { _id: '$subjects', books: { $push: '$$ROOT' } } },
              {
                $project: { books: { $slice: ['$books', HOME_SECTION_SIZE] } },
              },
            ],
            subjectStats: SUBJECT_STATS_PIPELINE,
          },
        },
      ])
      .exec();

    // Always expose every configured key so carousels can render empty states.
    const groups: Record<string, Book[]> = Object.fromEntries(
      subjects.map((subject) => [subject, [] as Book[]]),
    );
    for (const group of facet?.groups ?? []) {
      groups[normalizeSubject(group._id)] = group.books;
    }

    const stats = new Map(
      (facet?.subjectStats ?? []).map((stat) => [
        normalizeSubject(stat._id),
        stat,
      ]),
    );
    const categories = this.buildCategoryTree(stats);

    const payload: HomePayload = {
      latest: facet?.latest ?? [],
      groups,
      bestSellers: facet?.bestSellers ?? [],
      categories,
    };

    // The same aggregation already produced the category tree, so warm its cache too.
    await Promise.all([
      this.redis.setJson(HOME_CACHE_KEY, BOOK_CACHE_TTL_SECONDS, payload),
      this.redis.setJson(
        CATEGORIES_CACHE_KEY,
        BOOK_CACHE_TTL_SECONDS,
        categories,
      ),
    ]);
    return payload;
  }

  // ---------------------------------------------------------------------
  // Typeahead
  // ---------------------------------------------------------------------

  /** Lightweight suggestions for the search box, capped and without descriptions. */
  async searchSuggestions(title?: string, limit?: number): Promise<Book[]> {
    const query = title?.trim();
    if (!query) return [];

    const size = Math.min(
      MAX_SEARCH_SUGGESTIONS,
      Math.max(1, limit || SEARCH_SUGGESTION_LIMIT),
    );
    const pattern = new RegExp(escapeRegex(query), 'i');

    return this.bookModel
      .find(
        { $or: [{ title: pattern }, { authors: pattern }] },
        { description: 0, pdf_url: 0 },
      )
      .sort({ sold: -1, _id: -1 })
      .limit(size)
      .lean<Book[]>()
      .exec();
  }

  // ---------------------------------------------------------------------
  // Single book + mutations
  // ---------------------------------------------------------------------

  async getBookById(id: string) {
    const cacheKey = this.bookKey(id);

    const cached = await this.redis.getJson<Book>(cacheKey);
    if (cached) return cached;

    const book = await this.bookModel.findById(id).lean<Book>().exec();
    if (book) await this.redis.setJson(cacheKey, BOOK_CACHE_TTL_SECONDS, book);
    return book;
  }

  async addBook(dto: CreateBookDto) {
    const book = await new this.bookModel(
      this.withNormalizedSubjects(dto),
    ).save();
    await this.clearDerivedCaches();
    return { message: 'Add book successfully', book };
  }

  async updateBook(id: string, dto: UpdateBookDto) {
    const book = await this.bookModel
      .findByIdAndUpdate(id, this.withNormalizedSubjects(dto), { new: true })
      .exec();
    if (!book) {
      throw new HttpException(
        { message: "Can't find book" },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.redis.del(this.bookKey(id));
    await this.clearDerivedCaches();
    return { message: 'Update book successfully', book };
  }

  async deleteBook(id: string) {
    const book = await this.bookModel.findByIdAndDelete(id).exec();

    await this.redis.del(this.bookKey(id));
    await this.clearDerivedCaches();
    return { message: 'Delete book successfully', book };
  }

  /**
   * Stores subjects in the same normalized form the catalogue already uses, so
   * a book added as "Literary Fiction" is still found by `?subject=fiction`.
   */
  private withNormalizedSubjects<T extends { subjects?: string[] }>(dto: T): T {
    if (!dto.subjects) return dto;
    return {
      ...dto,
      subjects: dto.subjects.map(normalizeSubject).filter(Boolean),
    };
  }

  private bookKey(id: string): string {
    return `book:${id}`;
  }

  /**
   * Drops the cached copies of the given books plus every derived list.
   *
   * Checkout changes `stock` and `sold` through its own model handle, which
   * never passes through this service — without this the detail page kept
   * advertising stock for a book that had just sold out, for up to the full
   * 30-minute TTL.
   */
  async invalidateBooks(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    try {
      await this.redis.del(...ids.map((id) => this.bookKey(id)));
    } catch (error) {
      this.logger.error(
        `Error clearing book cache: ${(error as Error).message}`,
      );
    }
    await this.clearDerivedCaches();
  }

  /** Drops every list / home / category cache; individual books are keyed separately. */
  private async clearDerivedCaches(): Promise<void> {
    try {
      const keys = await this.redis.keys(`${LIST_CACHE_PREFIX}*`);
      await this.redis.del(...keys);
    } catch (error) {
      this.logger.error(
        `Error when deleting cache: ${(error as Error).message}`,
      );
    }
  }
}
