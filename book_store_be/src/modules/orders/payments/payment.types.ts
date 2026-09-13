// Input shared by every payment gateway. Amount is in VND.
export interface PaymentRequest {
  orderId: string;
  amount: number;
}
