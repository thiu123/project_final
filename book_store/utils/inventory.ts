import type { Component } from "vue";
import {
  ClipboardCheck,
  PackageMinus,
  PackagePlus,
  ShoppingCart,
  Undo2,
} from "lucide-vue-next";
import type { BadgeVariant } from "@/utils/orderStatus";
import type {
  StockMovement,
  StockMovementActor,
  StockMovementBook,
  StockMovementReason,
} from "@/types";

export const LOW_STOCK_THRESHOLD = 10;

interface ReasonStyle {
  label: string;
  tone: BadgeVariant;
  icon: Component;
}

export const MOVEMENT_REASONS: Record<StockMovementReason, ReasonStyle> = {
  restock: { label: "Received", tone: "success", icon: PackagePlus },
  sale: { label: "Sold", tone: "info", icon: ShoppingCart },
  cancellation: { label: "Order cancelled", tone: "warning", icon: Undo2 },
  damage: { label: "Removed", tone: "destructive", icon: PackageMinus },
  count: { label: "Stock count", tone: "muted", icon: ClipboardCheck },
};

export function stockState(
  stock: number,
  lowThreshold = LOW_STOCK_THRESHOLD
): { label: string; tone: BadgeVariant } {
  if (stock < 0) return { label: `Oversold by ${-stock}`, tone: "destructive" };
  if (stock === 0) return { label: "Out of stock", tone: "destructive" };
  if (stock <= lowThreshold) return { label: "Low stock", tone: "warning" };
  return { label: "In stock", tone: "success" };
}

export function formatDelta(delta: number): string {
  if (delta > 0) return `+${delta}`;
  if (delta < 0) return `−${Math.abs(delta)}`;
  return "0";
}

export function deltaClass(delta: number): string {
  if (delta > 0) return "text-success";
  if (delta < 0) return "text-destructive";
  return "text-muted-foreground";
}

export function movementBook(movement: StockMovement): StockMovementBook | null {
  return movement.bookId && typeof movement.bookId === "object"
    ? movement.bookId
    : null;
}

export function movementActor(
  movement: StockMovement
): StockMovementActor | null {
  return movement.actorId && typeof movement.actorId === "object"
    ? movement.actorId
    : null;
}

export function openingBalance(
  oldest: StockMovement | undefined,
  currentStock: number
): number {
  return oldest ? oldest.balanceAfter - oldest.delta : currentStock;
}
