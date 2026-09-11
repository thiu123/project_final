// Shared domain types, mirrored from the Mongoose models in book_store_be/model.

export type ProductType = "hardbook" | "ebook";

export type OrderStatus =
  | "Pending"
  | "Paid"
  | "Confirmed"
  | "In Delivery"
  | "Delivered"
  | "Cancelled"
  | "Failed";

export type PaymentMethod = "COD" | "Momo" | "Vnpay";

export interface Book {
  _id: string;
  key: string;
  title: string;
  cover_url?: string;
  pdf_url?: string | null;
  first_publish_year?: number;
  authors: string[];
  price: number;
  subjects: string[];
  description?: string;
  rating?: number;
  stock: number;
  sold: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  googleId?: string;
  avatar_url?: string | null;
  admin: boolean;
  accessToken?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  _id?: string;
  bookId: Book | null;
  quantity: number;
  productType: ProductType;
}

export interface Cart {
  _id?: string;
  userId?: string;
  items: CartItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  _id?: string;
  bookId: Book | null;
  quantity: number;
  productType: ProductType;
}

/**
 * Delivery details captured at checkout. Required for COD; older orders and
 * prepaid ones may not carry it, hence optional on `Order`.
 */
export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  note?: string;
}

export interface Order {
  _id: string;
  orderId: string;
  userId: User | string;
  items: OrderItem[];
  total: number;
  voucher?: {
    code?: string;
    discountAmount: number;
  };
  shipping?: ShippingAddress;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  confirmedByAdmin: boolean;
  confirmedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewReply {
  _id?: string;
  adminId: User | string;
  content: string;
  createdAt?: string;
}

export interface Review {
  _id: string;
  userId: User | string;
  bookId: Book | string;
  rating: number;
  comment: string;
  replies?: ReviewReply[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Contact {
  _id: string;
  user: User | string;
  username?: string;
  message: string;
  createdAt?: string;
  updatedAt?: string;
}

export type DiscountType = "percentage" | "fixed";

export interface Voucher {
  _id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number | null;
  expiryDate: string;
  isActive: boolean;
  usageLimit?: number | null;
  usedCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Favorite {
  _id: string;
  userId: string;
  bookId: Book | string;
  createdAt?: string;
}

/** A catalogue book the advisor named, already resolved to a real row. */
export interface ReferencedBook {
  bookId: string;
  title: string;
  subjects: string[];
  price: number;
  rating: number | null;
  inStock: boolean;
}

export interface ChatMessage {
  id: number;
  type: "user" | "bot";
  text: string;
  timestamp: Date;
  /** Books to render as cards under a bot reply. */
  books?: ReferencedBook[];
  /** Set when the turn failed, so the bubble can be styled as an error. */
  failed?: boolean;
}

export interface ChatReply {
  reply: string;
  books: ReferencedBook[];
}

export interface SnackbarPayload {
  message: string;
  color?: "success" | "error" | "warning" | "info";
}

// ---------------------------------------------------------------------------
// Catalogue querying — pagination, filtering and sorting all happen server-side
// ---------------------------------------------------------------------------

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

export type BookSort =
  | "newest"
  | "oldest"
  | "title_asc"
  | "title_desc"
  | "price_asc"
  | "price_desc"
  | "rating"
  | "bestselling";

/** Query accepted by `GET /api/books`. Every field is optional. */
export interface BookQuery {
  page?: number;
  limit?: number;
  /** Category or subcategory; a category also matches its subcategories. */
  subject?: string;
  /** Substring match on title and authors. */
  search?: string;
  sort?: BookSort;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

/** A node of the category tree served by `GET /api/books/categories`. */
export interface CategoryNode {
  name: string;
  slug: string;
  /** Value to pass as `?subject=`. */
  subject: string;
  /** Includes every subcategory below this node. */
  count: number;
  cover_url: string | null;
  subcategories: CategoryNode[];
}

/** Payload of `GET /api/books/home`. */
export interface HomePayload {
  latest: Book[];
  /** Newest books per home carousel, keyed by subject. */
  groups: Record<string, Book[]>;
  bestSellers: Book[];
  categories: CategoryNode[];
}

/**
 * The checkout handoff. The cart page writes the selected rows to
 * `localStorage["checkoutItems"]` and the order page reads them back — the two
 * screens are separate route loads, so the shape has to be written down.
 */
export interface CheckoutItem {
  bookId: string;
  title: string;
  /** First author only; the review list shows a single name. */
  authors?: string;
  cover_url?: string;
  price: number;
  quantity: number;
  productType: ProductType;
  subjects?: string[];
  stock?: number;
}

/** Key under which `CheckoutItem[]` is handed from the cart to the order page. */
export const CHECKOUT_ITEMS_KEY = "checkoutItems";
