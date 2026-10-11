<template>
  <UiDialog v-model:open="open">
    <UiDialogContent hide-close class="gap-0 overflow-hidden p-0 sm:max-w-4xl">
      <template v-if="item">
        <div class="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          <div class="min-w-0">
            <UiDialogTitle class="text-lg font-semibold text-foreground">
              Stock history
            </UiDialogTitle>
            <UiDialogDescription class="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <span class="line-clamp-1">{{ item.title }}</span>
              <span aria-hidden="true">·</span>
              <span class="tabular-nums">{{ item.stock }} on hand</span>
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

        <div class="relative max-h-[60vh] overflow-y-auto">
          <div v-if="loading && movements.length" class="admin-loading-bar" role="progressbar" aria-label="Loading" />
          <p v-if="failed" class="px-6 py-12 text-center text-sm text-destructive">
            Could not load the stock history. Close and try again.
          </p>
          <AdminInventoryMovementTable
            v-else
            :movements="movements"
            :loading="loading"
            :opening="opening"
          />
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/30 px-6 py-3">
          <AdminTablePagination
            v-model:page="page"
            :total="total"
            :items-per-page="PAGE_SIZE"
            noun="movements"
          />
          <div class="ml-auto flex items-center gap-2">
            <UiButton variant="outline" @click="open = false">Close</UiButton>
            <UiButton variant="ink" @click="emit('adjust', item)">
              <SlidersHorizontal class="h-4 w-4" />
              Adjust stock
            </UiButton>
          </div>
        </div>
      </template>
    </UiDialogContent>
  </UiDialog>
</template>

<script setup lang="ts">
import { SlidersHorizontal, X } from "lucide-vue-next";
import { getStockMovements } from "~/api/inventoryApi";
import { openingBalance } from "@/utils/inventory";
import type { StockLevel, StockMovement } from "@/types";

const PAGE_SIZE = 10;

const props = defineProps<{ item: StockLevel | null }>();

const emit = defineEmits<{
  adjust: [item: StockLevel];
}>();

const open = defineModel<boolean>("open", { default: false });

const movements = ref<StockMovement[]>([]);
const total = ref(0);
const hasNext = ref(false);
const page = ref(1);
const loading = ref(false);
const failed = ref(false);

const opening = computed(() => {
  if (!props.item || loading.value || failed.value || hasNext.value) return null;
  const balance = openingBalance(movements.value.at(-1), props.item.stock);
  return balance === 0 ? null : balance;
});

watch(open, (isOpen) => {
  if (!isOpen) return;
  movements.value = [];
  total.value = 0;
  hasNext.value = false;
  if (page.value === 1) load();
  else page.value = 1;
});

watch(page, load);

async function load() {
  if (!props.item) return;

  loading.value = true;
  failed.value = false;
  try {
    const { data } = await getStockMovements({
      bookId: props.item._id,
      page: page.value,
      limit: PAGE_SIZE,
    });
    movements.value = data.items;
    total.value = data.meta.total;
    hasNext.value = data.meta.hasNext;
  } catch (error) {
    console.error("Failed to load stock history", error);
    failed.value = true;
    movements.value = [];
  } finally {
    loading.value = false;
  }
}
</script>
