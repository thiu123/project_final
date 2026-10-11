import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Trim } from '../../../common/decorators/trim.decorator';
import {
  STOCK_MOVEMENT_REASONS,
  StockMovementReason,
} from '../schemas/stock-movement.schema';

export const MAX_ADJUST_QUANTITY = 100_000;
export const MAX_INVENTORY_PAGE_SIZE = 100;

export const STOCK_ADJUSTMENTS = ['restock', 'damage', 'count'] as const;
export type StockAdjustment = (typeof STOCK_ADJUSTMENTS)[number];

export const STOCK_STATUSES = ['in', 'low', 'out', 'oversold'] as const;
export type StockStatus = (typeof STOCK_STATUSES)[number];

export const STOCK_SORTS = [
  'stock_asc',
  'stock_desc',
  'title_asc',
  'sold_desc',
] as const;
export type StockSort = (typeof STOCK_SORTS)[number];

export class AdjustStockDto {
  @IsIn(STOCK_ADJUSTMENTS, {
    message: 'Adjustment type must be restock, damage or count',
  })
  type: StockAdjustment;

  @Type(() => Number)
  @IsInt({ message: 'Quantity must be a whole number' })
  @Min(0, { message: 'Quantity cannot be negative' })
  @Max(MAX_ADJUST_QUANTITY)
  quantity: number;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(200)
  note?: string;
}

class InventoryPageQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_INVENTORY_PAGE_SIZE)
  limit: number = 20;
}

export class QueryStockDto extends InventoryPageQuery {
  @IsOptional()
  @Trim()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(STOCK_STATUSES)
  status?: StockStatus;

  @IsOptional()
  @IsIn(STOCK_SORTS)
  sort: StockSort = 'stock_asc';
}

export class QueryMovementsDto extends InventoryPageQuery {
  @IsOptional()
  @IsMongoId()
  bookId?: string;

  @IsOptional()
  @IsIn(STOCK_MOVEMENT_REASONS)
  reason?: StockMovementReason;
}
