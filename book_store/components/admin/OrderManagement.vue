<template>
  <div class="w-full p-4">
    <!-- Header -->
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="mb-2 text-3xl font-bold text-foreground">Order Management</h1>
        <p class="text-base font-medium text-muted-foreground">
          Manage all orders in the system
        </p>
      </div>
      <UiButton
        class="bg-waterblue text-white hover:bg-waterblue/90"
        :loading="loading"
        @click="fetchOrders"
      >
        <RefreshCw v-if="!loading" class="h-4 w-4" />
        Refresh
      </UiButton>
    </div>

    <!-- Statistics -->
    <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
      <AdminStatCard v-for="stat in stats" :key="stat.label" v-bind="stat" />
    </div>

    <!-- Filters -->
    <div class="mb-4 grid grid-cols-12 gap-4">
      <div class="col-span-12 md:col-span-6">
        <UiInput
          v-model="search"
          placeholder="Search orders (Order ID, User email)..."
        >
          <template #prepend>
            <Search class="h-4 w-4" />
          </template>
          <template #append>
            <button
              v-if="search"
              type="button"
              class="pointer-events-auto rounded-full p-0.5 hover:text-foreground"
              aria-label="Clear search"
              @click="search = ''"
            >
              <X class="h-4 w-4" />
            </button>
          </template>
        </UiInput>
      </div>

      <div class="col-span-12 md:col-span-3">
        <UiSelect v-model="statusFilter">
          <UiSelectTrigger class="w-full">
            <UiSelectValue placeholder="Filter by Status" />
          </UiSelectTrigger>
          <UiSelectContent>
            <UiSelectItem
              v-for="option in statusFilterItems"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </UiSelectItem>
          </UiSelectContent>
        </UiSelect>
      </div>

      <div class="col-span-12 md:col-span-3">
        <UiSelect v-model="paymentFilter">
          <UiSelectTrigger class="w-full">
            <UiSelectValue placeholder="Filter by Payment" />
          </UiSelectTrigger>
          <UiSelectContent>
            <UiSelectItem
              v-for="option in paymentFilterItems"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </UiSelectItem>
          </UiSelectContent>
        </UiSelect>
      </div>
    </div>

    <AdminOrdersOrderTable
      v-model:page="page"
      :orders="paginatedOrders"
      :loading="loading"
      :total="filteredOrders.length"
      :items-per-page="ITEMS_PER_PAGE"
      @view="viewOrderDetails"
      @update-status="updateStatus"
    />

    <AdminOrdersOrderDetailsDialog
      v-model:open="detailsDialog"
      :order="selectedOrder"
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
import {
  Banknote,
  CheckCircle2,
  Clock,
  Package,
  RefreshCw,
  Search,
  X,
} from "lucide-vue-next";
import { storeToRefs } from "pinia";
import orderApi from "~/api/orderApi";
import { useNotificationStore } from "@/stores/notification";
import { useSnackbar } from "@/composables/useSnackbar";
import { isPaidFor } from "@/utils/orderStatus";
import { orderUser } from "@/utils/orders";
import { formatUsd, vndToUsd } from "@/utils/pricing";
import type { Order, OrderStatus, PaymentMethod } from "@/types";

const ITEMS_PER_PAGE = 10;

/** Sentinel value for the "no filter" option, since `""` clears the select. */
const ALL = "all";

const STATUS_OPTIONS: OrderStatus[] = [
  "Pending",
  "Paid",
  "Confirmed",
  "In Delivery",
  "Delivered",
  "Cancelled",
  "Failed",
];

const PAYMENT_OPTIONS: PaymentMethod[] = ["Vnpay", "Momo", "COD"];

const statusFilterItems = [
  { label: "All Statuses", value: ALL },
  ...STATUS_OPTIONS.map((status) => ({ label: status, value: status })),
];

const paymentFilterItems = [
  { label: "All Payments", value: ALL },
  ...PAYMENT_OPTIONS.map((method) => ({ label: method, value: method })),
];

const { snackbar, notify, notifyError } = useSnackbar();

const orders = ref<Order[]>([]);
const loading = ref(false);
const search = ref("");
const statusFilter = ref("");
const paymentFilter = ref("");
const detailsDialog = ref(false);
const selectedOrder = ref<Order | null>(null);
const page = ref(1);

const filteredOrders = computed<Order[]>(() => {
  const term = search.value.trim().toLowerCase();

  return orders.value.filter((order) => {
    if (term) {
      const user = orderUser(order);
      const haystack = [order.orderId, user?.email, user?.username]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(term)) return false;
    }

    if (
      statusFilter.value &&
      statusFilter.value !== ALL &&
      order.status !== statusFilter.value
    ) {
      return false;
    }

    if (
      paymentFilter.value &&
      paymentFilter.value !== ALL &&
      order.paymentMethod !== paymentFilter.value
    ) {
      return false;
    }

    return true;
  });
});

const paginatedOrders = computed<Order[]>(() => {
  const start = (page.value - 1) * ITEMS_PER_PAGE;
  return filteredOrders.value.slice(start, start + ITEMS_PER_PAGE);
});

// "Paid" here means the money is in, not the literal status: a prepaid order
// stays settled once it moves on to Confirmed or Delivered. Counting only the
// literal status made these cards disagree with the dashboard totals.
const settledOrders = computed(() => orders.value.filter(isPaidFor));

const stats = computed(() => [
  {
    label: "Total Orders",
    value: orders.value.length,
    icon: Package,
    accentClass: "bg-customyellow",
    iconClass: "text-customblack",
  },
  {
    label: "Paid Orders",
    value: settledOrders.value.length,
    icon: CheckCircle2,
    accentClass: "bg-success",
    iconClass: "text-success-foreground",
  },
  {
    label: "Pending Orders",
    value: orders.value.filter((order) => order.status === "Pending").length,
    icon: Clock,
    accentClass: "bg-warning",
    iconClass: "text-warning-foreground",
  },
  {
    label: "Total Revenue",
    value: formatUsd(
      vndToUsd(settledOrders.value.reduce((sum, order) => sum + order.total, 0))
    ),
    icon: Banknote,
    accentClass: "bg-waterblue",
    iconClass: "text-white",
  },
]);

const { latest } = storeToRefs(useNotificationStore());

watch(latest, (order) => {
  if (order) fetchOrders();
});

watch([search, statusFilter, paymentFilter], () => {
  page.value = 1;
});

onMounted(fetchOrders);

async function fetchOrders() {
  loading.value = true;
  try {
    orders.value = await orderApi.getAllOrders();
  } catch (error) {
    console.error("Error fetching orders:", error);
    notifyError("Failed to fetch orders");
  } finally {
    loading.value = false;
  }
}

function viewOrderDetails(order: Order) {
  selectedOrder.value = order;
  detailsDialog.value = true;
}

async function updateStatus(order: Order, status: OrderStatus) {
  if (!status || status === order.status) return;

  try {
    const updated = await orderApi.updateOrderStatus(order._id, status);

    // Take the server's version rather than patching fields locally: the
    // confirmation bookkeeping is written server-side, and guessing at it here
    // made the row claim things a refresh would undo.
    const index = orders.value.findIndex((row) => row._id === order._id);
    if (index !== -1) orders.value[index] = updated;
    if (selectedOrder.value?._id === order._id) selectedOrder.value = updated;

    notify(`Order status updated to ${status}`);
  } catch (error: any) {
    console.error("Error updating order status:", error);
    notifyError(error.response?.data?.msg || "Failed to update order status");
    // Revert on error
    await fetchOrders();
  }
}
</script>
