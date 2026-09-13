import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { PRODUCT_TYPES, ProductType } from '../../../constants/app.constants';

// Reference fields must use SchemaTypes.ObjectId; with Types.ObjectId
// @nestjs/mongoose turns the field into Mixed and ids stop casting.
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
