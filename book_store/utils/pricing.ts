import type { Order, ProductType } from "@/types";

/**
 * Orders are stored in VND by the backend but every screen quotes USD, so the
 * two units meet here rather than as a bare `/ 24000` scattered through
 * templates.
 */
const VND_PER_USD = 24000;

/** Ebooks are sold at a flat discount off the hardback price. */
export const EBOOK_PRICE_RATIO = 0.7;

export function vndToUsd(amountVnd: number): number {
  return amountVnd / VND_PER_USD;
}

/** `$12.34`, from an amount already in USD. */
export function formatUsd(amountUsd: number): string {
  return `$${amountUsd.toFixed(2)}`;
}

/** `$12.34`, from an amount the backend stored in VND. */
export function formatVndAsUsd(amountVnd: number): string {
  return formatUsd(vndToUsd(amountVnd));
}

/** Unit price for one copy, after the ebook discount. */
export function unitPrice(basePrice = 0, productType?: ProductType): number {
  return productType === "ebook" ? basePrice * EBOOK_PRICE_RATIO : basePrice;
}

/** Line total for an order/cart item, after the ebook discount. */
export function lineTotal(item: {
  bookId?: { price?: number } | null;
  quantity?: number;
  productType?: ProductType;
}): number {
  return unitPrice(item.bookId?.price ?? 0, item.productType) * (item.quantity ?? 0);
}

/**
 * What the order cost before the voucher came off. `total` is already net of
 * the discount, so the discount is added back rather than recomputed from the
 * items (which may have changed price since).
 */
export function orderSubtotalVnd(order: Pick<Order, "total" | "voucher">): number {
  return order.total + (order.voucher?.discountAmount ?? 0);
}
