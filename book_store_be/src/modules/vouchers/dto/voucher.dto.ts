import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { Trim } from '../../../common/decorators/trim.decorator';
import { DISCOUNT_TYPES, DiscountType } from '../schemas/voucher.schema';

export class ValidateVoucherDto {
  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'Voucher code and order amount are required' })
  code: string;

  @IsNumber()
  @IsPositive({ message: 'Voucher code and order amount are required' })
  orderAmount: number;
}

export class CreateVoucherDto {
  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'Voucher code is required' })
  code: string;

  @IsIn(DISCOUNT_TYPES)
  discountType: DiscountType;

  @IsNumber()
  @Min(0)
  discountValue: number;

  @IsDateString({}, { message: 'Expiry date is required' })
  expiryDate: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number | null;

  @IsOptional()
  @Trim()
  @IsString()
  description?: string;
}

export class UpdateVoucherDto {
  @IsOptional()
  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'Voucher code is required' })
  code?: string;

  @IsOptional()
  @IsIn(DISCOUNT_TYPES)
  discountType?: DiscountType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountValue?: number;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number | null;

  @IsOptional()
  @Trim()
  @IsString()
  description?: string;
}
