<template>
  <div>
    <div class="w-full p-4">
      <!-- Header Section -->
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="mb-2 text-3xl font-bold text-foreground">
            Order Management
          </h1>
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

      <!-- Statistics Cards -->
      <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <UiCard
          class="rounded-2xl transition duration-200 hover:-translate-y-1 hover:shadow-md"
        >
          <div class="flex items-center p-4">
            <span
              class="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-customyellow"
            >
              <Package class="h-6 w-6 text-customblack" />
            </span>
            <div>
              <p class="mb-0 text-xs text-muted-foreground">Total Orders</p>
              <p class="mb-0 text-2xl font-semibold tabular-nums text-foreground">
                {{ totalOrders }}
              </p>
            </div>
          </div>
        </UiCard>
        <UiCard
          class="rounded-2xl transition duration-200 hover:-translate-y-1 hover:shadow-md"
        >
          <div class="flex items-center p-4">
            <span
              class="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success"
            >
              <CheckCircle2 class="h-6 w-6 text-success-foreground" />
            </span>
            <div>
              <p class="mb-0 text-xs text-muted-foreground">Paid Orders</p>
              <p class="mb-0 text-2xl font-semibold tabular-nums text-foreground">
                {{ paidOrders }}
              </p>
            </div>
          </div>
        </UiCard>
        <UiCard
          class="rounded-2xl transition duration-200 hover:-translate-y-1 hover:shadow-md"
        >
          <div class="flex items-center p-4">
            <span
              class="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning"
            >
              <Clock class="h-6 w-6 text-warning-foreground" />
            </span>
            <div>
              <p class="mb-0 text-xs text-muted-foreground">Pending Orders</p>
              <p class="mb-0 text-2xl font-semibold tabular-nums text-foreground">
                {{ pendingOrders }}
              </p>
            </div>
          </div>
        </UiCard>
        <UiCard
          class="rounded-2xl transition duration-200 hover:-translate-y-1 hover:shadow-md"
        >
          <div class="flex items-center p-4">
            <span
              class="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-waterblue"
            >
              <Banknote class="h-6 w-6 text-white" />
            </span>
            <div>
              <p class="mb-0 text-xs text-muted-foreground">Total Revenue</p>
              <p class="mb-0 text-2xl font-semibold tabular-nums text-foreground">
                ${{ totalRevenue }}
              </p>
            </div>
          </div>
        </UiCard>
      </div>

      <!-- Search and Filter Section -->
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
                v-for="opt in statusFilterItems"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
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
                v-for="opt in paymentFilterItems"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>
        </div>
      </div>

      <!-- Orders Table -->
      <UiCard class="rounded-2xl">
        <div class="overflow-x-auto rounded-2xl">
          <table class="w-full text-sm">
            <thead class="bg-muted/60 text-left">
              <tr>
                <th class="px-4 py-3 font-medium text-muted-foreground">
                  Order ID
                </th>
                <th class="px-4 py-3 font-medium text-muted-foreground">
                  Customer
                </th>
                <th class="px-4 py-3 font-medium text-muted-foreground">
                  Items
                </th>
                <th class="px-4 py-3 font-medium text-muted-foreground">
                  Total
                </th>
                <th class="px-4 py-3 font-medium text-muted-foreground">
                  Payment
                </th>
                <th class="px-4 py-3 font-medium text-muted-foreground">
                  Status
                </th>
                <th class="px-4 py-3 font-medium text-muted-foreground">
                  Date
                </th>
                <th class="px-4 py-3 text-center font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-if="loading">
                <td colspan="8" class="px-4 py-8 text-center">
                  <UiSpinner size="lg" class="mx-auto text-waterblue" />
                </td>
              </tr>
              <template v-else>
                <tr
                  v-for="order in paginatedOrders"
                  :key="order._id"
                  class="hover:bg-muted/40"
                >
                  <!-- Order ID -->
                  <td class="px-4 py-3">
                    <div class="flex items-center">
                      <Package class="mr-2 h-4 w-4 text-muted-foreground" />
                      <span class="font-medium">{{ order.orderId }}</span>
                    </div>
                  </td>

                  <!-- User -->
                  <td class="px-4 py-3">
                    <div>
                      <div class="font-medium">
                        {{ orderUser(order)?.username || "N/A" }}
                      </div>
                      <div class="text-xs text-muted-foreground">
                        {{ orderUser(order)?.email || "N/A" }}
                      </div>
                    </div>
                  </td>

                  <!-- Items -->
                  <td class="px-4 py-3">
                    <span
                      class="inline-flex items-center rounded-full bg-waterblue/15 px-2.5 py-0.5 text-xs font-semibold text-waterblue"
                    >
                      {{ order.items.length }} item(s)
                    </span>
                  </td>

                  <!-- Total -->
                  <td class="px-4 py-3">
                    <div class="font-bold">
                      {{ formatCurrency(order.total) }}
                    </div>
                  </td>

                  <!-- Payment Method -->
                  <td class="px-4 py-3">
                    <span
                      class="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                      :class="getPaymentClass(order.paymentMethod)"
                    >
                      <component
                        :is="getPaymentIcon(order.paymentMethod)"
                        class="h-3.5 w-3.5"
                      />
                      {{ order.paymentMethod }}
                    </span>
                  </td>

                  <!-- Status -->
                  <td class="px-4 py-3">
                    <span
                      class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      :class="getStatusClass(order.status)"
                    >
                      <component
                        :is="getStatusIcon(order.status)"
                        class="h-3.5 w-3.5"
                      />
                      {{ order.status }}
                    </span>
                  </td>

                  <!-- Date -->
                  <td class="px-4 py-3">
                    <div class="text-xs">
                      {{ formatDate(order.createdAt) }}
                    </div>
                  </td>

                  <!-- Actions -->
                  <td class="px-4 py-3">
                    <div class="flex items-center justify-center gap-2">
                      <UiSelect
                        :model-value="order.status"
                        :disabled="allowedTransitions(order.paymentMethod, order.status).length === 0"
                        @update:model-value="
                          (newStatus) =>
                            quickUpdateStatus(order, newStatus as string)
                        "
                      >
                        <UiSelectTrigger class="w-36">
                          <UiSelectValue />
                        </UiSelectTrigger>
                        <UiSelectContent>
                          <!-- The current status is listed so the trigger has a
                               label; everything else is what this order may
                               legally become next. -->
                          <UiSelectItem :value="order.status" disabled>
                            {{ order.status }}
                          </UiSelectItem>
                          <UiSelectItem
                            v-for="opt in allowedTransitions(
                              order.paymentMethod,
                              order.status
                            )"
                            :key="opt"
                            :value="opt"
                          >
                            {{ opt }}
                          </UiSelectItem>
                        </UiSelectContent>
                      </UiSelect>
                      <UiTooltipProvider :delay-duration="200">
                        <UiTooltip>
                          <UiTooltipTrigger as-child>
                            <UiButton
                              variant="ghost"
                              size="iconSm"
                              class="text-primary"
                              @click="viewOrderDetails(order)"
                            >
                              <Eye class="h-5 w-5" />
                            </UiButton>
                          </UiTooltipTrigger>
                          <UiTooltipContent side="top">
                            View Details
                          </UiTooltipContent>
                        </UiTooltip>
                      </UiTooltipProvider>
                    </div>
                  </td>
                </tr>
                <tr v-if="!paginatedOrders.length">
                  <td
                    colspan="8"
                    class="px-4 py-8 text-center text-muted-foreground"
                  >
                    No orders found
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
        <div
          v-if="filteredOrders.length > itemsPerPage"
          class="flex justify-center border-t border-border py-3"
        >
          <UiPagination
            v-slot="{ page: currentPage }"
            v-model:page="page"
            :total="filteredOrders.length"
            :items-per-page="itemsPerPage"
            :sibling-count="1"
            show-edges
          >
            <UiPaginationContent v-slot="{ items }">
              <UiPaginationPrevious />
              <template v-for="(item, index) in items">
                <UiPaginationItem
                  v-if="item.type === 'page'"
                  :key="index"
                  :value="item.value"
                  :is-active="item.value === currentPage"
                >
                  {{ item.value }}
                </UiPaginationItem>
                <UiPaginationEllipsis v-else :key="item.type" :index="index" />
              </template>
              <UiPaginationNext />
            </UiPaginationContent>
          </UiPagination>
        </div>
      </UiCard>
    </div>

    <!-- Order Details Dialog -->
    <UiDialog v-model:open="detailsDialog">
      <UiDialogContent class="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
        <UiDialogHeader>
          <UiDialogTitle class="flex items-center gap-2">
            <Package class="h-5 w-5 text-waterblue" />
            <span>Order Details - {{ selectedOrder?.orderId }}</span>
          </UiDialogTitle>
        </UiDialogHeader>

        <div v-if="selectedOrder" class="grid grid-cols-12 gap-4">
          <!-- Order Information -->
          <div class="col-span-12 md:col-span-6">
            <div class="h-full rounded-lg border border-border">
              <div class="flex items-center gap-2 px-4 pt-4 text-base font-bold">
                <Info class="h-5 w-5" />
                Order Information
              </div>
              <div class="space-y-3 p-4">
                <div class="flex items-start gap-3">
                  <Hash class="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p class="text-sm font-medium">Order ID</p>
                    <p class="text-sm text-muted-foreground">
                      {{ selectedOrder.orderId }}
                    </p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <Banknote class="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p class="text-sm font-medium">Payment Method</p>
                    <p class="text-sm text-muted-foreground">
                      {{ selectedOrder.paymentMethod }}
                    </p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <Tag class="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p class="text-sm font-medium">Status</p>
                    <span
                      class="mt-0.5 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      :class="getStatusClass(selectedOrder.status)"
                    >
                      {{ selectedOrder.status }}
                    </span>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <Calendar class="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p class="text-sm font-medium">Order Date</p>
                    <p class="text-sm text-muted-foreground">
                      {{ formatDate(selectedOrder.createdAt) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Customer Information -->
          <div class="col-span-12 md:col-span-6">
            <div class="h-full rounded-lg border border-border">
              <div class="flex items-center gap-2 px-4 pt-4 text-base font-bold">
                <UserIcon class="h-5 w-5" />
                Customer Information
              </div>
              <div class="space-y-3 p-4">
                <div class="flex items-start gap-3">
                  <UserIcon class="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p class="text-sm font-medium">Username</p>
                    <p class="text-sm text-muted-foreground">
                      {{ orderUser(selectedOrder)?.username || "N/A" }}
                    </p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <Mail class="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p class="text-sm font-medium">Email</p>
                    <p class="text-sm text-muted-foreground">
                      {{ orderUser(selectedOrder)?.email || "N/A" }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Delivery details: what the courier needs. COD orders always
               carry this; prepaid ones predate the form. -->
          <div v-if="selectedOrder.shipping" class="col-span-12">
            <div class="rounded-lg border border-primary/50 bg-primary/5">
              <div
                class="flex items-center gap-2 px-4 pt-4 text-base font-bold"
              >
                <Truck class="h-5 w-5 text-primary" />
                Delivery Details
              </div>
              <div class="grid gap-3 p-4 sm:grid-cols-2">
                <div>
                  <p class="text-sm font-medium">Recipient</p>
                  <p class="text-sm text-muted-foreground">
                    {{ selectedOrder.shipping.fullName }}
                  </p>
                </div>
                <div>
                  <p class="text-sm font-medium">Phone</p>
                  <a
                    :href="`tel:${selectedOrder.shipping.phone}`"
                    class="text-sm font-semibold text-primary hover:underline"
                  >
                    {{ selectedOrder.shipping.phone }}
                  </a>
                </div>
                <div class="sm:col-span-2">
                  <p class="text-sm font-medium">Address</p>
                  <p class="text-sm text-muted-foreground">
                    {{ selectedOrder.shipping.address }}
                  </p>
                </div>
                <div v-if="selectedOrder.shipping.note" class="sm:col-span-2">
                  <p class="text-sm font-medium">Note</p>
                  <p class="text-sm italic text-muted-foreground">
                    {{ selectedOrder.shipping.note }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Voucher Information (if exists) -->
          <div v-if="selectedOrder.voucher" class="col-span-12">
            <div class="rounded-lg border border-success/50 bg-success/5">
              <div class="flex items-center gap-2 px-4 pt-4 text-base font-bold">
                <TicketPercent class="h-5 w-5 text-success" />
                Voucher Applied
              </div>
              <div class="flex items-center justify-between p-4">
                <div>
                  <span
                    v-if="selectedOrder.voucher.code"
                    class="mb-2 inline-flex items-center rounded-full bg-success px-2.5 py-0.5 text-xs font-semibold text-success-foreground"
                  >
                    {{ selectedOrder.voucher.code }}
                  </span>
                  <span
                    v-else
                    class="mb-2 inline-flex items-center rounded-full bg-destructive px-2.5 py-0.5 text-xs font-semibold text-destructive-foreground"
                  >
                    No Voucher
                  </span>
                </div>
                <div class="text-lg font-semibold text-success">
                  -{{ formatCurrency(selectedOrder.voucher.discountAmount) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="col-span-12">
            <div class="rounded-lg border border-border">
              <div class="flex items-center gap-2 px-4 pt-4 text-base font-bold">
                <ShoppingCart class="h-5 w-5" />
                Order Items
              </div>
              <div class="overflow-x-auto p-0 pt-2">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-border text-left">
                      <th class="px-4 py-2 font-medium text-muted-foreground">
                        Book
                      </th>
                      <th class="px-4 py-2 font-medium text-muted-foreground">
                        Type
                      </th>
                      <th class="px-4 py-2 text-center font-medium text-muted-foreground">
                        Quantity
                      </th>
                      <th class="px-4 py-2 text-right font-medium text-muted-foreground">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-border">
                    <tr v-for="(item, index) in selectedOrder.items" :key="index">
                      <td class="px-4">
                        <div class="flex items-center py-2">
                          <img
                            :src="item.bookId?.cover_url"
                            width="40"
                            height="60"
                            class="mr-3 rounded bg-muted object-cover"
                          />
                          <div>
                            <div class="font-medium">
                              {{ item.bookId?.title || "N/A" }}
                            </div>
                            <div class="text-xs text-muted-foreground">
                              {{ item.bookId?.authors?.[0] || "Unknown" }}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td class="px-4 py-2">
                        <span
                          class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                          :class="
                            item.productType === 'ebook'
                              ? 'bg-success/15 text-success'
                              : 'bg-waterblue/15 text-waterblue'
                          "
                        >
                          {{
                            item.productType === "ebook"
                              ? "📱 Ebook"
                              : "📚 Hardbook"
                          }}
                        </span>
                      </td>
                      <td class="px-4 py-2 text-center">{{ item.quantity }}</td>
                      <td class="px-4 py-2 text-right font-medium">
                        ${{ calculateItemPrice(item) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="col-span-12">
            <div class="rounded-lg border border-waterblue/50 bg-waterblue/5 p-4">
              <div class="mb-2 flex items-center justify-between">
                <span class="text-base font-medium">Subtotal:</span>
                <span class="text-base font-medium">
                  {{ formatCurrency(calculateSubtotal(selectedOrder)) }}
                </span>
              </div>
              <div
                v-if="selectedOrder.voucher"
                class="mb-2 flex items-center justify-between"
              >
                <span class="text-base font-medium text-success">Discount:</span>
                <span class="text-base font-medium text-success">
                  -{{ formatCurrency(selectedOrder.voucher.discountAmount) }}
                </span>
              </div>
              <UiSeparator class="my-2" />
              <div class="flex items-center justify-between">
                <span class="text-lg font-bold">Total:</span>
                <span class="text-lg font-bold text-waterblue">
                  {{ formatCurrency(selectedOrder.total) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <UiDialogFooter>
          <UiButton
            variant="ghost"
            class="text-muted-foreground"
            @click="detailsDialog = false"
          >
            Close
          </UiButton>
        </UiDialogFooter>
      </UiDialogContent>
    </UiDialog>

    <!-- Snackbar -->
    <SnackbarAlert
      v-model="snackbar"
      :text="snackbarText"
      :color="snackbarColor"
      :timeout="3000"
    />
  </div>
</template>

<script setup lang="ts">
import type { Component } from "vue";
import orderApi from "~/api/orderApi";
import type { Order, OrderItem, OrderStatus, PaymentMethod, User } from "@/types";
import { allowedTransitions, isPaidFor } from "@/utils/orderStatus";
import {
  Ban,
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  Hash,
  HelpCircle,
  Info,
  Mail,
  Package,
  PackageCheck,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingCart,
  Tag,
  TicketPercent,
  Truck,
  User as UserIcon,
  Wallet,
  X,
  XCircle,
} from "lucide-vue-next";

const orders = ref<Order[]>([]);
const loading = ref(false);
const search = ref("");
const statusFilter = ref("");
const paymentFilter = ref("");
const detailsDialog = ref(false);
const selectedOrder = ref<Order | null>(null);
const snackbar = ref(false);
const snackbarText = ref("");
const snackbarColor = ref("success");

const page = ref(1);
const itemsPerPage = 10;

const statusOptions: OrderStatus[] = [
  "Pending",
  "Paid",
  "Confirmed",
  "In Delivery",
  "Delivered",
  "Cancelled",
  "Failed",
];
const paymentOptions: PaymentMethod[] = ["Vnpay", "Momo", "COD"];

const statusFilterItems = [
  { label: "All Statuses", value: "all" },
  ...statusOptions.map((s) => ({ label: s, value: s as string })),
];
const paymentFilterItems = [
  { label: "All Payments", value: "all" },
  ...paymentOptions.map((p) => ({ label: p, value: p })),
];

const filteredOrders = computed<Order[]>(() => {
  let filtered = orders.value;

  // Search filter
  if (search.value) {
    const searchLower = search.value.toLowerCase();
    filtered = filtered.filter(
      (order) =>
        order.orderId.toLowerCase().includes(searchLower) ||
        orderUser(order)?.email?.toLowerCase().includes(searchLower) ||
        orderUser(order)?.username?.toLowerCase().includes(searchLower)
    );
  }

  // Status filter
  if (statusFilter.value && statusFilter.value !== "all") {
    filtered = filtered.filter((order) => order.status === statusFilter.value);
  }

  // Payment filter
  if (paymentFilter.value && paymentFilter.value !== "all") {
    filtered = filtered.filter(
      (order) => order.paymentMethod === paymentFilter.value
    );
  }

  return filtered;
});

const paginatedOrders = computed<Order[]>(() => {
  const start = (page.value - 1) * itemsPerPage;
  return filteredOrders.value.slice(start, start + itemsPerPage);
});

watch([search, statusFilter, paymentFilter], () => {
  page.value = 1;
});

const totalOrders = computed(() => orders.value.length);
// "Paid" here means the money is in, not the literal status: a prepaid order
// stays settled once it moves on to Confirmed or Delivered. Counting only the
// literal status made these cards disagree with the dashboard totals.
const paidOrders = computed(() => orders.value.filter(isPaidFor).length);
const pendingOrders = computed(
  () => orders.value.filter((order) => order.status === "Pending").length
);
const totalRevenue = computed(() => {
  const revenue = orders.value
    .filter(isPaidFor)
    .reduce((sum, order) => sum + order.total, 0);
  return (revenue / 24000).toFixed(2); // Convert VND to USD
});

function orderUser(order: Order): User | null {
  return typeof order.userId === "object" && order.userId !== null
    ? order.userId
    : null;
}

async function fetchOrders() {
  try {
    loading.value = true;
    orders.value = await orderApi.getAllOrders();
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    showSnackbar("Failed to fetch orders", "error");
  } finally {
    loading.value = false;
  }
}

function viewOrderDetails(order: Order) {
  selectedOrder.value = order;
  detailsDialog.value = true;
}

async function quickUpdateStatus(order: Order, newStatus?: string) {
  if (!newStatus || newStatus === order.status) {
    return;
  }

  try {
    const updated = await orderApi.updateOrderStatus(
      order._id,
      newStatus as OrderStatus
    );

    // Take the server's version rather than patching fields locally: the
    // confirmation bookkeeping is written server-side, and guessing at it here
    // made the row claim things a refresh would undo.
    const index = orders.value.findIndex((o) => o._id === order._id);
    if (index !== -1) {
      orders.value[index] = updated;
    }
    if (selectedOrder.value?._id === order._id) {
      selectedOrder.value = updated;
    }

    showSnackbar(`Order status updated to ${newStatus}`, "success");
  } catch (error: any) {
    console.error("Error updating order status:", error);
    showSnackbar(
      error.response?.data?.msg || "Failed to update order status",
      "error"
    );
    // Revert on error
    await fetchOrders();
  }
}

function getStatusClass(status: OrderStatus): string {
  const classes: Record<string, string> = {
    Pending: "bg-warning text-warning-foreground",
    Paid: "bg-success text-success-foreground",
    Confirmed: "bg-info text-info-foreground",
    "In Delivery": "bg-purple-600 text-purple-50 dark:bg-purple-500",
    Delivered: "bg-teal-600 text-teal-50 dark:bg-teal-500",
    Failed: "bg-destructive text-destructive-foreground",
    Cancelled: "bg-muted text-muted-foreground",
  };
  return classes[status] || "bg-muted text-muted-foreground";
}

function getStatusIcon(status: OrderStatus): Component {
  const icons: Record<string, Component> = {
    Pending: Clock,
    Paid: CheckCircle2,
    Confirmed: ShieldCheck,
    "In Delivery": Truck,
    Delivered: PackageCheck,
    Failed: XCircle,
    Cancelled: Ban,
  };
  return icons[status] || HelpCircle;
}

function getPaymentClass(method: PaymentMethod): string {
  const classes: Record<PaymentMethod, string> = {
    Vnpay: "border-primary/40 text-primary",
    Momo: "border-success/40 text-success",
    // COD is the one that still owes money, so it reads as a warning.
    COD: "border-warning/40 text-warning",
  };
  return classes[method] ?? "border-border text-muted-foreground";
}

function getPaymentIcon(method: PaymentMethod): Component {
  const icons: Record<PaymentMethod, Component> = {
    Vnpay: CreditCard,
    Momo: Wallet,
    COD: Banknote,
  };
  return icons[method] ?? Wallet;
}

function formatDate(date?: string): string {
  if (!date) return "";
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function calculateItemPrice(item: OrderItem): string {
  const price =
    (item.bookId?.price as number) *
    item.quantity *
    (item.productType === "ebook" ? 0.7 : 1);
  return price.toFixed(2);
}

function calculateSubtotal(order: Order): number {
  return order.total + (order.voucher?.discountAmount || 0);
}

function showSnackbar(text: string, color = "success") {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
}

onMounted(() => {
  fetchOrders();
});
</script>
