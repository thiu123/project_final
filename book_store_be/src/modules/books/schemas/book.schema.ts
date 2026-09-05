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

/**
 * Indexes backing the list endpoint's sort options.
 *
 * The collection already carries these hand-built indexes, so they are
 * deliberately NOT redeclared here (Mongoose would try to recreate them under
 * a different auto-generated name and MongoDB rejects that):
 *   subject_price_index      { subjects: 1, price: 1 }
 *   price_index              { price: 1 }
 *   rating_index             { rating: -1 }
 *   publication_year_index   { first_publish_year: -1 }
 *   created_at_index         { createdAt: -1 }
 *   text_search_index        text on title (weight 10) + authors (weight 5)
 */

// Category browsing sorted by newest is the single most common query.
BookSchema.index({ subjects: 1, createdAt: -1 });
// Backs sort=bestselling and the best-seller home groups.
BookSchema.index({ sold: -1 });
// Backs sort=title_asc / title_desc.
BookSchema.index({ title: 1 });
