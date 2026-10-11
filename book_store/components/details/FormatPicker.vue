<template>
  <div role="radiogroup" aria-label="Format" class="grid grid-cols-2 gap-3">
    <label
      v-for="option in options"
      :key="option.value"
      class="relative flex cursor-pointer items-center gap-3 rounded-2xl border-2 bg-card p-3 transition-all duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background sm:p-4"
      :class="
        model === option.value
          ? '-translate-x-0.5 -translate-y-0.5 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))]'
          : 'border-border hover:border-foreground/40'
      "
    >
      <input
        v-model="model"
        type="radio"
        name="product-type"
        :value="option.value"
        class="sr-only"
      />
      <span
        class="flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300"
        :class="[option.tone, model === option.value && '-rotate-6 scale-110']"
      >
        <component :is="option.icon" class="size-5" />
      </span>
      <span class="min-w-0">
        <span class="block text-sm font-semibold">{{ option.label }}</span>
        <span class="block text-sm tabular-nums text-muted-foreground">
          {{ formatUsd(option.price) }}
        </span>
      </span>

      <span
        v-if="option.value === 'ebook' && savingPercent > 0"
        class="absolute -top-2.5 right-3 rotate-6 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground ring-2 ring-background"
      >
        -{{ savingPercent }}%
      </span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { Book, Tablet } from "lucide-vue-next";
import { EBOOK_PRICE_RATIO, formatUsd } from "@/utils/pricing";
import type { ProductType } from "@/types";

const props = defineProps<{
  hardbookPrice: number;
  ebookPrice: number;
}>();

const model = defineModel<ProductType>({ required: true });

const savingPercent = Math.round((1 - EBOOK_PRICE_RATIO) * 100);

const options = computed(() => [
  {
    value: "hardbook" as const,
    label: "Hardback",
    price: props.hardbookPrice,
    icon: Book,
    tone: "bg-primary/15 text-primary",
  },
  {
    value: "ebook" as const,
    label: "Ebook",
    price: props.ebookPrice,
    icon: Tablet,
    tone: "bg-accent/60 text-accent-foreground",
  },
]);
</script>
