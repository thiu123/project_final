<template>
  <section class="container mx-auto max-w-7xl px-4">
    <ul class="grid grid-cols-2 gap-px border-y border-border bg-border lg:grid-cols-4">
      <li
        v-for="(item, index) in PERKS"
        :key="item.title"
        class="bg-background py-6 md:py-8"
        :class="CELL_PADDING[index]"
      >
        <div v-reveal="index * 70">
          <p class="flex items-center gap-2.5 text-[12px] font-medium uppercase tracking-[0.14em] text-foreground">
            <component :is="item.icon" class="size-4 shrink-0" :stroke-width="1.5" />
            {{ item.title }}
          </p>
          <p class="mt-2.5 text-[13px] leading-relaxed text-muted-foreground">
            {{ item.body }}
          </p>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { BookOpenCheck, CreditCard, Tablet, Truck } from "lucide-vue-next";
import { EBOOK_PRICE_RATIO } from "@/utils/pricing";

const EBOOK_DISCOUNT = Math.round((1 - EBOOK_PRICE_RATIO) * 100);

const CELL_PADDING = [
  "pr-4 lg:pr-6",
  "pl-4 lg:px-6",
  "pr-4 lg:px-6",
  "pl-4 lg:pl-6 lg:pr-0",
];

const PERKS = [
  {
    icon: Truck,
    title: "Free delivery",
    body: "No shipping fee on hardbacks, tracked to your door.",
  },
  {
    icon: Tablet,
    title: `Ebooks ${EBOOK_DISCOUNT}% less`,
    body: "Every title also comes as a PDF to read right away.",
  },
  {
    icon: BookOpenCheck,
    title: "20 pages free",
    body: "Preview the opening of any ebook before you buy.",
  },
  {
    icon: CreditCard,
    title: "Pay your way",
    body: "VNPay, MoMo or cash on delivery.",
  },
];
</script>
