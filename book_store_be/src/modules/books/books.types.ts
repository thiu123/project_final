import { Types } from 'mongoose';
import { Book } from './schemas/book.schema';

// A `.lean()` row: the schema fields plus the `_id` Mongoose always returns.
export type LeanBook = Book & { _id: Types.ObjectId };

export interface CategoryNode {
  name: string;
  slug: string;
  // Value to send as ?subject=; the API also accepts the slug.
  subject: string;
  // Books in this node, including every subcategory below it.
  count: number;
  cover_url: string | null;
  subcategories: CategoryNode[];
}

export interface HomePayload {
  latest: Book[];
  // Newest books per home subject, keyed by the stored subject value.
  groups: Record<string, Book[]>;
  bestSellers: Book[];
  categories: CategoryNode[];
}
