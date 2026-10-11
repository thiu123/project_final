<template>
  <div class="flex gap-4 py-6 sm:gap-6 md:py-8">
    <UiCheckbox
      :model-value="selected"
      :class="CHECKBOX_CLASS"
      wrapper-class="mt-1 gap-0 self-start"
      @update:model-value="emit('update:selected', $event === true)"
    >
      <span class="sr-only">Select {{ book?.title || "this book" }}</span>
    </UiCheckbox>

    <NuxtLink
      v-if="book?._id"
      :to="`/details/${book._id}`"
      class="ed-cover aspect-[2/3] w-16 shrink-0 self-start overflow-hidden bg-muted md:w-20"
      :aria-label="book.title"
    >
      <img
        v-if="book.cover_url"
        :src="book.cover_url"
        :alt="book.title"
        class="h-full w-full object-cover"
        loading="lazy"
      />
    </NuxtLink>
    <div v-else class="ed-cover aspect-[2/3] w-16 shrink-0 self-start bg-muted md:w-20" />

    <div
      class="grid min-w-0 flex-1 grid-cols-1 gap-5 md:grid-cols-[minmax(0,1fr)_8rem_6.5rem] md:gap-8"
    >
      <div class="min-w-0">
        <NuxtLink
          v-if="book?._id"
          :to="`/details/${book._id}`"
          class="line-clamp-2 font-serif text-lg leading-snug text-foreground transition-colors hover:text-primary md:text-xl"
          :title="book.title"
        >
          {{ book.title }}
        </NuxtLink>
        <p v-else class="font-serif text-lg leading-snug text-muted-foreground md:text-xl">
          This book is no longer available
        </p>

        <p class="mt-1 truncate text-[13px] text-muted-foreground">
          {{ book?.authors?.[0] || "Unknown author" }}
        </p>

        <div
          class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-medium uppercase tracking-[0.14em]"
        >
          <span>{{ item.productType === "ebook" ? "Ebook" : "Hardback" }}</span>
          <span
            v-if="item.productType === 'hardbook'"
            class="inline-flex items-center gap-2 text-muted-foreground"
          >
            <span class="size-1.5 rounded-full" :class="stock.dot" />
            {{ stock.label }}
          </span>
        </div>

        <p class="mt-2 text-[13px] tabular-nums text-muted-foreground">
          {{ formatUsd(price) }} each
          <span v-if="item.productType === 'ebook'" class="ml-1 line-through opacity-70">
            {{ formatUsd(book?.price ?? 0) }}
          </span>
        </p>

        <button
          type="button"
          class="ed-link mt-4 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
          @click="emit('remove')"
        >
          Remove
        </button>
      </div>

      <div class="flex items-center justify-between gap-4 md:contents">
        <div class="md:flex md:justify-center md:pt-0.5">
          <div class="inline-flex h-10 items-stretch border border-border">
            <button
              type="button"
              :class="STEP_BUTTON_CLASS"
              :disabled="item.quantity <= 1"
              aria-label="Decrease quantity"
              @click="changeQuantity(item.quantity - 1)"
            >
              <Minus class="size-3.5" :stroke-width="1.5" />
            </button>

            <input
              :value="item.quantity"
              type="number"
              min="1"
              :max="maxQuantity"
              aria-label="Quantity"
              class="w-10 border-x border-border bg-transparent text-center text-sm tabular-nums text-foreground focus:outline-none focus-visible:bg-accent [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              @change="onQuantityInput"
            />

            <button
              type="button"
              :class="STEP_BUTTON_CLASS"
              :disabled="item.quantity >= maxQuantity"
              aria-label="Increase quantity"
              @click="changeQuantity(item.quantity + 1)"
            >
              <Plus class="size-3.5" :stroke-width="1.5" />
            </button>
          </div>
        </div>

        <p class="text-right text-base tabular-nums text-foreground md:pt-2.5">
          {{ formatUsd(price * item.quantity) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Minus, Plus } from "lucide-vue-next";
import { formatUsd, unitPrice } from "@/utils/pricing";
import type { CartItem } from "@/types";

/** Ebooks are a download, so there is no stock to cap them against. */
const EBOOK_QUANTITY_CAP = 10;

const CHECKBOX_CLASS =
  "rounded-none border-foreground/50 shadow-none data-[state=checked]:border-foreground data-[state=checked]:bg-foreground data-[state=checked]:text-background";

const STEP_BUTTON_CLASS =
  "flex w-9 items-center justify-center text-foreground transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-30";

const props = defineProps<{
  item: CartItem;
  selected: boolean;
}>();

const emit = defineEmits<{
  "update:selected": [value: boolean];
  "update:quantity": [quantity: number];
  remove: [];
}>();

const book = computed(() => props.item.bookId);

const price = computed(() =>
  unitPrice(book.value?.price ?? 0, props.item.productType)
);

const maxQuantity = computed(() =>
  props.item.productType === "ebook"
    ? EBOOK_QUANTITY_CAP
    : Math.max(book.value?.stock ?? 0, 0)
);

const stock = computed(() => {
  const available = book.value?.stock ?? 0;
  if (available > 20) return { dot: "bg-success", label: `${available} in stock` };
  if (available > 0) return { dot: "bg-warning", label: `Only ${available} left` };
  return { dot: "bg-destructive", label: "Out of stock" };
});

function changeQuantity(next: number) {
  const clamped = Math.min(Math.max(1, next), maxQuantity.value);
  if (clamped !== props.item.quantity) emit("update:quantity", clamped);
}

function onQuantityInput(event: Event) {
  const input = event.target as HTMLInputElement;
  const parsed = Number.parseInt(input.value, 10);
  // Snap the field back if the typed value was rejected or clamped.
  input.value = String(props.item.quantity);
  if (Number.isFinite(parsed)) changeQuantity(parsed);
}
</script>
