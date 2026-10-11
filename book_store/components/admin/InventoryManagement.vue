<template>
  <div>
    <AdminPageHeader
      title="Inventory"
      description="Units on hand for every printed book, and a ledger of every unit in or out."
    >
      <template #actions>
        <UiButton variant="outline" :loading="refreshing" @click="refreshAll">
          <RefreshCw v-if="!refreshing" class="h-4 w-4" />
          Refresh
        </UiButton>
      </template>
    </AdminPageHeader>

    <AdminStatStrip :items="stats" :loading="!summary && summaryLoading" />

    <div
      role="tablist"
      aria-label="Inventory views"
      class="mb-4 inline-flex rounded-lg border border-border bg-card p-0.5 shadow-sm"
    >
      <button
        v-for="view in VIEWS"
        :key="view.value"
        type="button"
        role="tab"
        :aria-selected="activeView === view.value"
        class="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors"
        :class="
          activeView === view.value
            ? 'bg-muted text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        "
        @click="activeView = view.value"
      >
        <component :is="view.icon" class="h-4 w-4" />
        {{ view.label }}
      </button>
    </div>

    <AdminPanel v-if="activeView === 'stock'" :loading="stockLoading && stock.length > 0">
      <template #toolbar>
        <AdminSearchInput v-model="search" placeholder="Search by title or author" />
        <div class="flex items-center gap-2 md:ml-auto">
          <div class="w-full md:w-44">
            <AdminFilterSelect
              v-model="statusFilter"
              placeholder="All stock levels"
              clear-label="Clear stock filter"
              :options="statusOptions"
            />
          </div>
          <UiSelect :model-value="sort" @update:model-value="sort = $event as StockSort">
            <UiSelectTrigger class="w-full bg-background md:w-48" aria-label="Sort stock">
              <UiSelectValue placeholder="Sort by" />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem
                v-for="option in SORT_OPTIONS"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>
        </div>
      </template>

      <AdminInventoryStockTable
        :items="stock"
        :loading="stockLoading"
        :low-threshold="lowThreshold"
        @adjust="openAdjust"
        @history="openHistory"
      />

      <template #footer>
        <AdminTablePagination
          v-model:page="stockPage"
          :total="stockTotal"
          :items-per-page="PAGE_SIZE"
          noun="books"
        />
      </template>
    </AdminPanel>

    <AdminPanel v-else :loading="movementsLoading && movements.length > 0">
      <template #toolbar>
        <p class="text-sm text-muted-foreground">Every change to stock, newest first.</p>
        <div class="w-full md:ml-auto md:w-48">
          <AdminFilterSelect
            v-model="reasonFilter"
            placeholder="All movements"
            clear-label="Clear movement filter"
            :options="REASON_OPTIONS"
          />
        </div>
      </template>

      <AdminInventoryMovementTable
        :movements="movements"
        :loading="movementsLoading"
        show-book
      />

      <template #footer>
        <AdminTablePagination
          v-model:page="movementPage"
          :total="movementTotal"
          :items-per-page="PAGE_SIZE"
          noun="movements"
        />
      </template>
    </AdminPanel>

    <AdminInventoryAdjustDialog
      v-model:open="adjustOpen"
      :item="selected"
      @adjusted="onAdjusted"
    />

    <AdminInventoryHistoryDialog
      v-model:open="historyOpen"
      :item="selected"
      @adjust="openAdjust"
    />

    <SnackbarAlert
      v-model="snackbar.show"
      :text="snackbar.message"
      :color="snackbar.color"
      :timeout="3000"
    />
  </div>
</template>

<script setup lang="ts">
import debounce from "lodash/debounce";
import {
  Banknote,
  Boxes,
  PackageX,
  RefreshCw,
  ScrollText,
  TriangleAlert,
  Warehouse,
} from "lucide-vue-next";
import {
  getInventorySummary,
  getStockLevels,
  getStockMovements,
} from "~/api/inventoryApi";
import { useSnackbar } from "@/composables/useSnackbar";
import {
  LOW_STOCK_THRESHOLD,
  MOVEMENT_REASONS,
  formatDelta,
} from "@/utils/inventory";
import type { AdminStat } from "@/types/admin";
import type {
  InventorySummary,
  StockAdjustmentResult,
  StockLevel,
  StockMovement,
  StockMovementReason,
  StockSort,
  StockStatusFilter,
} from "@/types";

type InventoryView = "stock" | "movements";

const PAGE_SIZE = 10;

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const VIEWS = [
  { value: "stock" as InventoryView, label: "Stock levels", icon: Warehouse },
  { value: "movements" as InventoryView, label: "Movements", icon: ScrollText },
];

const SORT_OPTIONS: { label: string; value: StockSort }[] = [
  { label: "Lowest stock first", value: "stock_asc" },
  { label: "Highest stock first", value: "stock_desc" },
  { label: "Title A-Z", value: "title_asc" },
  { label: "Best selling", value: "sold_desc" },
];

const REASON_OPTIONS = (
  Object.keys(MOVEMENT_REASONS) as StockMovementReason[]
).map((value) => ({ value, label: MOVEMENT_REASONS[value].label }));

