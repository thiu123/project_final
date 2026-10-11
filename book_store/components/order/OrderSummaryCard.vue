<template>
  <section aria-labelledby="order-summary-title">
    <h2 id="order-summary-title" class="sr-only">Order summary</h2>

    <dl class="divide-y divide-border border-y border-border text-[15px]">
      <div class="flex items-baseline justify-between gap-4 py-3.5">
        <dt class="text-muted-foreground">
          Subtotal
          <span class="ml-1 text-[13px] tabular-nums">
            ({{ itemCount }} {{ itemCount === 1 ? "copy" : "copies" }})
          </span>
        </dt>
        <dd class="tabular-nums">{{ formatVndAsUsd(orderSubtotalVnd(order)) }}</dd>
      </div>

      <div v-if="order.voucher?.code" class="flex items-baseline justify-between gap-4 py-3.5">
        <dt class="text-muted-foreground">
          Voucher
          <span class="ml-1 text-[11px] font-medium uppercase tracking-[0.12em] text-foreground">
            {{ order.voucher.code }}
          </span>
        </dt>
        <dd class="tabular-nums">&minus;{{ formatVndAsUsd(order.voucher.discountAmount) }}</dd>
      </div>

      <div v-if="hasHardback" class="flex items-baseline justify-between gap-4 py-3.5">
        <dt class="text-muted-foreground">Delivery</dt>
        <dd>Free</dd>
      </div>
    </dl>

    <div class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pt-6">
      <span class="eyebrow">{{ isPaidFor(order) ? "Total paid" : "Total" }}</span>
      <div class="text-right">
        <p class="font-serif text-4xl leading-none tabular-nums md:text-5xl">
          {{ formatVndAsUsd(order.total) }}
        </p>
        <p class="mt-2 text-[13px] tabular-nums text-muted-foreground">
          &asymp; {{ order.total.toLocaleString() }} VNĐ
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { formatVndAsUsd, orderSubtotalVnd } from "@/utils/pricing";
import { isPaidFor } from "@/utils/orderStatus";
import type { Order } from "@/types";

const props = defineProps<{ order: Order }>();

const itemCount = computed(() =>
  props.order.items.reduce((sum, item) => sum + item.quantity, 0)
);

const hasHardback = computed(() =>
  props.order.items.some((item) => item.productType === "hardbook")
);
</script>
