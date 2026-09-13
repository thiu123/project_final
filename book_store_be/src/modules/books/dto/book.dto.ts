import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Trim } from '../../../common/decorators/trim.decorator';

export class CreateBookDto {
  @Trim()
  @IsString()
  key: string;

  @Trim()
  @IsString()
  title: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'At least one author is required' })
  @IsString({ each: true })
  authors: string[];

  @IsOptional()
  @IsString()
  cover_url?: string;

  @IsOptional()
  @IsString()
  pdf_url?: string | null;

  @IsOptional()
  @IsInt()
  first_publish_year?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subjects?: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sold?: number;
}

export class UpdateBookDto {
  @IsOptional()
  @Trim()
  @IsString()
  key?: string;

  @IsOptional()
  @Trim()
  @IsString()
  title?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one author is required' })
  @IsString({ each: true })
  authors?: string[];

  @IsOptional()
  @IsString()
  cover_url?: string;

  @IsOptional()
  @IsString()
  pdf_url?: string | null;

  @IsOptional()
  @IsInt()
  first_publish_year?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subjects?: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sold?: number;
}
