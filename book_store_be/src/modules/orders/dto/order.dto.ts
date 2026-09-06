import { Transform, Type } from 'class-transformer';
import {
  IsDefined,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { OrderStatus } from '../../../constants/app.constants';

export class CheckoutDto {
  voucherCode?: string;
}

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

/** Collapses the runs of whitespace a pasted address usually arrives with. */
const tidy = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value;

export class ShippingAddressDto {
  @Transform(tidy)
  @IsString()
  @IsNotEmpty({ message: 'Recipient name is required' })
  @MaxLength(100)
  fullName: string;

  /**
   * Vietnamese mobile number, written locally (`0912345678`) or with the
   * country code (`+84912345678`). The courier calls this before delivering,
   * so an unreachable number costs a real trip.
   */
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.replace(/[\s.-]/g, '') : value,
  )
  @IsString()
  @Matches(/^(0|\+84)\d{9}$/, {
    message: 'Phone must be a Vietnamese mobile number, e.g. 0912345678',
  })
  phone: string;

  @Transform(tidy)
  @IsString()
  @MinLength(10, { message: 'Please give a full delivery address' })
  @MaxLength(255)
  address: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(255)
  note?: string;
}

export class CodCheckoutDto {
  @IsOptional()
  @Transform(trim)
  @IsString()
  voucherCode?: string;

  /**
   * Required: there is nobody to collect from without it. `@ValidateNested`
   * passes silently on an absent object, so presence is asserted separately.
   */
  @IsDefined({ message: 'Shipping information is required' })
  @IsObject({ message: 'Shipping information is required' })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shipping: ShippingAddressDto;
}

export class UpdateOrderStatusDto {
  status: OrderStatus;
}

/** Query string VNPay appends when redirecting back to `/order/vnpay_return`. */
export interface VnpayReturnQuery {
  vnp_ResponseCode?: string;
  vnp_TxnRef?: string;
  [key: string]: string | undefined;
}

/** Query string MoMo appends when redirecting back to `/order/momo_return`. */
export interface MomoReturnQuery {
  resultCode?: string | number;
  orderId?: string;
  [key: string]: string | number | undefined;
}
