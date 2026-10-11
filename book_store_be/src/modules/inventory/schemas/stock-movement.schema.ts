import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export const STOCK_MOVEMENT_REASONS = [
  'restock',
  'sale',
  'cancellation',
  'damage',
  'count',
] as const;
export type StockMovementReason = (typeof STOCK_MOVEMENT_REASONS)[number];

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class StockMovement {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Book', required: true })
  bookId: Types.ObjectId;

  @Prop({ type: Number, required: true })
  delta: number;

  @Prop({ type: Number, required: true })
  balanceAfter: number;

  @Prop({ type: String, enum: STOCK_MOVEMENT_REASONS, required: true })
  reason: StockMovementReason;

  @Prop({ type: String })
  orderCode?: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', default: null })
  actorId?: Types.ObjectId | null;

  @Prop({ type: String })
  note?: string;

  createdAt: Date;
}

export type StockMovementDocument = HydratedDocument<StockMovement>;
export const StockMovementSchema = SchemaFactory.createForClass(StockMovement);

StockMovementSchema.index({ bookId: 1, createdAt: -1 });
StockMovementSchema.index({ reason: 1, createdAt: -1 });
StockMovementSchema.index({ createdAt: -1 });
StockMovementSchema.index({ orderCode: 1 }, { sparse: true });
