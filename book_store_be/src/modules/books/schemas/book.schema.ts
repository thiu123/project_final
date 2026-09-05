import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Book {
  @Prop({ type: String, unique: true, required: true })
  key: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String })
  cover_url?: string;

  @Prop({ type: String, default: null })
  pdf_url: string | null;

  @Prop({ type: Number })
  first_publish_year?: number;

  @Prop({ type: [String], required: true })
  authors: string[];

  @Prop({ type: Number, default: 0 })
  price: number;

  @Prop({ type: [String], default: [] })
  subjects: string[];

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Number, min: 0, max: 5 })
  rating?: number;

  /** 0 means out of stock, or an ebook (no stock needed). */
  @Prop({ type: Number, default: 0, min: 0 })
  stock: number;

  /** Units sold. */
  @Prop({ type: Number, default: 0, min: 0 })
  sold: number;
}

export type BookDocument = HydratedDocument<Book>;
export const BookSchema = SchemaFactory.createForClass(Book);
