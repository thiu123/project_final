import type { Order, OrderStatus, PaymentMethod } from "@/types";

/**
 * Mirror of the backend's admin transition table
 * (book_store_be/src/modules/orders/order-transitions.ts).
 *
 * This copy only decides what the dropdown offers; the server is the authority
 * and rejects anything else. Keep the two in step — if they drift, the worst
 * case is an option that the API refuses with a clear message.
 */
const ADMIN_TRANSITIONS: Record<
  "prepaid" | "cod",
  Partial<Record<OrderStatus, OrderStatus[]>>
> = {
  // VNPay/MoMo settle themselves: the gateway owns Pending, Paid and Failed.
  prepaid: {
    Pending: ["Cancelled"],
    Paid: ["Confirmed", "Cancelled"],
    Confirmed: ["In Delivery", "Cancelled"],
    "In Delivery": ["Delivered"],
  },
  // Nothing reports a cash payment, so an admin marks COD Paid by hand — but
  // only after the courier has actually been to the door.
  cod: {
    Pending: ["Confirmed", "Cancelled"],
    Confirmed: ["In Delivery", "Cancelled"],
    "In Delivery": ["Delivered", "Failed"],
    Delivered: ["Paid"],
  },
};

/** Statuses an admin may move this order into next. Empty means terminal. */
export function allowedTransitions(
  paymentMethod: PaymentMethod,
  status: OrderStatus
): OrderStatus[] {
  return ADMIN_TRANSITIONS[paymentMethod === "COD" ? "cod" : "prepaid"][
    status
  ] ?? [];
}

/**
 * Whether the money for this order is actually in.
 *
 * Prepaid orders are settled by the gateway and stay settled through every
 * later fulfilment state. COD orders are not paid until an admin says the cash
 * came back, so a delivered-but-unsettled COD order is revenue we do not have.
 */
export function isPaidFor(order: Order): boolean {
  if (order.paymentMethod === "COD") return order.status === "Paid";
  return ["Paid", "Confirmed", "In Delivery", "Delivered"].includes(
    order.status
  );
}
