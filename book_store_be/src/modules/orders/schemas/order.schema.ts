import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  ORDER_STATUSES,
  OrderStatus,
  PAYMENT_METHODS,
  PaymentMethod,
  PRODUCT_TYPES,
  ProductType,
} from '../../../constants/app.constants';

@Schema()
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Book', required: true })
  bookId: Types.ObjectId;

  @Prop({ type: Number, required: true })
  quantity: number;

  @Prop({ type: String, enum: PRODUCT_TYPES, default: 'hardbook' })
  productType: ProductType;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

export interface OrderVoucher {
  code?: string;
  discountAmount: number;
}

@Schema({ timestamps: true })
export class Order {
  /** Human-readable id also used as the payment gateway transaction reference. */
  @Prop({ type: String, required: true, unique: true })
  orderId: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: [OrderItemSchema], default: [] })
  items: Types.DocumentArray<OrderItem>;

  /** Total in VND. */
  @Prop({ type: Number, required: true })
  total: number;

  @Prop(
    raw({
      code: { type: String },
      discountAmount: { type: Number, default: 0 },
    }),
  )
  voucher?: OrderVoucher;

  @Prop({ type: String, enum: PAYMENT_METHODS, required: true })
  paymentMethod: PaymentMethod;

  @Prop({ type: String, enum: ORDER_STATUSES, default: 'Pending' })
  status: OrderStatus;

  @Prop({ type: Boolean, default: false })
  confirmedByAdmin: boolean;

  @Prop({ type: Date })
  confirmedAt?: Date;
}

export type OrderDocument = HydratedDocument<Order>;
export const OrderSchema = SchemaFactory.createForClass(Order);
