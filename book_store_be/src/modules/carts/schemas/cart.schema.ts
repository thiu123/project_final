import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PRODUCT_TYPES, ProductType } from '../../../constants/app.constants';

@Schema()
export class CartItem {
  @Prop({ type: Types.ObjectId, ref: 'Book', required: true })
  bookId: Types.ObjectId;

  @Prop({ type: Number, required: true, min: 1, default: 1 })
  quantity: number;

  @Prop({ type: String, enum: PRODUCT_TYPES, default: 'hardbook' })
  productType: ProductType;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ timestamps: true })
export class Cart {
  /** Each user has exactly one cart. */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ type: [CartItemSchema], default: [] })
  items: Types.DocumentArray<CartItem>;
}

export type CartDocument = HydratedDocument<Cart>;
export const CartSchema = SchemaFactory.createForClass(Cart);
