import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import {
  ORDER_STATUSES,
  OrderStatus,
  PAYMENT_METHODS,
  PRODUCT_TYPES,
  PaymentMethod,
  ProductType,
  STATUS_ACTORS,
  StatusActor,
} from '../../../constants/app.constants';

// Reference fields must use SchemaTypes.ObjectId; with Types.ObjectId
// @nestjs/mongoose turns the field into Mixed and ids stop casting.
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

@Schema({ _id: false })
export class OrderStatusEvent {
  @Prop({ type: String, enum: ORDER_STATUSES, required: true })
  status: OrderStatus;

  @Prop({ type: String, enum: STATUS_ACTORS, required: true })
  actor: StatusActor;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', default: null })
  actorId?: Types.ObjectId | null;

  @Prop({ type: String })
  note?: string;

  @Prop({ type: Date, default: Date.now })
  at: Date;
}

export const OrderStatusEventSchema =
  SchemaFactory.createForClass(OrderStatusEvent);

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
  // Public id, also used as the payment gateway transaction reference.
  @Prop({ type: String, required: true, unique: true })
  orderId: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: [OrderItemSchema], default: [] })
  items: Types.DocumentArray<OrderItem>;

  // Total in VND.
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

  @Prop({ type: [OrderStatusEventSchema], default: [] })
  statusHistory: OrderStatusEvent[];

  @Prop({ type: Boolean, default: false })
  inventoryCommitted: boolean;

  @Prop({ type: Boolean, default: false })
  confirmedByAdmin: boolean;

  @Prop({ type: Date })
  confirmedAt?: Date;
}

export type OrderDocument = HydratedDocument<Order>;
export const OrderSchema = SchemaFactory.createForClass(Order);
