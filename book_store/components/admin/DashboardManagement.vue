<template>
  <div>
    <!-- Stats Cards -->
    <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
      <UiCard
        v-for="stat in statsCards"
        :key="stat.title"
        class="rounded-2xl transition duration-200 hover:-translate-y-1 hover:shadow-md"
      >
        <div class="flex items-center justify-between p-4">
          <div>
            <p class="mb-1 text-xs text-muted-foreground">{{ stat.title }}</p>
            <h3 class="text-3xl font-bold tabular-nums text-foreground">
              {{ stat.value }}
            </h3>
          </div>
          <span
            class="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg"
            :class="stat.avatarClass"
          >
            <component
              :is="stat.icon"
              class="h-[30px] w-[30px]"
              :class="stat.iconClass"
            />
          </span>
        </div>
      </UiCard>
    </div>

    <!-- Revenue Chart -->
    <div class="mb-6">
      <UiCard class="rounded-2xl">
        <div class="p-4 pb-0 text-lg font-bold text-foreground">
          Revenue Chart
        </div>
        <div class="p-4">
          <div v-if="!loading" class="relative h-[300px]">
            <canvas ref="revenueChart"></canvas>
          </div>
          <div v-else class="py-12 text-center">
            <UiSpinner size="lg" class="mx-auto text-waterblue" />
          </div>
        </div>
      </UiCard>
    </div>

    <!-- Recent Orders -->
    <div>
      <UiCard class="rounded-2xl">
        <div class="flex items-center justify-between p-4 pb-0">
          <span class="text-lg font-bold text-foreground">Recent Orders</span>
          <UiButton
            variant="ghost"
            size="sm"
            class="text-waterblue hover:text-waterblue"
            @click="router.push('/admin?tab=order-management')"
          >
            View All
          </UiButton>
        </div>
        <div class="overflow-x-auto p-4">
          <table class="w-full text-sm">
            <thead class="text-left">
              <tr class="border-b border-border">
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
                  Status
                </th>
                <th class="px-4 py-3 font-medium text-muted-foreground">
                  Date
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr
                v-for="order in recentOrders"
                :key="order._id"
                class="hover:bg-muted/40"
              >
                <td class="px-4 py-3 font-medium">{{ order.orderId }}</td>
                <td class="px-4 py-3">
                  {{ orderUser(order)?.username || "N/A" }}
                </td>
                <td class="px-4 py-3">{{ order.items?.length || 0 }} items</td>
                <td class="px-4 py-3 font-bold">
                  {{ formatCurrency(order.total) }}
                </td>
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
                <td class="px-4 py-3">{{ formatDate(order.createdAt) }}</td>
              </tr>
              <tr v-if="recentOrders.length === 0">
                <td colspan="6" class="px-4 py-8 text-center">
                  <PackageCheck
                    class="mx-auto h-12 w-12 text-muted-foreground/30"
                  />
                  <p class="mt-2 text-xs text-muted-foreground">
                    No recent orders
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from "@/composables/useTheme";
import type { Component } from "vue";
import orderApi from "~/api/orderApi";
import type { Order, OrderStatus, User } from "@/types";
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
} from "chart.js";
import {
  Ban,
  CheckCircle2,
  Clock,
  DollarSign,
  HelpCircle,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-vue-next";

// Register only the controllers/elements/scales/plugins the bar chart needs.
Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip
);

interface OrderStat {
  _id: OrderStatus;
  count: number;
}

interface DashboardData {
  totalRevenue: number;
  orderStats: OrderStat[];
  recentOrders: Order[];
}

const router = useRouter();
const { isDark } = useTheme();

const loading = ref(false);
const totalRevenue = ref(0);
const orderStats = ref<OrderStat[]>([]);
const recentOrders = ref<Order[]>([]);
const revenueChart = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

interface StatCard {
  title: string;
  value: string | number;
  icon: Component;
  avatarClass: string;
  iconClass: string;
}

const statsCards = computed<StatCard[]>(() => {
  const paidOrders =
    orderStats.value.find((s) => s._id !== "Pending")?.count || 0;
  const totalOrders = orderStats.value.reduce((sum, s) => sum + s.count, 0);
  const failedOrders =
    orderStats.value.find((s) => s._id === "Failed")?.count || 0;

  return [
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue.value),
      icon: DollarSign,
      avatarClass: "bg-lightgreen",
      iconClass: "text-white",
    },
    {
      title: "Total Orders",
      value: totalOrders,
      icon: ShoppingBag,
      avatarClass: "bg-customyellow",
      iconClass: "text-customblack",
    },
    {
      title: "Completed",
      value: paidOrders,
      icon: CheckCircle2,
      avatarClass: "bg-waterblue",
      iconClass: "text-white",
    },
    {
      title: "Failed",
      value: failedOrders,
      icon: XCircle,
      avatarClass: "bg-destructive",
      iconClass: "text-destructive-foreground",
    },
  ];
});

function orderUser(order: Order): User | null {
  return typeof order.userId === "object" && order.userId !== null
    ? order.userId
    : null;
}

async function fetchDashboardData() {
  loading.value = true;
  try {
    const data = (await orderApi.getDashboardStats()) as unknown as DashboardData;
    totalRevenue.value = data.totalRevenue;
    orderStats.value = data.orderStats;
    recentOrders.value = data.recentOrders;

    // Render chart after data is loaded
    nextTick(() => {
      renderChart();
    });
  } catch (error: any) {
    console.error("Error fetching dashboard data:", error);
  } finally {
    loading.value = false;
  }
}

function renderChart() {
  if (!revenueChart.value) return;

  const ctx = revenueChart.value.getContext("2d");
  if (!ctx) return;

  // Destroy existing chart
  if (chart) {
    chart.destroy();
  }

  // Brand palette (waterblue #5295D0) — readable on light and dark grounds.
  const tickColor = isDark.value
    ? "rgba(241, 242, 238, 0.75)" // whitesmoke
    : "rgba(25, 27, 36, 0.65)"; // customblack
  const gridColor = isDark.value
    ? "rgba(241, 242, 238, 0.08)"
    : "rgba(25, 27, 36, 0.08)";

  // Simple bar chart showing total revenue
  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Total Revenue"],
      datasets: [
        {
          label: "Revenue (VND)",
          data: [totalRevenue.value],
          backgroundColor: "rgba(82, 149, 208, 0.7)", // waterblue
          borderColor: "#5295D0",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              return `Revenue: ${formatCurrency(context.parsed.y ?? 0)}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: tickColor,
          },
          grid: {
            color: gridColor,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: tickColor,
            callback: (value) => {
              return formatCurrency(Number(value));
            },
          },
          grid: {
            color: gridColor,
          },
        },
      },
    },
  });
}

// Re-render the chart with theme-appropriate axis colors when the theme flips.
watch(isDark, () => {
  if (!loading.value && revenueChart.value) {
    renderChart();
  }
});

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function formatDate(date?: string): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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

onMounted(() => {
  fetchDashboardData();
});

onBeforeUnmount(() => {
  if (chart) {
    chart.destroy();
  }
});
</script>
