<template>
  <ul v-if="items.length" class="divide-y divide-border border-y border-border">
    <li v-for="item in items" :key="item.bookId" class="flex gap-4 py-4">
      <div class="ed-cover aspect-[2/3] w-12 shrink-0 self-start overflow-hidden bg-background md:w-14">
        <img
          v-if="item.cover_url"
          :src="item.cover_url"
          :alt="item.title"
          class="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <div class="min-w-0 flex-1">
        <p class="line-clamp-2 font-serif text-base leading-snug text-foreground">
          {{ item.title }}
        </p>
        <p class="mt-0.5 truncate text-[12px] text-muted-foreground">
          {{ item.authors || "Unknown author" }}
        </p>
        <p
          class="mt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
        >
          {{ item.productType === "ebook" ? "Ebook" : "Hardback" }}
          <span class="mx-1.5 text-border">/</span>
          <span class="tabular-nums">Qty {{ item.quantity }}</span>
        </p>
      </div>

      <div class="shrink-0 text-right">
        <p class="text-[15px] tabular-nums text-foreground">
          {{ formatUsd(lineTotalFor(item)) }}
        </p>
        <p
          v-if="item.quantity > 1"
          class="mt-0.5 text-[12px] tabular-nums text-muted-foreground"
        >
          {{ formatUsd(unitPrice(item.price, item.productType)) }} each
        </p>
      </div>
    </li>
  </ul>

  <div v-else class="border-y border-border py-8">
    <p class="text-[15px] text-muted-foreground">No books selected for checkout.</p>
    <NuxtLink
      to="/cart"
      class="group mt-4 inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em]"
    >
      <ArrowLeft
        class="size-4 transition-transform group-hover:-translate-x-1"
        :stroke-width="1.5"
      />
      <span class="ed-link">Back to cart</span>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";
import { formatUsd, unitPrice } from "@/utils/pricing";
import type { CheckoutItem } from "@/types";

defineProps<{ items: CheckoutItem[] }>();

function lineTotalFor(item: CheckoutItem) {
  return unitPrice(item.price, item.productType) * item.quantity;
}
</script>
