import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export const DISCOUNT_TYPES = ['percentage', 'fixed'] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

/**
 * Voucher / discount code. Supports percentage and fixed-amount discounts.
 */
@Schema({ timestamps: true })
export class Voucher {
  /** Unique code, e.g. "BOOKSALE10". Stored uppercase & trimmed. */
  @Prop({ type: String, required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ type: String, enum: DISCOUNT_TYPES, required: true })
  discountType: DiscountType;

  /** 10 means 10% (percentage) or 10 currency units (fixed). */
  @Prop({ type: Number, required: true, min: 0 })
  discountValue: number;

  /** Minimum order amount to apply the voucher (0 = no minimum). */
  @Prop({ type: Number, default: 0 })
  minOrderAmount: number;

  /** Cap for percentage discounts (null = uncapped). */
  @Prop({ type: Number, default: null })
  maxDiscount: number | null;

  @Prop({ type: Date, required: true })
  expiryDate: Date;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  /** Total redemptions allowed (null = unlimited). */
  @Prop({ type: Number, default: null })
  usageLimit: number | null;

  @Prop({ type: Number, default: 0 })
  usedCount: number;

  @Prop({ type: String, default: '' })
  description: string;
}

export type VoucherDocument = HydratedDocument<Voucher>;
export const VoucherSchema = SchemaFactory.createForClass(Voucher);
