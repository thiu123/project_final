import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import {
  CreateVoucherDto,
  UpdateVoucherDto,
  ValidateVoucherDto,
} from './dto/voucher.dto';
import { Voucher, VoucherDocument } from './schemas/voucher.schema';

export type VoucherRejectReason =
  'INVALID' | 'EXPIRED' | 'USAGE_LIMIT' | 'MIN_AMOUNT';

export type VoucherCheckResult =
  | { ok: true; voucher: VoucherDocument; discountAmount: number }
  | { ok: false; reason: VoucherRejectReason; voucher: VoucherDocument | null };

@Injectable()
export class VouchersService {
  private readonly logger = new Logger(VouchersService.name);

  constructor(
    @InjectModel(Voucher.name)
    private readonly voucherModel: Model<VoucherDocument>,
  ) {}

  // Shared by the validate endpoint and by checkout. Returns the discount in
  // the same unit as `orderAmount`, or why the voucher cannot be used.
  async checkVoucher(
    code: string,
    orderAmount: number,
  ): Promise<VoucherCheckResult> {
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

    let discountAmount = voucher.discountValue;

    if (voucher.discountType === 'percentage') {
      discountAmount = (orderAmount * voucher.discountValue) / 100;
      if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
        discountAmount = voucher.maxDiscount;
      }
    }

    return {
      ok: true,
      voucher,
      discountAmount: Math.min(discountAmount, orderAmount),
    };
  }

  async validateVoucher(dto: ValidateVoucherDto) {
    const result = await this.checkVoucher(dto.code, dto.orderAmount);

    if (!result.ok) {
      const messages: Record<VoucherRejectReason, string> = {
        INVALID: 'Invalid voucher code',
        EXPIRED: 'This voucher has expired',
        USAGE_LIMIT: 'This voucher has reached its usage limit',
        MIN_AMOUNT: `Minimum order amount is $${result.voucher?.minOrderAmount ?? 0}`,
      };
      const body = { success: false, message: messages[result.reason] };

      throw result.reason === 'INVALID'
        ? new NotFoundException(body)
        : new BadRequestException(body);
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
        discountAmount: Number(discountAmount.toFixed(2)),
        finalAmount: Number((dto.orderAmount - discountAmount).toFixed(2)),
      },
    };
  }

  // `activeOnly=true` is the storefront: only vouchers a customer can redeem
  // right now. The admin panel omits it and manages every voucher.
  getAllVouchers(activeOnly?: string) {
    const filter: FilterQuery<VoucherDocument> = {};

    if (activeOnly === 'true') {
      filter.isActive = true;
      filter.expiryDate = { $gt: new Date() };
      filter.$expr = {
        $or: [
          { $eq: ['$usageLimit', null] },
          { $lt: ['$usedCount', '$usageLimit'] },
        ],
      };
    }

    return this.voucherModel
      .find(filter)
      .select('-__v')
      .sort({ createdAt: -1 });
  }

  async createVoucher(dto: CreateVoucherDto) {
    const existing = await this.voucherModel.findOne({
      code: dto.code.toUpperCase(),
    });
    if (existing) {
      throw new BadRequestException({
        success: false,
        message: 'Voucher code already exists',
      });
    }

    const voucher = await new this.voucherModel(dto).save();
    return {
      success: true,
      message: 'Voucher created successfully',
      data: voucher,
    };
  }

  async updateVoucher(id: string, dto: UpdateVoucherDto) {
    const voucher = await this.voucherModel.findByIdAndUpdate(id, dto, {
      new: true,
      runValidators: true,
    });

    if (!voucher) {
      throw new NotFoundException({
        success: false,
        message: 'Voucher not found',
      });
    }

    return {
      success: true,
      message: 'Voucher updated successfully',
      data: voucher,
    };
  }

  async deleteVoucher(id: string) {
    const voucher = await this.voucherModel.findByIdAndDelete(id);
    if (!voucher) {
      throw new NotFoundException({
        success: false,
        message: 'Voucher not found',
      });
    }

    return { success: true, message: 'Voucher deleted successfully' };
  }

  // Called when a payment succeeds (+1) or an order is cancelled (-1).
  async adjustUsage(code: string, delta: 1 | -1): Promise<void> {
    const voucher = await this.voucherModel.findOne({ code });
    if (!voucher) return;
    if (delta < 0 && voucher.usedCount <= 0) return;

    voucher.usedCount += delta;
    await voucher.save();
    this.logger.log(`Voucher ${code} usedCount is now ${voucher.usedCount}`);
  }

  private findActiveByCode(code: string) {
    return this.voucherModel.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });
  }
}
