import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
// Reference fields use SchemaTypes.ObjectId, never Types.ObjectId: @nestjs/mongoose
// recognises only the former. Given the latter it treats it as a plain class, builds
// an empty definition from it, and the field silently becomes Mixed — which stops
// casting, so ids get stored as raw strings and no longer match id queries.

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
