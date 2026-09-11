<template>
  <div class="grid grid-cols-12 items-center gap-2 p-4">
    <!-- Selection + book -->
    <div class="col-span-12 flex items-center sm:col-span-6">
      <UiCheckbox
        class="mr-3 hidden md:flex"
        :model-value="selected"
        @update:model-value="emit('update:selected', $event === true)"
      />

      <div class="mr-4 flex min-w-[80px] items-center">
        <img
          :src="book?.cover_url"
          :alt="book?.title || 'Book cover'"
          class="h-[120px] w-[80px] bg-muted object-cover shadow"
          loading="lazy"
        />
      </div>

      <div class="min-w-0 grow">
        <div class="mb-2 truncate text-base font-bold text-foreground">
          {{ book?.title || "Product name" }}
        </div>
        <div class="mb-2 text-sm text-muted-foreground md:hidden">
          by {{ book?.authors?.[0] || "Unknown Author" }}
        </div>
        <div class="mb-2 text-lg font-bold text-waterblue md:hidden">
          {{ formatUsd(price) }}
        </div>

        <div class="mb-2 flex flex-wrap gap-2">
          <UiBadge
            :variant="item.productType === 'ebook' ? 'success' : 'default'"
            class="text-xs"
          >
            {{ item.productType === "ebook" ? "📱 Ebook" : "📚 Hardbook" }}
          </UiBadge>

          <UiBadge
            v-if="item.productType === 'hardbook'"
            :variant="stock.variant"
            class="text-xs"
          >
            {{ stock.label }}
          </UiBadge>
        </div>

        <UiBadge
          v-if="book?.subjects?.length"
          variant="outline"
          class="border-waterblue/50 text-xs capitalize text-waterblue"
        >
          {{ book.subjects[0] }}
        </UiBadge>
      </div>
    </div>

    <!-- Quantity -->
    <div class="col-span-4 flex items-center justify-center sm:col-span-2">
      <div
        class="flex min-w-[80px] items-center justify-center rounded-lg bg-waterblue/5 p-1"
      >
        <button
          type="button"
          class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-200 hover:bg-muted/70 disabled:pointer-events-none disabled:opacity-50"
          :disabled="item.quantity <= 1"
          aria-label="Decrease quantity"
          @click="changeQuantity(item.quantity - 1)"
        >
          <Minus class="h-3.5 w-3.5" />
        </button>

        <input
          :value="item.quantity"
          type="number"
          min="1"
          :max="maxQuantity"
          class="mx-1 h-8 w-[45px] min-w-[35px] rounded-lg border border-input bg-background px-1 text-center text-sm text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          @change="onQuantityInput"
        />

        <button
          type="button"
          class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-waterblue/15 text-waterblue transition-all duration-200 hover:bg-waterblue/25 disabled:pointer-events-none disabled:opacity-50"
          :disabled="item.quantity >= maxQuantity"
          aria-label="Increase quantity"
          @click="changeQuantity(item.quantity + 1)"
        >
          <Plus class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>

    <!-- Price -->
    <div class="hidden text-right md:col-span-2 md:block">
      <div class="text-base font-bold text-waterblue">
        {{ formatUsd(price) }}
      </div>
      <div
        v-if="item.productType === 'ebook'"
        class="text-xs text-muted-foreground line-through"
      >
        {{ formatUsd(book?.price ?? 0) }}
      </div>
    </div>

    <!-- Remove -->
    <div class="col-span-4 text-right sm:col-span-2">
      <UiButton
        variant="ghost"
        size="iconSm"
        class="text-destructive transition-all duration-200 hover:text-destructive"
        aria-label="Remove item"
        @click="emit('remove')"
      >
        <Trash2 class="h-5 w-5" />
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Minus, Plus, Trash2 } from "lucide-vue-next";
import { formatUsd, unitPrice } from "@/utils/pricing";
import type { CartItem } from "@/types";

/** Ebooks are a download, so there is no stock to cap them against. */
const EBOOK_QUANTITY_CAP = 10;

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
    : book.value?.stock ?? 0
);

const stock = computed(() => {
  const available = book.value?.stock ?? 0;
  if (available > 20)
    return { variant: "success" as const, label: `${available} in stock` };
  if (available > 0)
    return { variant: "warning" as const, label: `Only ${available} left!` };
  return { variant: "destructive" as const, label: "Out of stock" };
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
