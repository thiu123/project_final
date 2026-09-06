import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
// Reference fields use SchemaTypes.ObjectId, never Types.ObjectId: @nestjs/mongoose
// recognises only the former. Given the latter it treats it as a plain class, builds
// an empty definition from it, and the field silently becomes Mixed — which stops
// casting, so ids get stored as raw strings and no longer match id queries.
import { PRODUCT_TYPES, ProductType } from '../../../constants/app.constants';

@Schema()
export class CartItem {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Book', required: true })
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
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  })
  userId: Types.ObjectId;

  @Prop({ type: [CartItemSchema], default: [] })
  items: Types.DocumentArray<CartItem>;
}

export type CartDocument = HydratedDocument<Cart>;
export const CartSchema = SchemaFactory.createForClass(Cart);
