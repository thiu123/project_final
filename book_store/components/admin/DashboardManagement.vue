<template>
  <div>
    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" md="3" v-for="stat in statsCards" :key="stat.title">
        <v-card class="stat-card" elevation="2">
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <p class="text-caption text-grey mb-1">{{ stat.title }}</p>
                <h3 class="text-h4 font-weight-bold">{{ stat.value }}</h3>
              </div>
              <v-avatar :color="stat.color" size="56">
                <v-icon size="30" color="white">{{ stat.icon }}</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Revenue Chart -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="text-h6 font-weight-bold">
            Revenue Chart
          </v-card-title>
          <v-card-text>
            <div v-if="!loading" class="chart-container">
              <canvas ref="revenueChart"></canvas>
            </div>
            <div v-else class="text-center py-12">
              <v-progress-circular
                indeterminate
                color="primary"
              ></v-progress-circular>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Orders -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6 font-weight-bold">Recent Orders</span>
            <v-btn
              variant="text"
              color="primary"
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
                    <v-chip :color="getStatusColor(order.status)" size="small">
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
        this.orderStats.find((s) => s._id === "Paid")?.count || 0;
      const totalOrders = this.orderStats.reduce((sum, s) => sum + s.count, 0);
      const failedOrders =
        this.orderStats.find((s) => s._id === "Failed")?.count || 0;

      return [
        {
          title: "Total Revenue",
          value: this.formatCurrency(this.totalRevenue),
          icon: "mdi-currency-usd",
          color: "success",
        },
        {
          title: "Total Orders",
          value: totalOrders,
          icon: "mdi-shopping",
          color: "primary",
        },
        {
          title: "Completed",
          value: paidOrders,
          icon: "mdi-check-circle",
          color: "info",
        },
        {
          title: "Failed",
          value: failedOrders,
          icon: "mdi-close-circle",
          color: "error",
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
              backgroundColor: "rgba(76, 175, 80, 0.8)",
              borderColor: "rgba(76, 175, 80, 1)",
              borderWidth: 2,
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
        Paid: "success",
        Pending: "warning",
        Failed: "error",
        Cancelled: "grey",
      };
      return colors[status] || "grey";
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
.stat-card {
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.chart-container {
  height: 300px;
  position: relative;
}
</style>
