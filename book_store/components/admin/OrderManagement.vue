<template>
  <div>
    <v-container fluid>
      <!-- Header Section -->
      <v-row class="mb-4">
        <v-col cols="12">
          <div class="d-flex justify-space-between align-center">
            <div>
              <h1 class="text-h4 font-weight-bold mb-2">Order Management</h1>
              <p class="text-subtitle-1 text-grey">
                Manage all orders in the system
              </p>
            </div>
            <v-btn
              color="primary"
              @click="fetchOrders"
              :loading="loading"
              prepend-icon="mdi-refresh"
            >
              Refresh
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- Statistics Cards -->
      <v-row class="mb-6">
        <v-col cols="12" md="3">
          <v-card>
            <v-card-text>
              <div class="d-flex align-center">
                <v-avatar color="primary" class="mr-3">
                  <v-icon>mdi-package-variant</v-icon>
                </v-avatar>
                <div>
                  <p class="text-caption text-grey mb-0">Total Orders</p>
                  <p class="text-h5 font-weight-bold mb-0">{{ totalOrders }}</p>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card>
            <v-card-text>
              <div class="d-flex align-center">
                <v-avatar color="success" class="mr-3">
                  <v-icon>mdi-check-circle</v-icon>
                </v-avatar>
                <div>
                  <p class="text-caption text-grey mb-0">Paid Orders</p>
                  <p class="text-h5 font-weight-bold mb-0">{{ paidOrders }}</p>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card>
            <v-card-text>
              <div class="d-flex align-center">
                <v-avatar color="warning" class="mr-3">
                  <v-icon>mdi-clock-outline</v-icon>
                </v-avatar>
                <div>
                  <p class="text-caption text-grey mb-0">Pending Orders</p>
                  <p class="text-h5 font-weight-bold mb-0">
                    {{ pendingOrders }}
                  </p>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card>
            <v-card-text>
              <div class="d-flex align-center">
                <v-avatar color="info" class="mr-3">
                  <v-icon>mdi-cash</v-icon>
                </v-avatar>
                <div>
                  <p class="text-caption text-grey mb-0">Total Revenue</p>
                  <p class="text-h5 font-weight-bold mb-0">
                    ${{ totalRevenue }}
                  </p>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Search and Filter Section -->
      <v-row class="mb-4">
        <v-col cols="12" md="6">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Search orders (Order ID, User email)..."
            single-line
            hide-details
            variant="outlined"
            density="comfortable"
            clearable
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="statusFilter"
            :items="statusOptions"
            label="Filter by Status"
            variant="outlined"
            density="comfortable"
            hide-details
            clearable
          ></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="paymentFilter"
            :items="paymentOptions"
            label="Filter by Payment"
            variant="outlined"
            density="comfortable"
            hide-details
            clearable
          ></v-select>
        </v-col>
      </v-row>

      <!-- Orders Table -->
      <v-card>
        <v-card-text class="pa-0">
          <v-data-table
            :headers="headers"
            :items="filteredOrders"
            :loading="loading"
            :items-per-page="10"
            class="elevation-0"
          >
            <!-- Order ID -->
            <template v-slot:item.orderId="{ item }">
              <div class="d-flex align-center">
                <v-icon class="mr-2" size="small">mdi-package-variant</v-icon>
                <span class="font-weight-medium">{{ item.orderId }}</span>
              </div>
            </template>

            <!-- User -->
            <template v-slot:item.userId="{ item }">
              <div>
                <div class="font-weight-medium">
                  {{ item.userId?.username || "N/A" }}
                </div>
                <div class="text-caption text-grey">
                  {{ item.userId?.email || "N/A" }}
                </div>
              </div>
            </template>

            <!-- Items -->
            <template v-slot:item.items="{ item }">
              <v-chip size="small" color="primary" variant="tonal">
                {{ item.items.length }} item(s)
              </v-chip>
            </template>

            <!-- Total -->
            <template v-slot:item.total="{ item }">
              <div class="font-weight-bold">
                {{ formatCurrency(item.total) }}
              </div>
            </template>

            <!-- Payment Method -->
            <template v-slot:item.paymentMethod="{ item }">
              <v-chip
                size="small"
                :color="getPaymentColor(item.paymentMethod)"
                variant="outlined"
              >
                <v-icon start size="small">
                  {{ getPaymentIcon(item.paymentMethod) }}
                </v-icon>
                {{ item.paymentMethod }}
              </v-chip>
            </template>

            <!-- Status -->
            <template v-slot:item.status="{ item }">
              <v-chip
                size="small"
                :color="getStatusColor(item.status)"
                variant="flat"
              >
                <v-icon start size="small">
                  {{ getStatusIcon(item.status) }}
                </v-icon>
                {{ item.status }}
              </v-chip>
            </template>

            <!-- Date -->
            <template v-slot:item.createdAt="{ item }">
              <div class="text-caption">
                {{ formatDate(item.createdAt) }}
              </div>
            </template>

            <!-- Actions -->
            <template v-slot:item.actions="{ item }">
              <div class="d-flex gap-1">
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  color="primary"
                  @click="viewOrderDetails(item)"
                >
                  <v-icon>mdi-eye</v-icon>
                  <v-tooltip activator="parent" location="top"
                    >View Details</v-tooltip
                  >
                </v-btn>
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  color="warning"
                  @click="editOrderStatus(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                  <v-tooltip activator="parent" location="top"
                    >Edit Status</v-tooltip
                  >
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-container>

    <!-- Order Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="900px" scrollable>
      <v-card v-if="selectedOrder">
        <v-card-title class="bg-primary text-white">
          <v-icon class="mr-2">mdi-package-variant</v-icon>
          Order Details - {{ selectedOrder.orderId }}
        </v-card-title>

        <v-card-text class="pa-4">
          <v-row>
            <!-- Order Information -->
            <v-col cols="12" md="6">
              <v-card variant="outlined">
                <v-card-title class="text-subtitle-1 font-weight-bold">
                  <v-icon class="mr-2">mdi-information</v-icon>
                  Order Information
                </v-card-title>
                <v-card-text>
                  <v-list density="compact">
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon>mdi-identifier</v-icon>
                      </template>
                      <v-list-item-title>Order ID</v-list-item-title>
                      <v-list-item-subtitle>{{
                        selectedOrder.orderId
                      }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon>mdi-cash</v-icon>
                      </template>
                      <v-list-item-title>Payment Method</v-list-item-title>
                      <v-list-item-subtitle>{{
                        selectedOrder.paymentMethod
                      }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon>mdi-tag</v-icon>
                      </template>
                      <v-list-item-title>Status</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-chip
                          size="small"
                          :color="getStatusColor(selectedOrder.status)"
                        >
                          {{ selectedOrder.status }}
                        </v-chip>
                      </v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon>mdi-calendar</v-icon>
                      </template>
                      <v-list-item-title>Order Date</v-list-item-title>
                      <v-list-item-subtitle>{{
                        formatDate(selectedOrder.createdAt)
                      }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Customer Information -->
            <v-col cols="12" md="6">
              <v-card variant="outlined">
                <v-card-title class="text-subtitle-1 font-weight-bold">
                  <v-icon class="mr-2">mdi-account</v-icon>
                  Customer Information
                </v-card-title>
                <v-card-text>
                  <v-list density="compact">
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon>mdi-account</v-icon>
                      </template>
                      <v-list-item-title>Username</v-list-item-title>
                      <v-list-item-subtitle>{{
                        selectedOrder.userId?.username || "N/A"
                      }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon>mdi-email</v-icon>
                      </template>
                      <v-list-item-title>Email</v-list-item-title>
                      <v-list-item-subtitle>{{
                        selectedOrder.userId?.email || "N/A"
                      }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Voucher Information (if exists) -->
            <v-col cols="12" v-if="selectedOrder.voucher">
              <v-card variant="outlined" color="success">
                <v-card-title class="text-subtitle-1 font-weight-bold">
                  <v-icon class="mr-2">mdi-ticket-percent</v-icon>
                  Voucher Applied
                </v-card-title>
                <v-card-text>
                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <v-chip color="success" variant="flat" class="mb-2">
                        {{ selectedOrder.voucher.code }}
                      </v-chip>
                    </div>
                    <div class="text-h6 text-success">
                      -{{
                        formatCurrency(selectedOrder.voucher.discountAmount)
                      }}
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Order Items -->
            <v-col cols="12">
              <v-card variant="outlined">
                <v-card-title class="text-subtitle-1 font-weight-bold">
                  <v-icon class="mr-2">mdi-cart</v-icon>
                  Order Items
                </v-card-title>
                <v-card-text class="pa-0">
                  <v-table>
                    <thead>
                      <tr>
                        <th>Book</th>
                        <th>Type</th>
                        <th class="text-center">Quantity</th>
                        <th class="text-end">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(item, index) in selectedOrder.items"
                        :key="index"
                      >
                        <td>
                          <div class="d-flex align-center py-2">
                            <v-img
                              :src="item.bookId?.cover_url"
                              width="40"
                              height="60"
                              class="rounded mr-3"
                            ></v-img>
                            <div>
                              <div class="font-weight-medium">
                                {{ item.bookId?.title || "N/A" }}
                              </div>
                              <div class="text-caption text-grey">
                                {{ item.bookId?.authors?.[0] || "Unknown" }}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <v-chip
                            size="small"
                            :color="
                              item.productType === 'ebook'
                                ? 'success'
                                : 'primary'
                            "
                            variant="tonal"
                          >
                            {{
                              item.productType === "ebook"
                                ? "📱 Ebook"
                                : "📚 Hardbook"
                            }}
                          </v-chip>
                        </td>
                        <td class="text-center">{{ item.quantity }}</td>
                        <td class="text-end font-weight-medium">
                          ${{
                            (
                              item.bookId?.price *
                              item.quantity *
                              (item.productType === "ebook" ? 0.8 : 1)
                            ).toFixed(2)
                          }}
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Order Summary -->
            <v-col cols="12">
              <v-card variant="outlined" color="primary">
                <v-card-text>
                  <div class="d-flex justify-space-between align-center mb-2">
                    <span class="text-subtitle-1">Subtotal:</span>
                    <span class="text-subtitle-1 font-weight-medium">
                      {{ formatCurrency(calculateSubtotal(selectedOrder)) }}
                    </span>
                  </div>
                  <div
                    v-if="selectedOrder.voucher"
                    class="d-flex justify-space-between align-center mb-2"
                  >
                    <span class="text-subtitle-1 text-success">Discount:</span>
                    <span
                      class="text-subtitle-1 font-weight-medium text-success"
                    >
                      -{{
                        formatCurrency(selectedOrder.voucher.discountAmount)
                      }}
                    </span>
                  </div>
                  <v-divider class="my-2"></v-divider>
                  <div class="d-flex justify-space-between align-center">
                    <span class="text-h6 font-weight-bold">Total:</span>
                    <span class="text-h6 font-weight-bold text-primary">
                      {{ formatCurrency(selectedOrder.total) }}
                    </span>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="detailsDialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Status Dialog -->
    <v-dialog v-model="editDialog" max-width="500px" persistent>
      <v-card v-if="selectedOrder">
        <v-card-title class="bg-warning text-white">
          <v-icon class="mr-2">mdi-pencil</v-icon>
          Update Order Status
        </v-card-title>

        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="12">
              <v-alert
                type="info"
                variant="tonal"
                density="compact"
                class="mb-4"
              >
                Order ID: <strong>{{ selectedOrder.orderId }}</strong>
              </v-alert>
            </v-col>
            <v-col cols="12">
              <v-select
                v-model="newStatus"
                :items="statusOptions"
                label="New Status"
                variant="outlined"
                density="comfortable"
                prepend-icon="mdi-tag"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-icon :color="getStatusColor(item.value)">
                        {{ getStatusIcon(item.value) }}
                      </v-icon>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="editDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="warning"
            variant="elevated"
            @click="updateStatus"
            :loading="updateLoading"
          >
            Update Status
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      :timeout="3000"
      location="top"
    >
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import orderApi from "~/api/orderApi";

export default {
  name: "OrderManagement",
  data() {
    return {
      orders: [],
      loading: false,
      updateLoading: false,
      search: "",
      statusFilter: null,
      paymentFilter: null,
      detailsDialog: false,
      editDialog: false,
      selectedOrder: null,
      newStatus: null,
      snackbar: false,
      snackbarText: "",
      snackbarColor: "success",
      headers: [
        { title: "Order ID", key: "orderId", sortable: true },
        { title: "Customer", key: "userId", sortable: false },
        { title: "Items", key: "items", sortable: false },
        { title: "Total", key: "total", sortable: true },
        { title: "Payment", key: "paymentMethod", sortable: true },
        { title: "Status", key: "status", sortable: true },
        { title: "Date", key: "createdAt", sortable: true },
        { title: "Actions", key: "actions", sortable: false, align: "center" },
      ],
      statusOptions: ["Pending", "Paid", "Failed", "Cancelled"],
      paymentOptions: ["Vnpay", "Momo"],
    };
  },
  computed: {
    filteredOrders() {
      let filtered = this.orders;

      // Search filter
      if (this.search) {
        const searchLower = this.search.toLowerCase();
        filtered = filtered.filter(
          (order) =>
            order.orderId.toLowerCase().includes(searchLower) ||
            order.userId?.email?.toLowerCase().includes(searchLower) ||
            order.userId?.username?.toLowerCase().includes(searchLower)
        );
      }

      // Status filter
      if (this.statusFilter) {
        filtered = filtered.filter(
          (order) => order.status === this.statusFilter
        );
      }

      // Payment filter
      if (this.paymentFilter) {
        filtered = filtered.filter(
          (order) => order.paymentMethod === this.paymentFilter
        );
      }

      return filtered;
    },
    totalOrders() {
      return this.orders.length;
    },
    paidOrders() {
      return this.orders.filter((order) => order.status === "Paid").length;
    },
    pendingOrders() {
      return this.orders.filter((order) => order.status === "Pending").length;
    },
    totalRevenue() {
      const revenue = this.orders
        .filter((order) => order.status === "Paid")
        .reduce((sum, order) => sum + order.total, 0);
      return (revenue / 24000).toFixed(2); // Convert VND to USD
    },
  },
  methods: {
    async fetchOrders() {
      try {
        this.loading = true;
        this.orders = await orderApi.getAllOrders();
      } catch (error) {
        console.error("Error fetching orders:", error);
        this.showSnackbar("Failed to fetch orders", "error");
      } finally {
        this.loading = false;
      }
    },
    viewOrderDetails(order) {
      this.selectedOrder = order;
      this.detailsDialog = true;
    },
    editOrderStatus(order) {
      this.selectedOrder = order;
      this.newStatus = order.status;
      this.editDialog = true;
    },
    async updateStatus() {
      if (!this.newStatus || this.newStatus === this.selectedOrder.status) {
        this.showSnackbar("Please select a different status", "warning");
        return;
      }

      try {
        this.updateLoading = true;
        await orderApi.updateOrderStatus(
          this.selectedOrder._id,
          this.newStatus
        );

        // Update local order
        const index = this.orders.findIndex(
          (o) => o._id === this.selectedOrder._id
        );
        if (index !== -1) {
          this.orders[index].status = this.newStatus;
        }

        this.editDialog = false;
        this.showSnackbar("Order status updated successfully", "success");
      } catch (error) {
        console.error("Error updating order status:", error);
        this.showSnackbar("Failed to update order status", "error");
      } finally {
        this.updateLoading = false;
      }
    },
    getStatusColor(status) {
      const colors = {
        Pending: "warning",
        Paid: "success",
        Failed: "error",
        Cancelled: "grey",
      };
      return colors[status] || "grey";
    },
    getStatusIcon(status) {
      const icons = {
        Pending: "mdi-clock-outline",
        Paid: "mdi-check-circle",
        Failed: "mdi-close-circle",
        Cancelled: "mdi-cancel",
      };
      return icons[status] || "mdi-help-circle";
    },
    getPaymentColor(method) {
      return method === "Vnpay" ? "primary" : "success";
    },
    getPaymentIcon(method) {
      return method === "Vnpay" ? "mdi-credit-card" : "mdi-wallet";
    },
    formatDate(date) {
      return new Date(date).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);
    },
    calculateSubtotal(order) {
      return order.total + (order.voucher?.discountAmount || 0);
    },
    showSnackbar(text, color = "success") {
      this.snackbarText = text;
      this.snackbarColor = color;
      this.snackbar = true;
    },
  },
  mounted() {
    this.fetchOrders();
  },
};
</script>

<style scoped>
.v-table {
  font-size: 0.875rem;
}

.v-data-table :deep(.v-data-table__td) {
  padding: 8px 16px;
}
</style>
