import type { Voucher } from "@/types";

/** A voucher this close to its expiry date is flagged in the admin table. */
const EXPIRING_SOON_DAYS = 7;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function isExpired(date: string): boolean {
  return new Date(date).getTime() < Date.now();
}

export function isExpiringSoon(date: string): boolean {
  const daysLeft = Math.ceil((new Date(date).getTime() - Date.now()) / MS_PER_DAY);
  return daysLeft > 0 && daysLeft <= EXPIRING_SOON_DAYS;
}

export function formatVoucherDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** `yyyy-mm-dd`, the format an `<input type="date">` accepts. */
export function toDateInputValue(date: string): string {
  return new Date(date).toISOString().split("T")[0];
}

/** Colours the usage badge as a voucher approaches its redemption limit. */
export function usageClass(voucher: Voucher): string {
  if (!voucher.usageLimit) return "bg-info/15 text-info";

  const used = ((voucher.usedCount ?? 0) / voucher.usageLimit) * 100;
  if (used >= 90) return "bg-destructive/15 text-destructive";
  if (used >= 70) return "bg-warning/15 text-warning";
  return "bg-success/15 text-success";
}

/** How the discount reads in a table cell: `20%` or `$5`. */
export function formatDiscount(voucher: Voucher): string {
  return voucher.discountType === "percentage"
    ? `${voucher.discountValue}%`
    : `$${voucher.discountValue}`;
}
