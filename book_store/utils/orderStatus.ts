import type { Component } from "vue";
import {
  Ban,
  Banknote,
  CheckCircle2,
  Clock,
  CreditCard,
  HelpCircle,
  PackageCheck,
  ShieldCheck,
  Truck,
  Wallet,
  XCircle,
} from "lucide-vue-next";
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

// ---------------------------------------------------------------------------
// Presentation — one definition of how a status looks, shared by the customer
// order pages, the profile order list and both admin screens.
// ---------------------------------------------------------------------------

/** Badge variants exposed by `components/ui/badge`. */
export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "success"
  | "warning"
  | "info"
  | "outline"
  | "muted";

interface StatusStyle {
  variant: BadgeVariant;
  /**
   * Extra classes for the two statuses whose colors (purple / teal) have no
   * badge variant of their own. Empty for every other status.
   */
  class: string;
  icon: Component;
}

const STATUS_STYLES: Record<OrderStatus, StatusStyle> = {
  Pending: { variant: "warning", class: "", icon: Clock },
  Paid: { variant: "success", class: "", icon: CheckCircle2 },
  Confirmed: { variant: "info", class: "", icon: ShieldCheck },
  "In Delivery": {
    variant: "default",
    class: "bg-purple-600 text-purple-50 dark:bg-purple-500",
    icon: Truck,
  },
  Delivered: {
    variant: "default",
    class: "bg-teal-600 text-teal-50 dark:bg-teal-500",
    icon: PackageCheck,
  },
  Cancelled: { variant: "muted", class: "", icon: Ban },
  Failed: { variant: "destructive", class: "", icon: XCircle },
};

const UNKNOWN_STATUS: StatusStyle = {
  variant: "muted",
  class: "",
  icon: HelpCircle,
};

/** Tolerates the loose `string | undefined` that some templates pass in. */
function styleFor(status?: string): StatusStyle {
  if (!status) return UNKNOWN_STATUS;
  const match = (Object.keys(STATUS_STYLES) as OrderStatus[]).find(
    (key) => key.toLowerCase() === status.toLowerCase()
  );
  return match ? STATUS_STYLES[match] : UNKNOWN_STATUS;
}

export function orderStatusVariant(status?: string): BadgeVariant {
  return styleFor(status).variant;
}

export function orderStatusClass(status?: string): string {
  return styleFor(status).class;
}

export function orderStatusIcon(status?: string): Component {
  return styleFor(status).icon;
}

// ---------------------------------------------------------------------------
// Payment methods
// ---------------------------------------------------------------------------

const PAYMENT_STYLES: Record<
  PaymentMethod,
  { class: string; icon: Component }
> = {
  Vnpay: { class: "border-primary/40 text-primary", icon: CreditCard },
  Momo: { class: "border-success/40 text-success", icon: Wallet },
  // COD is the one that still owes money, so it reads as a warning.
  COD: { class: "border-warning/40 text-warning", icon: Banknote },
};

export function paymentMethodClass(method: PaymentMethod): string {
  return PAYMENT_STYLES[method]?.class ?? "border-border text-muted-foreground";
}

export function paymentMethodIcon(method: PaymentMethod): Component {
  return PAYMENT_STYLES[method]?.icon ?? Wallet;
}
