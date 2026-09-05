import { OrderStatus } from '../../../constants/app.constants';

export class CheckoutDto {
  voucherCode?: string;
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
