import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import {
  ClientSession,
  Connection,
  FilterQuery,
  Model,
  PipelineStage,
  Types,
} from 'mongoose';
import { Paginated, paginate } from '../../common/dto/pagination.dto';
import { escapeRegex } from '../../common/utils/escape-regex';
import {
  LOW_STOCK_THRESHOLD,
  ProductType,
} from '../../constants/app.constants';
import { BooksService } from '../books/books.service';
import { Book, BookDocument } from '../books/schemas/book.schema';
import {
  AdjustStockDto,
  QueryMovementsDto,
  QueryStockDto,
  StockSort,
  StockStatus,
} from './dto/inventory.dto';
import {
  StockMovement,
  StockMovementDocument,
  StockMovementReason,
} from './schemas/stock-movement.schema';

type ObjectIdLike = Types.ObjectId | string;

export interface SaleLine {
  bookId: ObjectIdLike;
  quantity: number;
  productType: ProductType;
}

export interface SaleContext {
  orderCode: string;
  session: ClientSession;
  actorId?: ObjectIdLike | null;
  allowOversell?: boolean;
}

export interface InventorySummary {
  titles: number;
  units: number;
  value: number;
  lowStock: number;
  outOfStock: number;
  oversold: number;
  lowStockThreshold: number;
}

type StockLevel = Pick<
  Book,
  'title' | 'authors' | 'cover_url' | 'price' | 'stock' | 'sold' | 'pdf_pages'
> & { _id: Types.ObjectId };

interface NewMovement {
  bookId: ObjectIdLike;
  delta: number;
  balanceAfter: number;
  reason: StockMovementReason;
  orderCode?: string;
  actorId?: ObjectIdLike | null;
  note?: string;
}

const STOCK_PROJECTION = {
  title: 1,
  authors: 1,
  cover_url: 1,
  pdf_pages: 1,
  price: { $ifNull: ['$price', 0] },
  stock: { $ifNull: ['$stock', 0] },
  sold: { $ifNull: ['$sold', 0] },
};
const MOVEMENT_BOOK_FIELDS = 'title authors cover_url';
const MOVEMENT_ACTOR_FIELDS = 'username email avatar_url';

const STOCK_SORT_SPEC: Record<StockSort, Record<string, 1 | -1>> = {
  stock_asc: { stock: 1, _id: 1 },
  stock_desc: { stock: -1, _id: -1 },
  title_asc: { title: 1, _id: 1 },
  sold_desc: { sold: -1, _id: -1 },
};

const STOCK_STATUS_FILTER: Record<StockStatus, Record<string, number>> = {
  in: { $gt: LOW_STOCK_THRESHOLD },
  low: { $gt: 0, $lte: LOW_STOCK_THRESHOLD },
  out: { $lte: 0 },
  oversold: { $lt: 0 },
};

