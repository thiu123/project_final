<template>
  <div role="radiogroup" aria-label="Format" class="grid grid-cols-2 gap-3">
    <label
      v-for="option in options"
      :key="option.value"
      class="relative flex cursor-pointer flex-col gap-1 border px-4 py-3.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background"
      :class="model === option.value ? 'border-foreground' : 'border-border hover:border-foreground/40'"
    >
      <input
        v-model="model"
        type="radio"
        name="product-type"
        :value="option.value"
        class="sr-only"
      />
      <span class="flex items-center justify-between gap-2">
        <span class="text-[13px] font-medium uppercase tracking-[0.14em]">{{ option.label }}</span>
        <span
          class="flex size-4 items-center justify-center rounded-full border"
          :class="model === option.value ? 'border-foreground' : 'border-input'"
        >
          <span v-if="model === option.value" class="size-2 rounded-full bg-foreground"></span>
        </span>
      </span>
      <span class="flex items-baseline gap-2 text-sm">
        <span class="tabular-nums">{{ formatUsd(option.price) }}</span>
        <span v-if="option.note" class="text-xs text-primary">{{ option.note }}</span>
      </span>
    </label>
  </div>
</template>

<script setup lang="ts">
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
    note: "",
  },
  {
    value: "ebook" as const,
    label: "Ebook",
    price: props.ebookPrice,
    note: savingPercent > 0 ? `Save ${savingPercent}%` : "",
  },
]);
</script>
