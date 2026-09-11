<template>
  <UiCard class="mb-4 overflow-hidden rounded-xl shadow md:mb-6">
    <div class="flex items-center bg-primary px-4 py-4 text-primary-foreground">
      <ShoppingCart class="mr-3 h-6 w-6" />
      <span class="text-lg font-semibold">
        Order Summary ({{ items.length }} items)
      </span>
    </div>

    <div v-if="items.length" class="p-4 md:p-6">
      <div
        v-for="(item, index) in items"
        :key="item.bookId"
        class="mb-4"
        :class="{ 'border-b border-border pb-4': index < items.length - 1 }"
      >
        <div class="flex gap-3 sm:gap-4">
          <img
            :src="item.cover_url"
            :alt="item.title"
            class="h-[110px] w-[80px] shrink-0 rounded bg-muted object-cover sm:h-[160px] sm:w-[120px]"
          />

          <div class="flex min-w-0 grow flex-col">
            <div class="mb-2 text-base font-bold sm:text-lg sm:font-semibold">
              {{ item.title }}
            </div>

            <div class="mb-2 flex items-center text-xs text-muted-foreground sm:mb-3 sm:text-sm">
              <User class="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
              {{ item.authors || "Unknown Author" }}
            </div>

            <div class="flex flex-wrap items-center gap-2 sm:gap-3">
              <UiBadge :variant="item.productType === 'ebook' ? 'success' : 'info'">
                {{ item.productType === "ebook" ? "📱 Ebook" : "📚 Hardbook" }}
              </UiBadge>
              <span class="text-xs text-muted-foreground">
                {{ formatUsd(unitPrice(item.price, item.productType)) }} each
              </span>
            </div>

            <div
              class="mt-auto flex items-center justify-between gap-3 pt-3 sm:pt-4"
            >
              <div class="flex items-center gap-2 rounded bg-muted px-3 py-1.5">
                <span class="text-sm text-muted-foreground">Qty:</span>
                <span class="text-base font-medium">{{ item.quantity }}</span>
              </div>
              <span class="text-lg font-bold text-primary sm:text-2xl">
                {{ formatUsd(lineTotalFor(item)) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="p-8 text-center text-muted-foreground">
      No items selected for checkout.
    </div>
  </UiCard>
</template>

<script setup lang="ts">
import { ShoppingCart, User } from "lucide-vue-next";
import { formatUsd, unitPrice } from "@/utils/pricing";
import type { CheckoutItem } from "@/types";

defineProps<{ items: CheckoutItem[] }>();

function lineTotalFor(item: CheckoutItem) {
  return unitPrice(item.price, item.productType) * item.quantity;
}
</script>
