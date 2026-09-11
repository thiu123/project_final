import type { Order, User } from "@/types";

/**
 * `userId` is populated on admin endpoints and a bare id elsewhere; this
 * narrows it in one place rather than in each screen that renders a customer.
 */
export function orderUser(order: Order): User | null {
  return typeof order.userId === "object" && order.userId !== null
    ? order.userId
    : null;
}

/** Admin screens quote the stored VND amount rather than converting to USD. */
export function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export function formatDateTime(date?: string): string {
  if (!date) return "";
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
