import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import {
  ApplyVoucherDto,
  CreateVoucherDto,
  UpdateVoucherDto,
  ValidateVoucherDto,
} from './dto/voucher.dto';
import { Voucher, VoucherDocument } from './schemas/voucher.schema';

export type VoucherRejectReason = 'INVALID' | 'EXPIRED' | 'USAGE_LIMIT' | 'MIN_AMOUNT';

export type VoucherCheckResult =
  | { ok: true; voucher: VoucherDocument; discountAmount: number }
  | { ok: false; reason: VoucherRejectReason; voucher: VoucherDocument | null };

@Injectable()
export class VouchersService {
  private readonly logger = new Logger(VouchersService.name);

  constructor(
    @InjectModel(Voucher.name) private readonly voucherModel: Model<VoucherDocument>,
  ) {}

  /**
   * Shared voucher rule engine used by the validate endpoint and by checkout.
   * Returns the discount (same unit as `orderAmount`) or the reason the voucher
   * cannot be applied; callers pick their own wording for each reason.
   */
  async checkVoucher(code: string, orderAmount: number): Promise<VoucherCheckResult> {
    const voucher = await this.findActiveByCode(code);
    if (!voucher) {
      return { ok: false, reason: 'INVALID', voucher: null };
    }

    if (new Date() > voucher.expiryDate) {
      return { ok: false, reason: 'EXPIRED', voucher };
    }

    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
      return { ok: false, reason: 'USAGE_LIMIT', voucher };
    }

    if (orderAmount < voucher.minOrderAmount) {
      return { ok: false, reason: 'MIN_AMOUNT', voucher };
    }

    let discountAmount: number;
    if (voucher.discountType === 'percentage') {
      discountAmount = (orderAmount * voucher.discountValue) / 100;
      if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
        discountAmount = voucher.maxDiscount;
      }
    } else {
      discountAmount = voucher.discountValue;
    }

    // Never discount more than the order itself
    if (discountAmount > orderAmount) {
      discountAmount = orderAmount;
    }

    return { ok: true, voucher, discountAmount };
  }

  async validateVoucher(dto: ValidateVoucherDto) {
    const { code, orderAmount } = dto;

    if (!code || !orderAmount) {
      throw new HttpException(
        { success: false, message: 'Voucher code and order amount are required' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.checkVoucher(code, orderAmount);
    if (!result.ok) {
      const messages: Record<VoucherRejectReason, string> = {
        INVALID: 'Invalid voucher code',
        EXPIRED: 'This voucher has expired',
        USAGE_LIMIT: 'This voucher has reached its usage limit',
        MIN_AMOUNT: `Minimum order amount is $${result.voucher?.minOrderAmount ?? 0}`,
      };
      const status = result.reason === 'INVALID' ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;
      throw new HttpException({ success: false, message: messages[result.reason] }, status);
    }

    const { voucher, discountAmount } = result;
    return {
      success: true,
      data: {
        voucher: {
          code: voucher.code,
          discountType: voucher.discountType,
          discountValue: voucher.discountValue,
          description: voucher.description,
        },
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        finalAmount: parseFloat((orderAmount - discountAmount).toFixed(2)),
      },
    };
  }

  /** Acknowledges a voucher; usage is actually counted on successful payment. */
  async applyVoucher(dto: ApplyVoucherDto) {
    const { code } = dto;
    if (!code) {
      throw new HttpException(
        { success: false, message: 'Voucher code is required' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const voucher = await this.findActiveByCode(code);
    if (!voucher) {
      throw new HttpException(
        { success: false, message: 'Invalid voucher code' },
        HttpStatus.NOT_FOUND,
      );
    }

    await voucher.save();
    return { success: true, message: 'Voucher applied successfully' };
  }

  /**
   * Public storefront callers pass `activeOnly=true` to only see vouchers a
   * customer could redeem right now; the admin panel omits it to manage all.
   */
  async getAllVouchers(activeOnly?: string) {
    const filter: FilterQuery<VoucherDocument> = {};

    if (activeOnly === 'true') {
      filter.isActive = true;
      filter.expiryDate = { $gt: new Date() };
      filter.$expr = {
        $or: [{ $eq: ['$usageLimit', null] }, { $lt: ['$usedCount', '$usageLimit'] }],
      };
    }

    return this.voucherModel.find(filter).select('-__v').sort({ createdAt: -1 });
  }

  async createVoucher(dto: CreateVoucherDto) {
    const existing = await this.voucherModel.findOne({ code: dto.code.toUpperCase() });
    if (existing) {
      throw new HttpException(
        { success: false, message: 'Voucher code already exists' },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const voucher = await new this.voucherModel(dto).save();
      return { success: true, message: 'Voucher created successfully', data: voucher };
    } catch (error) {
      throw this.wrapError('Error creating voucher', error);
    }
  }

  async updateVoucher(id: string, dto: UpdateVoucherDto) {
    let voucher: VoucherDocument | null;
    try {
      voucher = await this.voucherModel.findByIdAndUpdate(id, dto, {
        new: true,
        runValidators: true,
      });
    } catch (error) {
      throw this.wrapError('Error updating voucher', error);
    }

    if (!voucher) {
      throw new HttpException(
        { success: false, message: 'Voucher not found' },
        HttpStatus.NOT_FOUND,
      );
    }
    return { success: true, message: 'Voucher updated successfully', data: voucher };
  }

  async deleteVoucher(id: string) {
    const voucher = await this.voucherModel.findByIdAndDelete(id);
    if (!voucher) {
      throw new HttpException(
        { success: false, message: 'Voucher not found' },
        HttpStatus.NOT_FOUND,
      );
    }
    return { success: true, message: 'Voucher deleted successfully' };
  }

  /** Increments / decrements `usedCount` (called when payment succeeds or an order is cancelled). */
  async adjustUsage(code: string, delta: 1 | -1): Promise<void> {
    const voucher = await this.voucherModel.findOne({ code });
    if (!voucher) return;
    if (delta < 0 && voucher.usedCount <= 0) return;

    voucher.usedCount += delta;
    await voucher.save();
    this.logger.log(`Voucher ${code} usage ${delta > 0 ? 'incremented' : 'decremented'} to ${voucher.usedCount}`);
  }

  private findActiveByCode(code: string) {
    return this.voucherModel.findOne({ code: code.toUpperCase(), isActive: true });
  }

  private wrapError(message: string, error: unknown): HttpException {
    this.logger.error(`${message}: ${(error as Error).message}`);
    return new HttpException(
      { success: false, message, error: (error as Error).message },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
