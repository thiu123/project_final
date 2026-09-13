import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage } from 'mongoose';
import { Paginated, paginate } from '../../common/dto/pagination.dto';
import { RedisService } from '../../config/redis/redis.service';
import { BOOK_CACHE_TTL_SECONDS } from '../../constants/app.constants';
import { BOOK_SUBJECTS } from '../../constants/book-subjects';
import {
  HOME_SECTION_SIZE,
  HOME_SECTION_SUBJECTS,
} from '../../constants/home-sections';
import { CategoryNode, HomePayload, LeanBook } from './books.types';
import { CreateBookDto, UpdateBookDto } from './dto/book.dto';
import {
  BOOK_SORT_SPEC,
  MAX_PAGE_SIZE,
  QueryBooksDto,
} from './dto/query-books.dto';
import { Book, BookDocument } from './schemas/book.schema';
import {
  expandSubject,
  normalizeSubject,
  slugifySubject,
} from './subject.util';

// Every derived cache starts with this prefix, so one wildcard clears them all.
const LIST_CACHE_PREFIX = 'books:';
const HOME_CACHE_KEY = 'books:home';
const CATEGORIES_CACHE_KEY = 'books:categories';

const SEARCH_SUGGESTION_LIMIT = 8;
const MAX_SEARCH_SUGGESTIONS = 25;

interface SubjectStat {
  _id: string;
  count: number;
  cover_url: string | null;
}

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

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book.name) private readonly bookModel: Model<BookDocument>,
    private readonly redis: RedisService,
  ) {}

  async findAll(query: QueryBooksDto): Promise<Paginated<LeanBook>> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, query.limit || 12));
    const cacheKey = this.listCacheKey(query, page, limit);

    const cached = await this.redis.getJson<Paginated<LeanBook>>(cacheKey);
    if (cached) return cached;

    const filter = this.buildFilter(query);
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

  async getCategories(): Promise<CategoryNode[]> {
    const cached =
      await this.redis.getJson<CategoryNode[]>(CATEGORIES_CACHE_KEY);
    if (cached) return cached;

    const stats = await this.bookModel
      .aggregate<SubjectStat>(SUBJECT_STATS_PIPELINE as PipelineStage[])
      .exec();

    const categories = this.buildCategoryTree(this.toStatsMap(stats));
    await this.redis.setJson(
      CATEGORIES_CACHE_KEY,
      BOOK_CACHE_TTL_SECONDS,
      categories,
    );
    return categories;
  }

  // The home page needs four lists. One $facet fetches them in a single
  // round trip instead of four queries against a remote cluster.
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

    const groups: Record<string, Book[]> = Object.fromEntries(
      subjects.map((subject) => [subject, [] as Book[]]),
    );
    for (const group of facet?.groups ?? []) {
      groups[normalizeSubject(group._id)] = group.books;
    }

    const categories = this.buildCategoryTree(
      this.toStatsMap(facet?.subjectStats ?? []),
    );

    const payload: HomePayload = {
      latest: facet?.latest ?? [],
      groups,
      bestSellers: facet?.bestSellers ?? [],
      categories,
    };

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

  async searchSuggestions(title?: string, limit?: number): Promise<Book[]> {
    const term = title?.trim();
    if (!term) return [];

    const size = Math.min(
      MAX_SEARCH_SUGGESTIONS,
      Math.max(1, limit || SEARCH_SUGGESTION_LIMIT),
    );
    const pattern = new RegExp(escapeRegex(term), 'i');

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
      throw new NotFoundException({ message: "Can't find book" });
    }

    await this.invalidateBooks([id]);
    return { message: 'Update book successfully', book };
  }

  async deleteBook(id: string) {
    const book = await this.bookModel.findByIdAndDelete(id).exec();
    await this.invalidateBooks([id]);
    return { message: 'Delete book successfully', book };
  }

  // Checkout changes stock and sold through its own model handle, so it has
  // to drop the cached copies itself or the detail page stays stale.
  async invalidateBooks(ids: string[]): Promise<void> {
    await this.redis.del(...ids.map((id) => this.bookKey(id)));
    await this.clearDerivedCaches();
  }

  private buildFilter(query: QueryBooksDto): FilterQuery<BookDocument> {
    const filter: FilterQuery<BookDocument> = {};

    if (query.subject) {
      const subjects = expandSubject(query.subject);
      if (subjects.length > 0) filter.subjects = { $in: subjects };
    }

    if (query.search) {
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

  private toStatsMap(stats: SubjectStat[]): Map<string, SubjectStat> {
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

      node.count += node.subcategories.reduce(
        (sum, child) => sum + child.count,
        0,
      );
      node.cover_url ??=
        node.subcategories.find((child) => child.cover_url)?.cover_url ?? null;

      return node;
    });
  }

  // Subjects are stored normalized, so "Literary Fiction" is still found
  // by ?subject=fiction.
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

  private async clearDerivedCaches(): Promise<void> {
    const keys = await this.redis.keys(`${LIST_CACHE_PREFIX}*`);
    await this.redis.del(...keys);
  }
}
