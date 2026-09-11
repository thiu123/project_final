import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
// Reference fields use SchemaTypes.ObjectId, never Types.ObjectId: @nestjs/mongoose
// recognises only the former. Given the latter it treats it as a plain class, builds
// an empty definition from it, and the field silently becomes Mixed — which stops
// casting, so ids get stored as raw strings and no longer match id queries.
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
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Book', required: true })
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


export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  note?: string;
}

@Schema({ timestamps: true })
export class Order {
  /** Human-readable id also used as the payment gateway transaction reference. */
  @Prop({ type: String, required: true, unique: true })
  orderId: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
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

  @Prop(
    raw({
      fullName: { type: String },
      phone: { type: String },
      address: { type: String },
      note: { type: String },
    }),
  )
  shipping?: ShippingAddress;

  @Prop({ type: String, enum: PAYMENT_METHODS, required: true })
  paymentMethod: PaymentMethod;

  @Prop({ type: String, enum: ORDER_STATUSES, default: 'Pending' })
  status: OrderStatus;

  @Prop({ type: Boolean, default: false })
  inventoryCommitted: boolean;

  @Prop({ type: Boolean, default: false })
  confirmedByAdmin: boolean;

  @Prop({ type: Date })
  confirmedAt?: Date;
}

export type OrderDocument = HydratedDocument<Order>;
export const OrderSchema = SchemaFactory.createForClass(Order);
