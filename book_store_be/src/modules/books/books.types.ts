import { Types } from 'mongoose';
import { Book } from './schemas/book.schema';

/** A `.lean()` row: the schema fields plus the `_id` Mongoose always returns. */
export type LeanBook = Book & { _id: Types.ObjectId };

/** One node of the category tree returned by `GET /api/books/categories`. */
export interface CategoryNode {
  /** Display label from the curated taxonomy, e.g. "Literary Fiction". */
  name: string;
  /** URL-safe identifier, e.g. "literary-fiction". */
  slug: string;
  /** Value to send as `?subject=`; the API also accepts the slug. */
  subject: string;
  /** Books in this node, including every subcategory below it. */
  count: number;
  /** Cover of the newest book in this node, for category thumbnails. */
  cover_url: string | null;
  subcategories: CategoryNode[];
}

/** Payload of `GET /api/books/home`. */
export interface HomePayload {
  /** Newest books overall, for the hero and trending strip. */
  latest: Book[];
  /** Newest books per home subject, keyed by the stored subject value. */
  groups: Record<string, Book[]>;
  /** Best sellers overall, by units sold. */
  bestSellers: Book[];
  categories: CategoryNode[];
}
