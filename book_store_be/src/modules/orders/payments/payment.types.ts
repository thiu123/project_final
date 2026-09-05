/** Input shared by every payment gateway adapter. Amount is in VND. */
export interface PaymentRequest {
  orderId: string;
  amount: number;
}
