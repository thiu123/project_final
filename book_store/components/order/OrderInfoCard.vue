<template>
  <section aria-labelledby="order-details-title">
    <h2
      id="order-details-title"
      class="border-b border-foreground pb-4 font-serif text-2xl font-normal leading-snug md:text-[1.75rem]"
    >
      Details
    </h2>

    <dl class="divide-y divide-border border-b border-border">
      <OrderInfoTile label="Order no.">
        <span class="tabular-nums">{{ order.orderId }}</span>
      </OrderInfoTile>

      <OrderInfoTile label="Placed">
        <span class="tabular-nums">{{ formatDate(order.createdAt) }}</span>
      </OrderInfoTile>

      <OrderInfoTile label="Payment">
        {{ PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod }}
      </OrderInfoTile>

      <OrderInfoTile label="Status">
        <span
          class="inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em]"
        >
          <span class="size-1.5 rounded-full" :class="STATUS_DOTS[order.status] ?? 'bg-muted-foreground'" />
          {{ order.status }}
        </span>
      </OrderInfoTile>

      <OrderInfoTile v-if="order.shipping" label="Deliver to">
        <span class="block">{{ order.shipping.fullName }}</span>
        <span class="block tabular-nums text-muted-foreground">{{ order.shipping.phone }}</span>
        <span class="mt-1 block text-muted-foreground">{{ order.shipping.address }}</span>
        <span v-if="order.shipping.note" class="mt-1 block font-serif italic text-foreground/80">
          &ldquo;{{ order.shipping.note }}&rdquo;
        </span>
      </OrderInfoTile>
    </dl>
  </section>
</template>

<script setup lang="ts">
import type { Order, OrderStatus, PaymentMethod } from "@/types";

defineProps<{ order: Order }>();

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  COD: "Cash on delivery",
  Vnpay: "VNPay",
  Momo: "MoMo",
};

const STATUS_DOTS: Record<OrderStatus, string> = {
  Pending: "bg-warning",
  Paid: "bg-success",
  Confirmed: "bg-info",
  "In Delivery": "bg-info",
  Delivered: "bg-success",
  Cancelled: "bg-destructive",
  Failed: "bg-destructive",
};

function formatDate(dateString?: string) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>
