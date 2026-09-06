import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
// Reference fields use SchemaTypes.ObjectId, never Types.ObjectId: @nestjs/mongoose
// recognises only the former. Given the latter it treats it as a plain class, builds
// an empty definition from it, and the field silently becomes Mixed — which stops
// casting, so ids get stored as raw strings and no longer match id queries.

@Schema()
export class ReviewReply {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  adminId: Types.ObjectId;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const ReviewReplySchema = SchemaFactory.createForClass(ReviewReply);

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Book', required: true })
  bookId: Types.ObjectId;

  @Prop({ type: Number, required: true, min: 0, max: 5 })
  rating: number;

  @Prop({ type: String, required: true })
  comment: string;

  @Prop({ type: [ReviewReplySchema], default: [] })
  replies: Types.DocumentArray<ReviewReply>;

  /** Managed by `timestamps: true`; declared so it can be touched explicitly. */
  updatedAt?: Date;
}

export type ReviewDocument = HydratedDocument<Review>;
export const ReviewSchema = SchemaFactory.createForClass(Review);
