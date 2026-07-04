<template>
  <div>
    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" md="3" v-for="stat in statsCards" :key="stat.title">
        <v-card class="stat-card admin-card" elevation="0">
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <p class="text-caption text-grey mb-1">{{ stat.title }}</p>
                <h3 class="text-h4 font-weight-bold stat-value">
                  {{ stat.value }}
                </h3>
              </div>
              <v-avatar :color="stat.color" size="56" rounded="lg">
                <v-icon size="30" :color="stat.iconColor">{{
                  stat.icon
                }}</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Revenue Chart -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card class="admin-card" elevation="0">
          <v-card-title class="text-h6 font-weight-bold admin-card-title">
            Revenue Chart
          </v-card-title>
          <v-card-text>
            <div v-if="!loading" class="chart-container">
              <canvas ref="revenueChart"></canvas>
            </div>
            <div v-else class="text-center py-12">
              <v-progress-circular
                indeterminate
                color="waterblue"
              ></v-progress-circular>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Orders -->
    <v-row>
      <v-col cols="12">
        <v-card class="admin-card" elevation="0">
          <v-card-title class="d-flex justify-space-between align-center admin-card-title">
            <span class="text-h6 font-weight-bold">Recent Orders</span>
            <v-btn
              variant="text"
              color="waterblue"
              size="small"
              @click="$router.push('/admin?tab=order-management')"
            >
              View All
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in recentOrders" :key="order._id">
                  <td class="font-weight-medium">{{ order.orderId }}</td>
                  <td>{{ order.userId?.username || "N/A" }}</td>
                  <td>{{ order.items?.length || 0 }} items</td>
                  <td class="font-weight-bold">
                    {{ formatCurrency(order.total) }}
                  </td>
                  <td>
                    <v-chip
                      :color="getStatusColor(order.status)"
                      variant="flat"
                      size="small"
                    >
                      <v-icon start size="small">
                        {{ getStatusIcon(order.status) }}
                      </v-icon>
                      {{ order.status }}
                    </v-chip>
                  </td>
                  <td>{{ formatDate(order.createdAt) }}</td>
                </tr>
                <tr v-if="recentOrders.length === 0">
                  <td colspan="6" class="text-center py-8">
                    <v-icon size="48" color="grey-lighten-2"
                      >mdi-package-variant-closed</v-icon
                    >
                    <p class="text-caption text-grey mt-2">No recent orders</p>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import orderApi from "~/api/orderApi";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export default {
  name: "DashboardManagement",
  data() {
    return {
      loading: false,
      totalRevenue: 0,
      orderStats: [],
      recentOrders: [],
      chart: null,
    };
  },
  computed: {
    statsCards() {
      const paidOrders =
        this.orderStats.find((s) => s._id !== "Pending")?.count || 0;
      const totalOrders = this.orderStats.reduce((sum, s) => sum + s.count, 0);
      const failedOrders =
        this.orderStats.find((s) => s._id === "Failed")?.count || 0;

      return [
        {
          title: "Total Revenue",
          value: this.formatCurrency(this.totalRevenue),
          icon: "mdi-currency-usd",
          color: "lightgreen",
          iconColor: "white",
        },
        {
          title: "Total Orders",
          value: totalOrders,
          icon: "mdi-shopping",
          color: "customyellow",
          iconColor: "customblack",
        },
        {
          title: "Completed",
          value: paidOrders,
          icon: "mdi-check-circle",
          color: "waterblue",
          iconColor: "white",
        },
        {
          title: "Failed",
          value: failedOrders,
          icon: "mdi-close-circle",
          color: "error",
          iconColor: "white",
        },
      ];
    },
  },
  methods: {
    async fetchDashboardData() {
      this.loading = true;
      try {
        const data = await orderApi.getDashboardStats();
        this.totalRevenue = data.totalRevenue;
        this.orderStats = data.orderStats;
        this.recentOrders = data.recentOrders;

        // Render chart after data is loaded
        this.$nextTick(() => {
          this.renderChart();
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        this.loading = false;
      }
    },

    renderChart() {
      if (!this.$refs.revenueChart) return;

      const ctx = this.$refs.revenueChart.getContext("2d");

      // Destroy existing chart
      if (this.chart) {
        this.chart.destroy();
      }

      // Simple bar chart showing total revenue
      this.chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Total Revenue"],
          datasets: [
            {
              label: "Revenue (VND)",
              data: [this.totalRevenue],
              backgroundColor: "#00BFFF",
              borderColor: "#00BFFF",
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
                  return `Revenue: ${this.formatCurrency(context.parsed.y)}`;
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => {
                  return this.formatCurrency(value);
                },
              },
            },
          },
        },
      });
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },

    getStatusColor(status) {
      const colors = {
        Pending: "warning",
        Paid: "success",
        Confirmed: "info",
        "In Delivery": "purple",
        Delivered: "teal",
        Failed: "error",
        Cancelled: "grey",
      };
      return colors[status] || "grey";
    },
    getStatusIcon(status) {
      const icons = {
        Pending: "mdi-clock-outline",
        Paid: "mdi-check-circle",
        Confirmed: "mdi-shield-check",
        "In Delivery": "mdi-truck-delivery",
        Delivered: "mdi-package-variant-closed",
        Failed: "mdi-close-circle",
        Cancelled: "mdi-cancel",
      };
      return icons[status] || "mdi-help-circle";
    },
  },

  mounted() {
    this.fetchDashboardData();
  },

  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  },
};
</script>

<style scoped>
.admin-card {
  border-radius: var(--admin-radius-md, 16px);
  box-shadow: var(--admin-shadow-sm, 0 2px 10px -2px rgba(25, 27, 36, 0.08));
}

.admin-card-title {
  color: var(--admin-ink, #191b24);
}

.stat-card {
  transition: transform var(--admin-transition, 200ms ease),
    box-shadow var(--admin-transition, 200ms ease);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--admin-shadow-md, 0 12px 28px -8px rgba(25, 27, 36, 0.14));
}

.stat-value {
  font-variant-numeric: tabular-nums;
  color: var(--admin-ink, #191b24);
}

.chart-container {
  height: 300px;
  position: relative;
}
</style>
