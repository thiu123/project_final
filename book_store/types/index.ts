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

export interface ChatMessage {
  id: number;
  type: "user" | "bot";
  text: string;
  timestamp: Date;
}

export interface SnackbarPayload {
  message: string;
  color?: "success" | "error" | "warning" | "info";
}
