export const EXCHANGE_RATE_USD_TO_VND = 24000;
export const EBOOK_PRICE_RATIO = 0.7;
export const BOOK_CACHE_TTL_SECONDS = 1800;

export const ORDER_STATUSES = [
  'Pending',
  'Paid',
  'Confirmed',
  'In Delivery',
  'Delivered',
  'Cancelled',
  'Failed',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

// Statuses that mean the customer already has access to what they bought.
export const PAID_ORDER_STATUSES: OrderStatus[] = [
  'Paid',
  'Confirmed',
  'In Delivery',
  'Delivered',
];

export const STATUS_ACTORS = [
  'system',
  'customer',
  'admin',
  'gateway',
] as const;
export type StatusActor = (typeof STATUS_ACTORS)[number];

export const PRODUCT_TYPES = ['hardbook', 'ebook'] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export const PAYMENT_METHODS = ['COD', 'Momo', 'Vnpay'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