const EMPTY_SUMMARY = {
  titles: 0,
  units: 0,
  value: 0,
  lowStock: 0,
  outOfStock: 0,
  oversold: 0,
};

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Book.name) private readonly bookModel: Model<BookDocument>,
    @InjectModel(StockMovement.name)
    private readonly movementModel: Model<StockMovementDocument>,
    private readonly booksService: BooksService,
  ) {}

  async commitSale(lines: SaleLine[], context: SaleContext): Promise<void> {
    const { session } = context;
    const movements: NewMovement[] = [];

    for (const line of lines) {
      if (line.productType !== 'hardbook') {
        await this.bookModel.updateOne(
          { _id: line.bookId },
          { $inc: { sold: line.quantity } },
          { session },
        );
        continue;
      }

      const filter = context.allowOversell
        ? { _id: line.bookId }
        : { _id: line.bookId, stock: { $gte: line.quantity } };

      const book = await this.bookModel
        .findOneAndUpdate(
          filter,
          { $inc: { stock: -line.quantity, sold: line.quantity } },
          { new: true, session },
        )
        .select('stock')
        .lean<{ stock: number }>();

      if (!book) {
        if (context.allowOversell) {
          this.logger.warn(
            `Order ${context.orderCode} sold book ${String(line.bookId)}, which no longer exists`,
          );
          continue;
        }
        throw await this.insufficientStock(line, session);
      }

      const oversold = book.stock < 0;
      if (oversold) {
        this.logger.warn(
          `Order ${context.orderCode} oversold book ${String(line.bookId)}: stock is now ${book.stock}`,
        );
      }

      movements.push(
        this.saleMovement(
          line,
          -line.quantity,
          book.stock,
          'sale',
          context,
          oversold ? 'Paid after stock ran out' : undefined,
        ),
      );
    }

    if (movements.length > 0) {
      await this.movementModel.insertMany(movements, { session });
    }
  }

  async revertSale(lines: SaleLine[], context: SaleContext): Promise<void> {
    const { session } = context;
    const movements: NewMovement[] = [];

    for (const line of lines) {
      const sold = {
        $max: [0, { $subtract: [{ $ifNull: ['$sold', 0] }, line.quantity] }],
      };

      if (line.productType !== 'hardbook') {
        await this.bookModel.updateOne(
          { _id: line.bookId },
          [{ $set: { sold } }],
          { session },
        );
        continue;
      }

      const book = await this.bookModel
        .findOneAndUpdate(
          { _id: line.bookId },
          [
            {
              $set: {
                stock: { $add: [{ $ifNull: ['$stock', 0] }, line.quantity] },
                sold,
              },
            },
          ],
          { new: true, session },
        )
        .select('stock')
        .lean<{ stock: number }>();

      if (!book) continue;

      movements.push(
        this.saleMovement(
          line,
          line.quantity,
          book.stock,
          'cancellation',
          context,
        ),
      );
    }

    if (movements.length > 0) {
      await this.movementModel.insertMany(movements, { session });
    }
  }

  async adjust(bookId: string, dto: AdjustStockDto, actorId: string) {
    if (!Types.ObjectId.isValid(bookId)) throw this.bookNotFound();
    if (dto.type !== 'count' && dto.quantity < 1) {
      throw new BadRequestException({ msg: 'Quantity must be at least 1' });
    }

    const movement = await this.connection.transaction(async (session) => {
      const { delta, balanceAfter } = await this.applyAdjustment(
        bookId,
        dto,
        session,
      );
      const [created] = await this.movementModel.create(
        [
          {
            bookId,
            delta,
            balanceAfter,
            reason: dto.type,
            actorId,
            note: dto.note || undefined,
          },
        ],
        { session },
      );
      return created;
    });

    await this.booksService.invalidateBooks([bookId]);
    this.logger.log(
      `Stock of ${bookId} ${dto.type}: ${movement.delta >= 0 ? '+' : ''}${movement.delta} -> ${movement.balanceAfter}`,
    );

    return { msg: 'Stock updated', stock: movement.balanceAfter, movement };
  }

  async getSummary(): Promise<InventorySummary> {
    const [stats] = await this.bookModel.aggregate<typeof EMPTY_SUMMARY>([
      {
        $project: {
          stock: { $ifNull: ['$stock', 0] },
          price: { $ifNull: ['$price', 0] },
        },
      },
      {
        $group: {
          _id: null,
          titles: { $sum: 1 },
          units: { $sum: { $max: ['$stock', 0] } },
          value: {
            $sum: { $multiply: [{ $max: ['$stock', 0] }, '$price'] },
          },
          lowStock: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$stock', 0] },
                    { $lte: ['$stock', LOW_STOCK_THRESHOLD] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          outOfStock: { $sum: { $cond: [{ $lte: ['$stock', 0] }, 1, 0] } },
          oversold: { $sum: { $cond: [{ $lt: ['$stock', 0] }, 1, 0] } },
        },
      },
      { $project: { _id: 0 } },
    ]);

    const summary = { ...EMPTY_SUMMARY, ...stats };
    return {
      ...summary,
      value: Math.round(summary.value * 100) / 100,
      lowStockThreshold: LOW_STOCK_THRESHOLD,
    };
  }

  async listStock(query: QueryStockDto): Promise<Paginated<StockLevel>> {
    const match: FilterQuery<BookDocument> = {};

    if (query.search) {
      const pattern = new RegExp(escapeRegex(query.search), 'i');
      match.$or = [{ title: pattern }, { authors: pattern }];
    }

    const pipeline: PipelineStage[] = [
      { $match: match },
      { $project: STOCK_PROJECTION },
    ];
    if (query.status) {
      pipeline.push({ $match: { stock: STOCK_STATUS_FILTER[query.status] } });
    }
    pipeline.push({
      $facet: {
        items: [
          { $sort: STOCK_SORT_SPEC[query.sort] },
          { $skip: (query.page - 1) * query.limit },
          { $limit: query.limit },
        ],
        total: [{ $count: 'count' }],
      },
    });

    const [result] = await this.bookModel
      .aggregate<{ items: StockLevel[]; total: { count: number }[] }>(pipeline)
      .exec();

    return paginate(
      result?.items ?? [],
      query.page,
      query.limit,
      result?.total[0]?.count ?? 0,
    );
  }

  async listMovements(query: QueryMovementsDto) {
    const filter: FilterQuery<StockMovementDocument> = {};
    if (query.bookId) filter.bookId = query.bookId;
    if (query.reason) filter.reason = query.reason;

    const [items, total] = await Promise.all([
      this.movementModel
        .find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .populate('bookId', MOVEMENT_BOOK_FIELDS)
        .populate('actorId', MOVEMENT_ACTOR_FIELDS)
        .lean()
        .exec(),
      this.movementModel.countDocuments(filter).exec(),
    ]);

    return paginate(items, query.page, query.limit, total);
  }

  private async applyAdjustment(
    bookId: string,
    { type, quantity }: AdjustStockDto,
    session: ClientSession,
  ): Promise<{ delta: number; balanceAfter: number }> {
    if (type === 'count') {
      const before = await this.bookModel
        .findOneAndUpdate(
          { _id: bookId },
          { $set: { stock: quantity } },
          { new: false, session },
        )
        .select('stock')
        .lean<{ stock?: number }>();

      if (!before) throw this.bookNotFound();
      return { delta: quantity - (before.stock ?? 0), balanceAfter: quantity };
    }

    const delta = type === 'restock' ? quantity : -quantity;
    const filter =
      type === 'restock'
        ? { _id: bookId }
        : { _id: bookId, stock: { $gte: quantity } };

    const book = await this.bookModel
      .findOneAndUpdate(
        filter,
        { $inc: { stock: delta } },
        { new: true, session },
      )
      .select('stock')
      .lean<{ stock: number }>();

    if (book) return { delta, balanceAfter: book.stock };

    const current = await this.bookModel
      .findById(bookId, { stock: 1 }, { session })
      .lean<{ stock?: number }>();

    if (!current) throw this.bookNotFound();
    throw new BadRequestException({
      msg: `Only ${Math.max(0, current.stock ?? 0)} in stock, so ${quantity} cannot be removed`,
    });
  }

  private async insufficientStock(
    line: SaleLine,
    session: ClientSession,
  ): Promise<BadRequestException> {
    const book = await this.bookModel
      .findById(line.bookId, { title: 1, stock: 1 }, { session })
      .lean<{ title: string; stock?: number }>();

    if (!book) {
      return new BadRequestException({
        msg: 'A book in your order is no longer available',
      });
    }
    return new BadRequestException({
      msg: `Insufficient stock for "${book.title}". Available: ${Math.max(0, book.stock ?? 0)}, Requested: ${line.quantity}`,
    });
  }

  private saleMovement(
    line: SaleLine,
    delta: number,
    balanceAfter: number,
    reason: StockMovementReason,
    context: SaleContext,
    note?: string,
  ): NewMovement {
    return {
      bookId: line.bookId,
      delta,
      balanceAfter,
      reason,
      orderCode: context.orderCode,
      actorId: context.actorId ?? null,
      note,
    };
  }

  private bookNotFound(): NotFoundException {
    return new NotFoundException({ msg: 'Book not found' });
  }
}
