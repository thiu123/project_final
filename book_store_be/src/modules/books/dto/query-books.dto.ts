import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { SortOrder } from 'mongoose';
import { Trim } from '../../../common/decorators/trim.decorator';

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

// `_id` is the tiebreaker so paging stays stable when values are equal.
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

  @IsOptional()
  @Trim()
  @IsString()
  subject?: string;

  @IsOptional()
  @Trim()
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

  @IsOptional()
  @Transform(
    ({ value }: { value: unknown }) => value === 'true' || value === true,
  )
  @IsBoolean()
  inStock?: boolean;
}
