<template>
  <div>
    <AdminPageHeader
      title="Dashboard"
      description="How the store is doing across every order to date."
    >
      <template #actions>
        <UiButton variant="outline" :loading="loading" @click="fetchDashboardData">
          <RefreshCw v-if="!loading" class="h-4 w-4" />
          Refresh
        </UiButton>
      </template>
    </AdminPageHeader>

    <AdminStatStrip :items="stats" :loading="loading && !loaded" />

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <AdminPanel
        title="Recent orders"
        description="The latest orders placed in the store"
        class="xl:col-span-2"
        :loading="loading && loaded"
      >
        <template #actions>
          <UiButton
            variant="ghost"
            size="sm"
            class="text-muted-foreground hover:text-foreground"
            @click="router.push('/admin?tab=order-management')"
          >
            View all
            <ArrowRight class="h-4 w-4" />
          </UiButton>
        </template>

        <div class="overflow-x-auto border-t border-border">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Status</th>
                <th class="!text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <AdminTableSkeleton v-if="loading && !loaded" :columns="4" :rows="5" />
              <template v-else>
                <tr v-for="order in recentOrders" :key="order._id">
                  <td>
                    <div class="font-mono text-[13px] font-medium text-foreground">
                      {{ order.orderId }}
                    </div>
                    <div class="text-xs text-muted-foreground">
                      {{ formatDateTime(order.createdAt) }}
                    </div>
                  </td>
                  <td>
                    <div class="max-w-[220px] truncate font-medium">
                      {{ orderUser(order)?.username || "Guest" }}
                    </div>
                    <div class="text-xs text-muted-foreground">
                      {{ order.items?.length || 0 }}
                      {{ order.items?.length === 1 ? "item" : "items" }}
                    </div>
                  </td>
                  <td>
                    <AdminPill :status="order.status">{{ order.status }}</AdminPill>
                  </td>
                  <td class="whitespace-nowrap text-right font-medium">
                    {{ formatVnd(order.total) }}
                  </td>
                </tr>
                <tr v-if="!recentOrders.length" class="hover:bg-transparent">
                  <td colspan="4">
                    <AdminEmptyState
                      :icon="PackageCheck"
                      title="No orders yet"
                      description="New orders show up here as soon as customers check out."
                    />
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </AdminPanel>

      <AdminPanel
        title="Orders by status"
        :description="`${totalOrders} orders in total`"
      >
        <div class="border-t border-border px-5 py-4">
          <ul v-if="loading && !loaded" class="space-y-4">
            <li v-for="n in 6" :key="n" class="space-y-2">
              <UiSkeleton class="h-3.5 w-full bg-muted" />
              <UiSkeleton class="h-1.5 w-1/2 bg-muted" />
            </li>
          </ul>

          <ul v-else class="space-y-3.5">
            <li
              v-for="row in statusBreakdown"
              :key="row.status"
              :title="`${row.status}: ${row.count} orders (${row.share}%)`"
            >
              <div class="flex items-center justify-between gap-3 text-sm">
                <span class="flex min-w-0 items-center gap-2">
                  <component
                    :is="orderStatusIcon(row.status)"
                    class="h-4 w-4 shrink-0 text-muted-foreground"
                  />
                  <span class="truncate text-foreground">{{ row.status }}</span>
                </span>
                <span class="shrink-0 tabular-nums">
                  <span class="font-medium text-foreground">{{ row.count }}</span>
                  <span class="ml-1.5 inline-block w-10 text-right text-xs text-muted-foreground">
                    {{ row.share }}%
                  </span>
                </span>
              </div>
              <div
                class="mt-1.5 h-1.5 rounded-full bg-primary transition-[width] duration-500 ease-out"
                :class="row.count ? '' : 'opacity-0'"
                :style="{ width: `${Math.max(row.share, row.count ? 2 : 0)}%` }"
              />
            </li>
          </ul>
        </div>
      </AdminPanel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { orderStatusIcon } from "@/utils/orderStatus";
import { formatDateTime, formatVnd, orderUser } from "@/utils/orders";
import orderApi from "~/api/orderApi";
import type { Order, OrderStatus } from "@/types";
import type { AdminStat } from "@/types/admin";
import {
  ArrowRight,
  Clock,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  Wallet,
} from "lucide-vue-next";

interface OrderStat {
  _id: OrderStatus;
  count: number;
}

interface DashboardData {
  totalRevenue: number;
  orderStats: OrderStat[];
  recentOrders: Order[];
}

const STATUS_ORDER: OrderStatus[] = [
  "Pending",
  "Paid",
  "Confirmed",
  "In Delivery",
  "Delivered",
  "Cancelled",
  "Failed",
];

const router = useRouter();

const loading = ref(false);
const loaded = ref(false);
const totalRevenue = ref(0);
const orderStats = ref<OrderStat[]>([]);
const recentOrders = ref<Order[]>([]);

function countOf(status: OrderStatus): number {
  return orderStats.value.find((stat) => stat._id === status)?.count ?? 0;
}

const totalOrders = computed(() =>
  orderStats.value.reduce((sum, stat) => sum + stat.count, 0)
);

const statusBreakdown = computed(() =>
  STATUS_ORDER.map((status) => {
    const count = countOf(status);
    const share = totalOrders.value
      ? Math.round((count / totalOrders.value) * 100)
      : 0;
    return { status, count, share };
  })
);

const stats = computed<AdminStat[]>(() => [
  {
    label: "Revenue",
    value: formatVnd(totalRevenue.value),
    icon: Wallet,
  },
  {
    label: "Orders",
    value: totalOrders.value,
    icon: ShoppingBag,
  },
  {
    label: "Pending",
    value: countOf("Pending"),
    icon: Clock,
    hint: "Waiting for payment or confirmation",
  },
  {
    label: "Delivered",
    value: countOf("Delivered"),
    icon: PackageCheck,
  },
]);

async function fetchDashboardData() {
  loading.value = true;
  try {
    const data = (await orderApi.getDashboardStats()) as unknown as DashboardData;
    totalRevenue.value = data.totalRevenue;
    orderStats.value = data.orderStats;
    recentOrders.value = data.recentOrders;
    loaded.value = true;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  } finally {
    loading.value = false;
  }
}

onMounted(fetchDashboardData);
</script>
