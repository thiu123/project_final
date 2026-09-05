import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { SortOrder } from 'mongoose';

export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 100;

export enum BookSort {
  Newest = 'newest',
  Oldest = 'oldest',
  TitleAsc = 'title_asc',
  TitleDesc = 'title_desc',
  PriceAsc = 'price_asc',
  PriceDesc = 'price_desc',
  Rating = 'rating',
  BestSelling = 'bestselling',
}

/**
 * Mongo sort spec per option. `_id` is appended as a tiebreaker so paging is
 * stable when many documents share the same sort value.
 */
export const BOOK_SORT_SPEC: Record<BookSort, Record<string, SortOrder>> = {
  [BookSort.Newest]: { createdAt: -1, _id: -1 },
  [BookSort.Oldest]: { createdAt: 1, _id: 1 },
  [BookSort.TitleAsc]: { title: 1, _id: 1 },
  [BookSort.TitleDesc]: { title: -1, _id: -1 },
  [BookSort.PriceAsc]: { price: 1, _id: 1 },
  [BookSort.PriceDesc]: { price: -1, _id: -1 },
  [BookSort.Rating]: { rating: -1, _id: -1 },
  [BookSort.BestSelling]: { sold: -1, _id: -1 },
};

/** Query strings arrive as text, so booleans need explicit coercion. */
const toBoolean = ({ value }: { value: unknown }): unknown => {
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return value;
};

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class QueryBooksDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  limit: number = DEFAULT_PAGE_SIZE;

  /** Category or subcategory; a category also matches its subcategories. */
  @IsOptional()
  @Transform(trim)
  @IsString()
  subject?: string;

  /** Case-insensitive substring match on title and authors. */
  @IsOptional()
  @Transform(trim)
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(BookSort)
  sort: BookSort = BookSort.Newest;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  maxPrice?: number;

  /** Only books with stock left (ebooks always have stock 0, so they drop out). */
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  inStock?: boolean;

  /**
   * Descriptions are omitted by default because they dominate the payload and
   * no listing card renders them. The admin panel opts back in so its edit
   * dialog can prefill the field.
   */
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  withDescription?: boolean;
}
