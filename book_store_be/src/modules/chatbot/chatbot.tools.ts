import {
  FunctionCall,
  FunctionDeclaration,
  SchemaType,
  Tool,
} from '@google/generative-ai';
import { Injectable, Logger } from '@nestjs/common';
import { BooksService } from '../books/books.service';
import { LeanBook } from '../books/books.types';
import { BookSort, QueryBooksDto } from '../books/dto/query-books.dto';
import { SessionBook } from './chat-history.service';

/** Books handed to the model per lookup. Enough to choose from, small enough to stay cheap. */
const TOOL_RESULT_LIMIT = 12;
const MAX_TOOL_RESULT_LIMIT = 20;

const searchBooks: FunctionDeclaration = {
  name: 'search_books',
  description:
    'Search the store catalogue. Use this whenever the user asks about books, ' +
    'genres, prices or availability. Returns only books this store actually sells.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      subject: {
        type: SchemaType.STRING,
        description:
          'A genre or category such as "fantasy", "manga" or "historical fiction". ' +
          'A broad category also matches its subcategories.',
      },
      search: {
        type: SchemaType.STRING,
        description: 'Free text matched against book titles and author names.',
      },
      minPrice: {
        type: SchemaType.NUMBER,
        description: 'Lowest acceptable price.',
      },
      maxPrice: {
        type: SchemaType.NUMBER,
        description: 'Highest acceptable price.',
      },
      inStock: {
        type: SchemaType.BOOLEAN,
        description:
          'Set true when the user only wants books currently in stock.',
      },
      sort: {
        type: SchemaType.STRING,
        format: 'enum',
        enum: Object.values(BookSort),
        description:
          'Result ordering. Use "rating" for "best" and "bestselling" for "popular".',
      },
      limit: {
        type: SchemaType.INTEGER,
        description: `How many books to return (max ${MAX_TOOL_RESULT_LIMIT}).`,
      },
    },
    required: [],
  },
};

const listCategories: FunctionDeclaration = {
  name: 'list_categories',
  description:
    'List the genres this store carries, with how many books each holds. ' +
    'Use it when the user asks what is available, or to pick a valid subject for search_books.',
  parameters: { type: SchemaType.OBJECT, properties: {}, required: [] },
};

export const CHATBOT_TOOLS: Tool[] = [
  { functionDeclarations: [searchBooks, listCategories] },
];

/**
 * Executes the catalogue lookups Gemini asks for.
 *
 * Everything routes through `BooksService`, so the chatbot inherits the
 * indexed subject expansion, the price/stock filters and the Redis cache that
 * the storefront already uses, instead of running its own unindexed regex.
 */
@Injectable()
export class ChatbotToolsService {
  private readonly logger = new Logger(ChatbotToolsService.name);

  constructor(private readonly booksService: BooksService) {}

  async execute(call: FunctionCall): Promise<object> {
    try {
      switch (call.name) {
        case 'search_books':
          return await this.searchBooks(call.args as Record<string, unknown>);
        case 'list_categories':
          return await this.listCategories();
        default:
          return { error: `Unknown tool "${call.name}"` };
      }
    } catch (error) {
      // A failed lookup is reported back to the model as data, so it can
      // apologise in its own words instead of the whole turn throwing.
      this.logger.error(
        `Tool ${call.name} failed: ${(error as Error).message}`,
      );
      return { error: 'The catalogue lookup failed.' };
    }
  }

  private async searchBooks(args: Record<string, unknown>): Promise<object> {
    const query = new QueryBooksDto();
    query.page = 1;
    query.limit = this.clampLimit(args.limit);
    query.sort = this.toSort(args.sort);

    if (typeof args.subject === 'string' && args.subject.trim()) {
      query.subject = args.subject.trim();
    }
    if (typeof args.search === 'string' && args.search.trim()) {
      query.search = args.search.trim();
    }
    if (typeof args.minPrice === 'number') query.minPrice = args.minPrice;
    if (typeof args.maxPrice === 'number') query.maxPrice = args.maxPrice;
    if (args.inStock === true) query.inStock = true;

    const { items, meta } = await this.booksService.findAll(query);
    this.logger.log(
      `search_books(${JSON.stringify(args)}) -> ${items.length} of ${meta.total}`,
    );

    return {
      totalMatches: meta.total,
      books: items.map((book): SessionBook => this.toSessionBook(book)),
    };
  }

  private async listCategories(): Promise<object> {
    const categories = await this.booksService.getCategories();
    return {
      categories: categories.map((category) => ({
        name: category.name,
        count: category.count,
        subcategories: (category.subcategories ?? []).map((sub) => sub.name),
      })),
    };
  }

  private toSessionBook(book: LeanBook): SessionBook {
    return {
      id: String(book._id),
      title: book.title,
      authors: book.authors ?? [],
      price: book.price,
      rating: book.rating ?? null,
      subjects: book.subjects ?? [],
      inStock: book.stock > 0,
    };
  }

  private clampLimit(value: unknown): number {
    const limit =
      typeof value === 'number' ? Math.trunc(value) : TOOL_RESULT_LIMIT;
    return Math.min(
      MAX_TOOL_RESULT_LIMIT,
      Math.max(1, limit || TOOL_RESULT_LIMIT),
    );
  }

  private toSort(value: unknown): BookSort {
    const sorts = Object.values(BookSort) as string[];
    return typeof value === 'string' && sorts.includes(value)
      ? (value as BookSort)
      : BookSort.Rating;
  }
}