const { snackbar, notify, notifyError } = useSnackbar();

const summary = ref<InventorySummary | null>(null);
const summaryLoading = ref(false);

const activeView = ref<InventoryView>("stock");

const stock = ref<StockLevel[]>([]);
const stockTotal = ref(0);
const stockLoading = ref(false);
const stockPage = ref(1);
const search = ref("");
const statusFilter = ref<string | undefined>(undefined);
const sort = ref<StockSort>("stock_asc");

const movements = ref<StockMovement[]>([]);
const movementTotal = ref(0);
const movementsLoading = ref(false);
const movementsLoaded = ref(false);
const movementPage = ref(1);
const reasonFilter = ref<string | undefined>(undefined);

const selected = ref<StockLevel | null>(null);
const adjustOpen = ref(false);
const historyOpen = ref(false);

const lowThreshold = computed(
  () => summary.value?.lowStockThreshold ?? LOW_STOCK_THRESHOLD
);

const statusOptions = computed(() => [
  { label: "In stock", value: "in" },
  { label: `Low (${lowThreshold.value} or fewer)`, value: "low" },
  { label: "Out of stock", value: "out" },
  { label: "Oversold", value: "oversold" },
]);

const refreshing = computed(
  () =>
    summaryLoading.value ||
    (activeView.value === "stock" ? stockLoading.value : movementsLoading.value)
);

const stats = computed<AdminStat[]>(() => {
  const data = summary.value;
  return [
    {
      label: "Units on hand",
      value: (data?.units ?? 0).toLocaleString("en-US"),
      icon: Boxes,
      hint: `Across ${data?.titles ?? 0} titles`,
    },
    {
      label: "Stock value",
      value: usd.format(data?.value ?? 0),
      icon: Banknote,
      hint: "At list price",
    },
    {
      label: "Low stock",
      value: data?.lowStock ?? 0,
      icon: TriangleAlert,
      hint: `${lowThreshold.value} or fewer left`,
    },
    {
      label: "Out of stock",
      value: data?.outOfStock ?? 0,
      icon: PackageX,
      hint: data?.oversold
        ? `${data.oversold} oversold, waiting for stock`
        : "Includes ebook-only titles",
    },
  ];
});

const debouncedStockRefresh = debounce(() => {
  if (stockPage.value === 1) fetchStock();
  else stockPage.value = 1;
}, 300);

watch(stockPage, fetchStock);
watch([search, statusFilter, sort], debouncedStockRefresh);

watch(movementPage, fetchMovements);
watch(reasonFilter, () => {
  if (movementPage.value === 1) fetchMovements();
  else movementPage.value = 1;
});

watch(activeView, (view) => {
  if (view === "movements" && !movementsLoaded.value) fetchMovements();
});

onBeforeUnmount(() => debouncedStockRefresh.cancel());

onMounted(() => {
  fetchSummary();
  fetchStock();
});

async function fetchSummary() {
  summaryLoading.value = true;
  try {
    const { data } = await getInventorySummary();
    summary.value = data;
  } catch (error) {
    console.error("Failed to load inventory summary", error);
    notifyError("Failed to load inventory summary");
  } finally {
    summaryLoading.value = false;
  }
}

async function fetchStock() {
  stockLoading.value = true;
  try {
    const { data } = await getStockLevels({
      page: stockPage.value,
      limit: PAGE_SIZE,
      search: search.value.trim() || undefined,
      status: statusFilter.value as StockStatusFilter | undefined,
      sort: sort.value,
    });
    stock.value = data.items;
    stockTotal.value = data.meta.total;
  } catch (error) {
    console.error("Failed to load stock levels", error);
    notifyError("Failed to load stock levels");
  } finally {
    stockLoading.value = false;
  }
}

async function fetchMovements() {
  movementsLoading.value = true;
  try {
    const { data } = await getStockMovements({
      page: movementPage.value,
      limit: PAGE_SIZE,
      reason: reasonFilter.value as StockMovementReason | undefined,
    });
    movements.value = data.items;
    movementTotal.value = data.meta.total;
    movementsLoaded.value = true;
  } catch (error) {
    console.error("Failed to load stock movements", error);
    notifyError("Failed to load stock movements");
  } finally {
    movementsLoading.value = false;
  }
}

function refreshAll() {
  fetchSummary();
  if (activeView.value === "stock") fetchStock();
  else fetchMovements();
}

function openAdjust(item: StockLevel) {
  selected.value = item;
  historyOpen.value = false;
  adjustOpen.value = true;
}

function openHistory(item: StockLevel) {
  selected.value = item;
  historyOpen.value = true;
}

function onAdjusted(result: StockAdjustmentResult) {
  const title = selected.value?.title ?? "Book";
  if (selected.value) selected.value = { ...selected.value, stock: result.stock };

  notify(
    `${title}: ${formatDelta(result.movement.delta)} units, ${result.stock} on hand`
  );

  fetchSummary();
  fetchStock();
  if (movementsLoaded.value) fetchMovements();
}
</script>
