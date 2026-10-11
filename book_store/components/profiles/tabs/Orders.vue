<template>
  <section>
    <ProfilesTabsSectionHeading
      :eyebrow="loading ? 'Orders' : `${placedOrders.length} ${placedOrders.length === 1 ? 'order' : 'orders'}`"
      title="Order history"
      description="A record of your orders and where each one stands."
    />

    <ProfilesTabsLoadingState v-if="loading" label="Loading orders..." />

    <div v-else-if="placedOrders.length">
      <div
        class="hidden gap-6 border-b border-border pb-3 md:grid"
        :class="LEDGER_COLUMNS"
      >
        <span class="eyebrow">Order no.</span>
        <span class="eyebrow">Date</span>
        <span class="eyebrow">Items</span>
        <span class="eyebrow">Total</span>
        <span class="eyebrow">Status</span>
        <span class="sr-only">Details</span>
      </div>

      <ul class="divide-y divide-border border-b border-border">
        <li v-for="order in placedOrders" :key="order._id" class="py-6">
          <div class="md:hidden">
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0">
                <p class="truncate text-[13px] font-medium tabular-nums" :title="order.orderId">
                  #{{ order.orderId }}
                </p>
                <p class="mt-1 text-[13px] text-muted-foreground">
                  {{ formatDate(order.createdAt) }}
                  <span class="mx-1.5 text-border">/</span>
                  {{ itemLabel(order) }}
                </p>
              </div>
              <div class="shrink-0 text-right">
                <p class="text-[15px] tabular-nums">{{ formatVndAsUsd(order.total) }}</p>
                <p v-if="order.voucher?.code" class="mt-1 text-[12px] text-muted-foreground">
                  {{ order.voucher.code }}
                </p>
              </div>
            </div>
            <div class="mt-4 flex items-center justify-between gap-4">
              <span class="inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em]">
                <span class="size-1.5 rounded-full" :class="statusDot(order.status)" />
                {{ order.status }}
              </span>
              <NuxtLink
                :to="`/order/status/${order.orderId}`"
                class="group inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em]"
              >
                <span class="ed-link">View</span>
                <ArrowRight class="size-4 transition-transform duration-300 group-hover:translate-x-1" :stroke-width="1.5" />
              </NuxtLink>
            </div>
          </div>

          <div class="hidden items-center gap-6 md:grid" :class="LEDGER_COLUMNS">
            <p class="break-all text-[12.5px] font-medium tabular-nums leading-snug">
              #{{ order.orderId }}
            </p>
            <p class="text-[14px] text-muted-foreground">{{ formatDate(order.createdAt) }}</p>
            <div class="flex min-w-0 items-center gap-3">
              <div class="flex shrink-0">
                <div
                  v-for="(item, index) in order.items.slice(0, 3)"
                  :key="item._id || index"
                  class="aspect-[2/3] w-7 overflow-hidden bg-muted ring-2 ring-background"
                  :class="index > 0 && '-ml-2'"
                >
                  <img
                    v-if="item.bookId?.cover_url"
                    :src="item.bookId.cover_url"
                    :alt="item.bookId?.title || 'Book cover'"
                    class="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
              <span class="truncate text-[14px] text-muted-foreground">{{ itemLabel(order) }}</span>
            </div>
            <div>
              <p class="text-[15px] tabular-nums">{{ formatVndAsUsd(order.total) }}</p>
              <p v-if="order.voucher?.code" class="mt-1 truncate text-[12px] text-muted-foreground">
                {{ order.voucher.code }} &minus;{{ formatVndAsUsd(order.voucher.discountAmount) }}
              </p>
            </div>
            <span class="inline-flex items-center gap-2 whitespace-nowrap text-[12px] font-medium uppercase tracking-[0.14em]">
              <span class="size-1.5 shrink-0 rounded-full" :class="statusDot(order.status)" />
              {{ order.status }}
            </span>
            <NuxtLink
              :to="`/order/status/${order.orderId}`"
              class="group inline-flex items-center justify-end gap-2 text-[12px] font-medium uppercase tracking-[0.14em]"
              :aria-label="`View order ${order.orderId}`"
            >
              <span class="ed-link">View</span>
              <ArrowRight class="size-4 transition-transform duration-300 group-hover:translate-x-1" :stroke-width="1.5" />
            </NuxtLink>
          </div>
        </li>
      </ul>
    </div>

    <ProfilesTabsEmptyState
      v-else
      title="No orders yet."
      action-label="Start shopping"
    >
      You haven't placed any orders yet. Start shopping to see your order history
      here.
    </ProfilesTabsEmptyState>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ArrowRight } from "lucide-vue-next";
import { useOrderStore } from "@/stores/order";
import type { Order } from "@/types";
import { formatVndAsUsd } from "@/utils/pricing";

const LEDGER_COLUMNS =
  "grid-cols-[minmax(0,1.7fr)_minmax(0,0.85fr)_minmax(0,1.15fr)_minmax(0,0.9fr)_minmax(0,1fr)_4rem]";

const STATUS_DOTS: Record<string, string> = {
  pending: "bg-warning",
  paid: "bg-success",
  confirmed: "bg-info",
  "in delivery": "bg-info",
  delivered: "bg-success",
  cancelled: "bg-muted-foreground",
  failed: "bg-destructive",
};

defineProps<{ loading: boolean }>();

const orderStore = useOrderStore();
const { userOrders } = storeToRefs(orderStore);

/** Pending orders have not been paid for, so they are not history yet. */
const placedOrders = computed(() =>
  userOrders.value.filter((order) => order.status !== "Pending")
);

function formatDate(value?: string) {
  return value
    ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "";
}

function statusDot(status?: string) {
  return STATUS_DOTS[status?.toLowerCase() ?? ""] ?? "bg-muted-foreground";
}

function itemLabel(order: Order) {
  const count = order.items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  return `${count} ${count === 1 ? "item" : "items"}`;
}
</script>
