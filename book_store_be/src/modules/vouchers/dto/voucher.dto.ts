import { DiscountType } from '../schemas/voucher.schema';

export class ValidateVoucherDto {
  code: string;
  orderAmount: number;
}

export class ApplyVoucherDto {
  code: string;
}

export class CreateVoucherDto {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number | null;
  expiryDate: Date | string;
  isActive?: boolean;
  usageLimit?: number | null;
  description?: string;
}

export type UpdateVoucherDto = Partial<CreateVoucherDto>;
