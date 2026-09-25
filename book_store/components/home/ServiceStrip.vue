<template>
  <section class="border-b border-border bg-muted/40">
    <div
      class="container mx-auto grid max-w-7xl grid-cols-1 gap-y-6 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-border"
    >
      <div
        v-for="(item, index) in PERKS"
        :key="item.title"
        v-reveal="index * 80"
        class="flex items-start gap-4 lg:px-6 lg:first:pl-0 lg:last:pr-0"
      >
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-background ring-1 ring-border"
        >
          <component :is="item.icon" class="h-5 w-5 text-primary" :stroke-width="1.75" />
        </div>
        <div>
          <h3 class="text-sm font-semibold text-foreground">{{ item.title }}</h3>
          <p class="mt-1 text-sm leading-relaxed text-muted-foreground">
            {{ item.body }}
          </p>
        </div>
      </div>

      <div
        v-reveal="PERKS.length * 80"
        class="flex items-start gap-4 lg:px-6 lg:last:pr-0"
      >
        <div class="flex shrink-0 -space-x-2">
          <img
            :src="vnpayLogo"
            alt="VNPay"
            class="h-11 w-11 rounded-xl bg-white object-contain p-1.5 ring-1 ring-border"
          />
          <img
            :src="momoLogo"
            alt="MoMo"
            class="h-11 w-11 rounded-xl bg-white object-contain ring-1 ring-border"
          />
        </div>
        <div>
          <h3 class="text-sm font-semibold text-foreground">Pay your way</h3>
          <p class="mt-1 text-sm leading-relaxed text-muted-foreground">
            VNPay, MoMo or cash on delivery.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { BookOpenCheck, Tablet, Truck } from "lucide-vue-next";
import { EBOOK_PRICE_RATIO } from "@/utils/pricing";
import vnpayLogo from "@/assets/vnpay-logo-inkythuatso.svg";
import momoLogo from "@/assets/Logo-MoMo-Square-300x300.png";

const EBOOK_DISCOUNT = Math.round((1 - EBOOK_PRICE_RATIO) * 100);

const PERKS = [
  {
    icon: Truck,
    title: "Free delivery",
    body: "No shipping fee on hardbacks, and every order is tracked to your door.",
  },
  {
    icon: Tablet,
    title: `Ebooks ${EBOOK_DISCOUNT}% cheaper`,
    body: "Every title also comes as a PDF you can read right away.",
  },
  {
    icon: BookOpenCheck,
    title: "Read 20 pages free",
    body: "Preview the opening of any ebook before you buy it.",
  },
];
</script>
