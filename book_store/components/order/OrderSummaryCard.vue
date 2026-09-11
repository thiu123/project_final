<template>
  <UiCard class="mb-8 overflow-hidden rounded-lg shadow-md">
    <div class="summary-gradient p-5">
      <div class="flex items-center">
        <Calculator class="mr-3 h-7 w-7 text-white" />
        <span class="text-2xl font-bold text-white">Order Summary</span>
      </div>
    </div>

    <UiSeparator />

    <div class="p-6">
      <!-- Items breakdown -->
      <div class="mb-5">
        <div
          class="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground"
        >
          Items Breakdown
        </div>

        <div
          v-for="(item, index) in order.items"
          :key="item._id ?? index"
          class="mb-2 rounded-lg bg-muted/60 p-4"
        >
          <div class="flex items-center justify-between">
            <div>
              <div class="text-base font-medium text-foreground">
                {{ item.bookId?.title }}
                <UiBadge
                  v-if="item.productType === 'ebook'"
                  variant="success"
                  class="ml-2 text-[10px]"
                >
                  Ebook
                </UiBadge>
              </div>
              <div class="text-xs text-muted-foreground">
                {{ formatUsd(itemUnitPrice(item)) }} × {{ item.quantity }}
              </div>
            </div>
            <div class="text-lg font-bold text-primary">
              {{ formatUsd(itemUnitPrice(item) * item.quantity) }}
            </div>
          </div>
        </div>
      </div>

      <UiSeparator class="my-5" />

      <div class="mb-4 flex items-center justify-between px-2">
        <span class="text-base font-medium text-muted-foreground">Subtotal</span>
        <span class="text-lg font-bold text-foreground">
          {{ formatVndAsUsd(orderSubtotalVnd(order)) }}
        </span>
      </div>

      <div
        v-if="order.voucher?.code"
        class="mb-4 rounded-lg bg-green-50 p-4 dark:bg-green-950/40"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <span
              class="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success"
            >
              <TicketPercent class="h-5 w-5 text-white" />
            </span>
            <div>
              <div class="text-base font-medium text-foreground">
                Voucher Discount
              </div>
              <UiBadge variant="success" class="mt-1">
                {{ order.voucher.code }}
              </UiBadge>
            </div>
          </div>
          <div class="text-lg font-bold text-success">
            -{{ formatVndAsUsd(order.voucher.discountAmount) }}
          </div>
        </div>
      </div>

      <UiSeparator class="my-5" />

      <div class="rounded-lg bg-green-50 p-5 dark:bg-green-950/40">
        <div class="flex items-center justify-between">
          <div>
            <div
              class="mb-1 text-xs font-bold uppercase tracking-widest text-green-700 dark:text-green-300"
            >
              Total Paid
            </div>
            <div class="text-3xl font-bold text-success">
              {{ formatVndAsUsd(order.total) }}
            </div>
          </div>
          <CheckCircle2 class="h-[60px] w-[60px] text-success" />
        </div>

        <div
          class="mt-4 border-t-2 border-dashed border-success/30 pt-4 text-center"
        >
          <span class="text-sm font-medium text-green-700 dark:text-green-300">
            ≈ {{ order.total.toLocaleString() }} VNĐ
          </span>
        </div>
      </div>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
import { Calculator, CheckCircle2, TicketPercent } from "lucide-vue-next";
import {
  formatUsd,
  formatVndAsUsd,
  orderSubtotalVnd,
  unitPrice,
} from "@/utils/pricing";
import type { Order, OrderItem } from "@/types";

defineProps<{ order: Order }>();

function itemUnitPrice(item: OrderItem) {
  return unitPrice(item.bookId?.price ?? 0, item.productType);
}
</script>

<style scoped>
/* Header gradient (not expressible as a Tailwind utility) */
.summary-gradient {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
}
</style>
