import { Transform, Type } from 'class-transformer';
import {
  IsDefined,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Trim, TrimSpaces } from '../../../common/decorators/trim.decorator';
import { ORDER_STATUSES, OrderStatus } from '../../../constants/app.constants';

export class CheckoutDto {
  @IsOptional()
  @Trim()
  @IsString()
  voucherCode?: string;
}

export class ShippingAddressDto {
  @TrimSpaces()
  @IsString()
  @IsNotEmpty({ message: 'Recipient name is required' })
  @MaxLength(100)
  fullName: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.replace(/[\s.-]/g, '') : value,
  )
  @IsString()
  @Matches(/^(0|\+84)\d{9}$/, {
    message: 'Phone must be a Vietnamese mobile number, e.g. 0912345678',
  })
  phone: string;

  @TrimSpaces()
  @IsString()
  @MinLength(10, { message: 'Please give a full delivery address' })
  @MaxLength(255)
  address: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(255)
  note?: string;
}

export class CodCheckoutDto {
  @IsOptional()
  @Trim()
  @IsString()
  voucherCode?: string;

  // @ValidateNested passes silently on a missing object, so presence is
  // asserted separately.
  @IsDefined({ message: 'Shipping information is required' })
  @IsObject({ message: 'Shipping information is required' })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shipping: ShippingAddressDto;
}

export class UpdateOrderStatusDto {
  @IsIn(ORDER_STATUSES, { message: 'Invalid status' })
  status: OrderStatus;
}

export interface VnpayReturnQuery {
  vnp_ResponseCode?: string;
  vnp_TxnRef?: string;
  [key: string]: string | undefined;
}

export interface MomoReturnQuery {
  resultCode?: string | number;
  orderId?: string;
  [key: string]: string | number | undefined;
}
