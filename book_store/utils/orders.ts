import type {
  Order,
  OrderStatus,
  OrderStatusEvent,
  StatusActor,
  User,
} from "@/types";

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

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000_000],
  ["month", 2_592_000_000],
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
];

export function formatRelativeTime(date?: string): string {
  if (!date) return "";

  const diff = new Date(date).getTime() - Date.now();
  if (Number.isNaN(diff) || Math.abs(diff) < 60_000) return "just now";

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, ms] of RELATIVE_UNITS) {
    if (Math.abs(diff) >= ms) {
      return formatter.format(Math.round(diff / ms), unit);
    }
  }
  return "just now";
}

export function formatDuration(ms: number): string {
  if (ms < 60_000) return "under a minute";

  const totalMinutes = Math.floor(ms / 60_000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days) return hours ? `${days}d ${hours}h` : `${days}d`;
  if (hours) return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
  return `${minutes}m`;
}

export interface OrderTimelineEntry {
  status: OrderStatus;
  actor: StatusActor;
  by: string;
  note?: string;
  at?: string;
  recorded: boolean;
  sincePrevMs?: number;
}

const ACTOR_LABELS: Record<StatusActor, string> = {
  system: "System",
  customer: "Customer",
  admin: "Admin",
  gateway: "Payment gateway",
};

function actorLabel(event: OrderStatusEvent, order: Order): string {
  if (typeof event.actorId === "object" && event.actorId !== null) {
    const name = event.actorId.username || event.actorId.email;
    if (name) return event.actor === "admin" ? `${name} (admin)` : name;
  }
  if (event.actor === "gateway") return `${order.paymentMethod} gateway`;
  return ACTOR_LABELS[event.actor] ?? ACTOR_LABELS.system;
}

export function buildOrderTimeline(order: Order): OrderTimelineEntry[] {
  const history = [...(order.statusHistory ?? [])].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
  );

  const entries: OrderTimelineEntry[] = history.map((event) => ({
    status: event.status,
    actor: event.actor,
    by: actorLabel(event, order),
    note: event.note,
    at: event.at,
    recorded: true,
  }));

  if (!entries.length || entries[0].status !== "Pending") {
    entries.unshift({
      status: "Pending",
      actor: "customer",
      by: ACTOR_LABELS.customer,
      note: `Order placed via ${order.paymentMethod}`,
      at: order.createdAt,
      recorded: false,
    });
  }

  if (!history.length && order.status !== "Pending") {
    entries.push({
      status: order.status,
      actor: "system",
      by: ACTOR_LABELS.system,
      note: "This order predates status history, so the steps in between were not recorded",
      at: order.updatedAt ?? order.createdAt,
      recorded: false,
    });
  }

  let previous: number | null = null;
  for (const entry of entries) {
    const time = entry.at ? new Date(entry.at).getTime() : null;
    if (time === null || Number.isNaN(time)) continue;
    if (previous !== null) entry.sincePrevMs = time - previous;
    previous = time;
  }

  return entries;
}
