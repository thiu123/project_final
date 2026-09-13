import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

// Reference fields must use SchemaTypes.ObjectId; with Types.ObjectId
// @nestjs/mongoose turns the field into Mixed and ids stop casting.
@Schema()
export class Favorite {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Book', required: true })
  bookId: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export type FavoriteDocument = HydratedDocument<Favorite>;
export const FavoriteSchema = SchemaFactory.createForClass(Favorite);
