<template>
  <div>
    <AdminPageHeader
      title="Orders"
      description="Track payments, move orders through fulfillment and review details."
    >
      <template #actions>
        <UiButton variant="outline" :loading="loading" @click="fetchOrders">
          <RefreshCw v-if="!loading" class="h-4 w-4" />
          Refresh
        </UiButton>
      </template>
    </AdminPageHeader>

    <AdminStatStrip :items="stats" :loading="loading && !orders.length" />

    <AdminPanel :loading="loading && orders.length > 0">
      <template #toolbar>
        <AdminSearchInput
          v-model="search"
          placeholder="Search order ID, customer or email"
        />
        <div class="flex items-center gap-2 md:ml-auto">
          <UiSelect v-model="statusFilter">
            <UiSelectTrigger class="w-full bg-background md:w-44" aria-label="Filter by status">
              <UiSelectValue placeholder="All statuses" />
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

          <UiSelect v-model="paymentFilter">
            <UiSelectTrigger class="w-full bg-background md:w-40" aria-label="Filter by payment">
              <UiSelectValue placeholder="All payments" />
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
      </template>

      <AdminOrdersOrderTable
        :orders="paginatedOrders"
        :loading="loading && !orders.length"
        @view="viewOrderDetails"
        @update-status="updateStatus"
      />

      <template #footer>
        <AdminTablePagination
          v-model:page="page"
          :total="filteredOrders.length"
          :items-per-page="ITEMS_PER_PAGE"
          noun="orders"
        />
      </template>
    </AdminPanel>

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
} from "lucide-vue-next";
import { storeToRefs } from "pinia";
import orderApi from "~/api/orderApi";
import { useNotificationStore } from "@/stores/notification";
import { useSnackbar } from "@/composables/useSnackbar";
import { isPaidFor } from "@/utils/orderStatus";
import { orderUser } from "@/utils/orders";
import { formatUsd, vndToUsd } from "@/utils/pricing";
import type { Order, OrderStatus, PaymentMethod } from "@/types";
import type { AdminStat } from "@/types/admin";

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

const stats = computed<AdminStat[]>(() => [
  {
    label: "Orders",
    value: orders.value.length,
    icon: Package,
  },
  {
    label: "Paid",
    value: settledOrders.value.length,
    icon: CheckCircle2,
  },
  {
    label: "Pending",
    value: orders.value.filter((order) => order.status === "Pending").length,
    icon: Clock,
  },
  {
    label: "Collected revenue",
    value: formatUsd(
      vndToUsd(settledOrders.value.reduce((sum, order) => sum + order.total, 0))
    ),
    icon: Banknote,
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
