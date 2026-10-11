<template>
  <UiDialog v-model:open="open">
    <UiDialogContent hide-close class="gap-0 overflow-hidden p-0 sm:max-w-lg">
      <template v-if="item">
        <div class="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          <div class="min-w-0">
            <UiDialogTitle class="text-lg font-semibold text-foreground">
              Adjust stock
            </UiDialogTitle>
            <UiDialogDescription class="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
              {{ item.title }}
            </UiDialogDescription>
          </div>
          <button
            type="button"
            class="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
            @click="open = false"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <form class="space-y-5 px-6 py-5" @submit.prevent="save">
          <div role="radiogroup" aria-label="Adjustment type" class="grid grid-cols-3 gap-2">
            <button
              v-for="option in OPTIONS"
              :key="option.value"
              type="button"
              role="radio"
              :aria-checked="type === option.value"
              class="flex flex-col items-start gap-1 rounded-lg border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              :class="
                type === option.value
                  ? 'border-foreground bg-muted/60'
                  : 'border-border hover:bg-muted/40'
              "
              @click="type = option.value"
            >
              <component :is="option.icon" class="h-4 w-4 text-foreground" />
              <span class="text-sm font-medium text-foreground">{{ option.label }}</span>
              <span class="text-xs leading-snug text-muted-foreground">
                {{ option.description }}
              </span>
            </button>
          </div>

          <UiInput
            id="adjust-quantity"
            v-model="quantity"
            :label="current.quantityLabel"
            type="number"
            inputmode="numeric"
            :min="type === 'count' ? 0 : 1"
            step="1"
            :error-message="error"
            autofocus
          >
            <template #prepend>
              <Hash class="h-4 w-4" />
            </template>
          </UiInput>

          <UiTextarea
            id="adjust-note"
            v-model="note"
            label="Note (optional)"
            :placeholder="current.notePlaceholder"
            :rows="2"
            maxlength="200"
          />

          <div
            class="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm"
            aria-live="polite"
          >
            <span class="text-muted-foreground">On hand</span>
            <span class="flex items-center gap-2 tabular-nums">
              <span class="text-muted-foreground">{{ item.stock }}</span>
              <ArrowRight class="h-3.5 w-3.5 text-muted-foreground" />
              <span class="font-semibold" :class="next < 0 ? 'text-destructive' : 'text-foreground'">
                {{ next }}
              </span>
              <span class="text-xs font-medium" :class="deltaClass(next - item.stock)">
                ({{ formatDelta(next - item.stock) }})
              </span>
            </span>
          </div>
        </form>

        <div class="flex items-center justify-end gap-2 border-t border-border bg-muted/30 px-6 py-3">
          <UiButton variant="outline" @click="open = false">Cancel</UiButton>
          <UiButton variant="ink" :loading="saving" @click="save">Save adjustment</UiButton>
        </div>
      </template>
    </UiDialogContent>
  </UiDialog>
</template>

<script setup lang="ts">
import type { Component } from "vue";
import {
  ArrowRight,
  ClipboardCheck,
  Hash,
  PackageMinus,
  PackagePlus,
  X,
} from "lucide-vue-next";
import { adjustStock } from "~/api/inventoryApi";
import { deltaClass, formatDelta } from "@/utils/inventory";
import type { StockAdjustmentResult, StockAdjustmentType, StockLevel } from "@/types";

interface AdjustOption {
  value: StockAdjustmentType;
  label: string;
  description: string;
  icon: Component;
  quantityLabel: string;
  notePlaceholder: string;
}

const OPTIONS: AdjustOption[] = [
  {
    value: "restock",
    label: "Receive",
    description: "Units that arrived",
    icon: PackagePlus,
    quantityLabel: "Units received",
    notePlaceholder: "Supplier or invoice number",
  },
  {
    value: "damage",
    label: "Remove",
    description: "Damaged or lost",
    icon: PackageMinus,
    quantityLabel: "Units to remove",
    notePlaceholder: "What happened to them?",
  },
  {
    value: "count",
    label: "Count",
    description: "Set what is on the shelf",
    icon: ClipboardCheck,
    quantityLabel: "Units counted",
    notePlaceholder: "Who counted, and where",
  },
];

const props = defineProps<{ item: StockLevel | null }>();

const emit = defineEmits<{
  adjusted: [result: StockAdjustmentResult];
}>();

const open = defineModel<boolean>("open", { default: false });

const type = ref<StockAdjustmentType>("restock");
const quantity = ref<string | number>("");
const note = ref("");
const error = ref("");
const saving = ref(false);

const current = computed(
  () => OPTIONS.find((option) => option.value === type.value) ?? OPTIONS[0]
);

const amount = computed(() => {
  const value = Number(quantity.value);
  return Number.isFinite(value) ? value : 0;
});

const next = computed(() => {
  const stock = props.item?.stock ?? 0;
  if (type.value === "restock") return stock + amount.value;
  if (type.value === "damage") return stock - amount.value;
  return amount.value;
});

watch(open, (isOpen) => {
  if (!isOpen) return;
  type.value = "restock";
  quantity.value = "";
  note.value = "";
  error.value = "";
});

watch([type, quantity], () => {
  error.value = "";
});

function validate(): boolean {
  const value = Number(quantity.value);
  const minimum = type.value === "count" ? 0 : 1;

  if (quantity.value === "" || !Number.isInteger(value)) {
    error.value = "Enter a whole number";
  } else if (value < minimum) {
    error.value = minimum === 1 ? "Enter at least 1 unit" : "Count cannot be negative";
  } else if (type.value === "damage" && value > Math.max(props.item?.stock ?? 0, 0)) {
    error.value = `Only ${Math.max(props.item?.stock ?? 0, 0)} on hand`;
  } else {
    error.value = "";
  }
  return !error.value;
}

async function save() {
  if (!props.item || saving.value || !validate()) return;

  saving.value = true;
  try {
    const { data } = await adjustStock(props.item._id, {
      type: type.value,
      quantity: Number(quantity.value),
      note: note.value.trim() || undefined,
    });
    emit("adjusted", data);
    open.value = false;
  } catch (err: any) {
    error.value =
      err?.response?.data?.msg || err?.message || "Could not update stock";
  } finally {
    saving.value = false;
  }
}
</script>
