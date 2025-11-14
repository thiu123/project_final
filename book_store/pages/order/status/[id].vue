<template>
  <v-container class="pa-4 pa-md-8">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <!-- Success Header with Animation -->
        <v-card class="mb-8 overflow-hidden" elevation="0" rounded="xl">
          <div
            :class="isSuccessStatus ? 'success-gradient' : 'warning-gradient'"
            class="pa-8 pa-md-12 text-center"
          >
            <v-icon
              :icon="getHeaderIcon()"
              size="100"
              color="white"
              class="mb-4 pulse-animation"
            ></v-icon>
            <h1 class="text-h3 text-md-h2 text-white font-weight-bold mb-3">
              {{ getHeaderTitle() }}
            </h1>
            <p class="text-h6 text-white text-opacity-90">
              {{ getHeaderSubtitle() }}
            </p>
          </div>
        </v-card>

        <!-- Order Details -->
        <v-card class="mb-6" elevation="2" rounded="lg" v-if="order">
          <v-card-title class="d-flex align-center pa-5 bg-grey-lighten-5">
            <v-icon
              icon="mdi-receipt-text"
              class="mr-3"
              color="primary"
              size="28"
            ></v-icon>
            <span class="text-h5 font-weight-bold">Order Details</span>
          </v-card-title>

          <v-divider></v-divider>

          <v-card-text class="pa-6">
            <v-row dense>
              <v-col cols="12" sm="6" md="4">
                <v-card
                  class="pa-4 bg-blue-lighten-5"
                  elevation="0"
                  rounded="lg"
                >
                  <div
                    class="text-caption text-blue-darken-2 mb-1 font-weight-medium"
                  >
                    Order ID
                  </div>
                  <div class="text-h6 font-weight-bold text-blue-darken-4">
                    {{ order.orderId }}
                  </div>
                </v-card>
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <v-card
                  class="pa-4 bg-purple-lighten-5"
                  elevation="0"
                  rounded="lg"
                >
                  <div
                    class="text-caption text-purple-darken-2 mb-1 font-weight-medium"
                  >
                    Order Date
                  </div>
                  <div
                    class="text-subtitle-1 font-weight-bold text-purple-darken-4"
                  >
                    {{ formatDate(order.createdAt) }}
                  </div>
                </v-card>
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <v-card
                  class="pa-4 bg-orange-lighten-5"
                  elevation="0"
                  rounded="lg"
                >
                  <div
                    class="text-caption text-orange-darken-2 mb-1 font-weight-medium"
                  >
                    Payment Method
                  </div>
                  <div
                    class="text-subtitle-1 font-weight-bold text-orange-darken-4"
                  >
                    {{ order.paymentMethod }}
                  </div>
                </v-card>
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <v-card
                  class="pa-4 bg-green-lighten-5"
                  elevation="0"
                  rounded="lg"
                >
                  <div
                    class="text-caption text-green-darken-2 mb-1 font-weight-medium"
                  >
                    Status
                  </div>
                  <v-chip
                    :color="getStatusColor(order.status)"
                    variant="flat"
                    size="small"
                    class="font-weight-bold mt-1"
                  >
                    {{ order.status }}
                  </v-chip>
                </v-card>
              </v-col>

              <v-col cols="12" sm="6" md="4" v-if="order?.confirmedByAdmin">
                <v-card
                  class="pa-4 bg-indigo-lighten-5"
                  elevation="0"
                  rounded="lg"
                >
                  <div
                    class="text-caption text-indigo-darken-2 mb-1 font-weight-medium"
                  >
                    Admin Confirmed
                  </div>
                  <div
                    class="text-subtitle-1 font-weight-bold text-indigo-darken-4"
                  >
                    {{ formatDate(order?.confirmedAt) }}
                  </div>
                </v-card>
              </v-col>

              <v-col cols="12" sm="6" md="8">
                <v-card
                  class="pa-4 bg-teal-lighten-5"
                  elevation="0"
                  rounded="lg"
                >
                  <div
                    class="text-caption text-teal-darken-2 mb-1 font-weight-medium"
                  >
                    Payment Completed
                  </div>
                  <div
                    class="text-subtitle-1 font-weight-bold text-teal-darken-4"
                  >
                    {{ formatDate(order.updatedAt) }}
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Items Purchased -->
        <v-card
          class="mb-6"
          elevation="2"
          rounded="lg"
          v-if="order && order.items"
        >
          <v-card-title class="d-flex align-center pa-5 bg-grey-lighten-5">
            <v-icon
              icon="mdi-book-multiple"
              class="mr-3"
              color="secondary"
              size="28"
            ></v-icon>
            <span class="text-h5 font-weight-bold">Items Purchased</span>
            <v-chip color="secondary" variant="flat" class="ml-3" size="small">
              {{ order.items.length }}
              {{ order.items.length === 1 ? "item" : "items" }}
            </v-chip>
          </v-card-title>

          <v-divider></v-divider>

          <v-list class="pa-0" lines="three">
            <template v-for="(item, index) in order?.items" :key="index">
              <v-list-item class="px-6 py-5">
                <template v-slot:prepend>
                  <v-card elevation="3" rounded="lg" class="mr-5">
                    <v-img
                      :src="item?.bookId?.cover_url"
                      :alt="item?.bookId?.title"
                      width="100"
                      height="140"
                      cover
                      class="rounded-lg"
                    >
                      <template v-slot:placeholder>
                        <v-row
                          class="fill-height ma-0"
                          align="center"
                          justify="center"
                        >
                          <v-icon
                            icon="mdi-book"
                            size="50"
                            color="grey-lighten-2"
                          ></v-icon>
                        </v-row>
                      </template>
                    </v-img>
                  </v-card>
                </template>

                <div>
                  <v-list-item-title class="text-h6 font-weight-bold mb-2">
                    {{ item.bookId.title }}
                  </v-list-item-title>

                  <v-list-item-subtitle>
                    <div class="text-body-2 mb-2 text-grey-darken-1">
                      <v-icon
                        icon="mdi-account-edit"
                        size="16"
                        class="mr-1"
                      ></v-icon>
                      {{ item.bookId.authors.join(", ") }}
                    </div>

                    <div class="text-body-2 mb-3 text-grey-darken-1">
                      <v-icon
                        icon="mdi-calendar"
                        size="16"
                        class="mr-1"
                      ></v-icon>
                      Published {{ item.bookId.first_publish_year }}
                    </div>

                    <div class="d-flex align-center mb-3">
                      <v-rating
                        :model-value="item.bookId.rating"
                        color="amber"
                        density="compact"
                        size="small"
                        readonly
                        half-increments
                      ></v-rating>
                      <span class="text-body-2 ml-2 font-weight-medium">
                        {{ item.bookId.rating }}
                      </span>
                    </div>

                    <div class="d-flex flex-wrap gap-2 mb-3">
                      <v-chip
                        v-for="subject in item.bookId.subjects.slice(0, 3)"
                        :key="subject"
                        size="small"
                        variant="tonal"
                        color="primary"
                      >
                        {{ subject }}
                      </v-chip>
                      <v-chip
                        v-if="item.bookId.subjects.length > 3"
                        size="small"
                        variant="text"
                        color="primary"
                      >
                        +{{ item.bookId.subjects.length - 3 }} more
                      </v-chip>
                    </div>

                    <v-expansion-panels variant="accordion" class="mt-3">
                      <v-expansion-panel
                        rounded="lg"
                        elevation="0"
                        class="bg-grey-lighten-4"
                      >
                        <v-expansion-panel-title
                          class="text-body-2 font-weight-medium"
                        >
                          <template> View Description </template>
                        </v-expansion-panel-title>
                        <v-expansion-panel-text
                          class="text-body-2 text-black f"
                        >
                          {{ item.bookId.description }}
                        </v-expansion-panel-text>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </v-list-item-subtitle>
                </div>

                <template v-slot:append>
                  <div class="text-right ml-4">
                    <v-chip
                      color="primary"
                      variant="tonal"
                      size="small"
                      class="mb-2"
                    >
                      Qty: {{ item.quantity }}
                    </v-chip>
                    <div class="text-h6 font-weight-bold text-primary">
                      ${{ getItemPrice(item).toFixed(2) }}
                    </div>
                    <div class="text-caption text-grey-darken-1">per item</div>
                  </div>
                </template>
              </v-list-item>

              <v-divider
                v-if="index < order.items.length - 1"
                class="mx-6"
              ></v-divider>
            </template>
          </v-list>
        </v-card>

        <!-- Order Summary -->
        <v-card class="mb-8" elevation="3" rounded="lg" v-if="order">
          <div class="summary-gradient pa-5">
            <div class="d-flex align-center">
              <v-icon
                icon="mdi-calculator"
                class="mr-3"
                color="white"
                size="28"
              ></v-icon>
              <span class="text-h5 font-weight-bold text-white"
                >Order Summary</span
              >
            </div>
          </div>

          <v-divider></v-divider>

          <v-card-text class="pa-6">
            <!-- Items List -->
            <div class="mb-5">
              <div
                class="text-overline text-grey-darken-2 mb-3 font-weight-bold"
              >
                Items Breakdown
              </div>
              <v-card
                v-for="(item, index) in order.items"
                :key="index"
                class="mb-2 pa-4 bg-grey-lighten-5"
                elevation="0"
                rounded="lg"
              >
                <div class="d-flex justify-space-between align-center">
                  <div>
                    <div
                      class="text-body-1 font-weight-medium text-grey-darken-3"
                    >
                      {{ item.bookId.title }}
                      <v-chip
                        v-if="item.productType === 'ebook'"
                        color="success"
                        size="x-small"
                        class="ml-2"
                      >
                        Ebook
                      </v-chip>
                    </div>
                    <div class="text-caption text-grey-darken-1">
                      ${{ getItemPrice(item).toFixed(2) }} × {{ item.quantity }}
                    </div>
                  </div>
                  <div class="text-h6 font-weight-bold text-primary">
                    ${{ (getItemPrice(item) * item.quantity).toFixed(2) }}
                  </div>
                </div>
              </v-card>
            </div>

            <v-divider class="my-5"></v-divider>

            <!-- Subtotal -->
            <div class="d-flex justify-space-between align-center mb-4 px-2">
              <span class="text-body-1 font-weight-medium text-grey-darken-2"
                >Subtotal</span
              >
              <span class="text-h6 font-weight-bold text-grey-darken-3">
                ${{ (calculateSubtotal(order) / 24000).toFixed(2) }}
              </span>
            </div>

            <!-- Voucher Discount -->
            <v-card
              v-if="order.voucher && order.voucher.code"
              class="mb-4 pa-4"
              elevation="0"
              rounded="lg"
              color="green-lighten-5"
            >
              <div class="d-flex justify-space-between align-center">
                <div class="d-flex align-center">
                  <v-avatar color="success" size="40" class="mr-3">
                    <v-icon icon="mdi-ticket-percent" color="white"></v-icon>
                  </v-avatar>
                  <div>
                    <div
                      class="text-body-1 font-weight-medium text-grey-darken-3"
                    >
                      Voucher Discount
                    </div>
                    <v-chip
                      size="small"
                      color="success"
                      variant="flat"
                      class="mt-1"
                    >
                      {{ order.voucher.code }}
                    </v-chip>
                  </div>
                </div>
                <div class="text-h6 font-weight-bold text-success">
                  -${{ (order.voucher.discountAmount / 24000).toFixed(2) }}
                </div>
              </div>
            </v-card>

            <v-divider class="my-5"></v-divider>

            <!-- Total -->
            <v-card
              class="pa-5"
              elevation="0"
              rounded="lg"
              color="success-lighten-5"
            >
              <div class="d-flex justify-space-between align-center">
                <div>
                  <div class="text-overline text-success-darken-2 mb-1">
                    Total Paid
                  </div>
                  <div class="text-h4 font-weight-bold text-success">
                    ${{ (order.total / 24000).toFixed(2) }}
                  </div>
                </div>
                <v-icon
                  icon="mdi-check-circle"
                  size="60"
                  color="success"
                ></v-icon>
              </div>

              <!-- VND Equivalent -->
              <div
                class="text-center mt-4 pt-4"
                style="border-top: 2px dashed rgba(76, 175, 80, 0.3)"
              >
                <span
                  class="text-body-2 text-success-darken-1 font-weight-medium"
                >
                  ≈ {{ order.total.toLocaleString() }} VNĐ
                </span>
              </div>
            </v-card>
          </v-card-text>
        </v-card>

        <!-- Action Buttons -->
        <v-row class="mb-6" dense>
          <v-col cols="12" sm="6" md="4" v-if="canCancelOrder">
            <v-btn
              color="error"
              variant="flat"
              size="x-large"
              block
              rounded="lg"
              prepend-icon="mdi-cancel"
              @click="handleCancelOrder"
              :loading="cancelling"
              class="text-none font-weight-bold"
              elevation="2"
            >
              Cancel Order
            </v-btn>
          </v-col>
          <v-col
            cols="12"
            :sm="canCancelOrder ? 6 : 6"
            :md="canCancelOrder ? 4 : 6"
          >
            <v-btn
              color="primary"
              variant="flat"
              size="x-large"
              block
              rounded="lg"
              prepend-icon="mdi-home"
              @click="goToHome"
              class="text-none font-weight-bold"
              elevation="2"
            >
              Continue Shopping
            </v-btn>
          </v-col>
          <v-col
            cols="12"
            :sm="canCancelOrder ? 12 : 6"
            :md="canCancelOrder ? 4 : 6"
          >
            <v-btn
              color="secondary"
              variant="flat"
              size="x-large"
              block
              rounded="lg"
              prepend-icon="mdi-package-variant"
              @click="goToOrders"
              class="text-none font-weight-bold"
              elevation="2"
            >
              View My Orders
            </v-btn>
          </v-col>
        </v-row>

        <!-- Additional Info -->
        <v-card elevation="0" rounded="lg" class="bg-blue-lighten-5 mb-4">
          <v-card-text class="pa-5">
            <div class="d-flex align-start">
              <v-avatar color="info" size="48" class="mr-4 flex-shrink-0">
                <v-icon icon="mdi-information" size="28" color="white"></v-icon>
              </v-avatar>
              <div>
                <div class="text-h6 font-weight-bold text-blue-darken-3 mb-3">
                  What's Next?
                </div>
                <div class="text-body-2 text-blue-darken-2">
                  <div class="mb-2 d-flex align-start">
                    <v-icon
                      icon="mdi-email-check"
                      size="18"
                      class="mr-2 mt-1"
                      color="info"
                    ></v-icon>
                    <span>You will receive an email confirmation shortly</span>
                  </div>
                  <div class="mb-2 d-flex align-start">
                    <v-icon
                      icon="mdi-shield-check"
                      size="18"
                      class="mr-2 mt-1"
                      color="info"
                    ></v-icon>
                    <span>Admin will review and confirm your order</span>
                  </div>
                  <div class="mb-2 d-flex align-start">
                    <v-icon
                      icon="mdi-clock-fast"
                      size="18"
                      class="mr-2 mt-1"
                      color="info"
                    ></v-icon>
                    <span
                      >Your order will be processed after admin
                      confirmation</span
                    >
                  </div>
                  <div class="d-flex align-start">
                    <v-icon
                      icon="mdi-map-marker-path"
                      size="18"
                      class="mr-2 mt-1"
                      color="info"
                    ></v-icon>
                    <span>Track your order status in "My Orders" section</span>
                  </div>
                  <div
                    class="mt-3 d-flex align-start"
                    v-if="!order?.confirmedByAdmin && order?.status === 'Paid'"
                  >
                    <v-icon
                      icon="mdi-alert-circle"
                      size="18"
                      class="mr-2 mt-1"
                      color="warning"
                    ></v-icon>
                    <span class="text-warning"
                      >You can cancel this order before admin confirmation</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Cancel Confirmation Dialog -->
        <v-dialog v-model="cancelDialog" max-width="500">
          <v-card>
            <v-card-title class="text-h5 bg-error text-white">
              <v-icon class="mr-2">mdi-alert</v-icon>
              Cancel Order?
            </v-card-title>
            <v-card-text class="pa-6">
              <p class="text-body-1 mb-3">
                Are you sure you want to cancel this order?
              </p>
              <v-alert type="warning" variant="tonal" class="mb-0">
                This action cannot be undone. Your payment will be refunded
                within 5-7 business days.
              </v-alert>
            </v-card-text>
            <v-card-actions class="pa-4">
              <v-spacer></v-spacer>
              <v-btn
                variant="text"
                @click="cancelDialog = false"
                :disabled="cancelling"
              >
                Keep Order
              </v-btn>
              <v-btn
                color="error"
                variant="flat"
                @click="confirmCancelOrder"
                :loading="cancelling"
              >
                Yes, Cancel Order
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Snackbar -->
        <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000">
          {{ snackbarText }}
          <template v-slot:actions>
            <v-btn variant="text" @click="snackbar = false">Close</v-btn>
          </template>
        </v-snackbar>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapState } from "vuex";
import orderApi from "~/api/orderApi";

export default {
  name: "CheckoutSuccess",
  data() {
    return {
      cancelDialog: false,
      cancelling: false,
      snackbar: false,
      snackbarText: "",
      snackbarColor: "success",
    };
  },
  computed: {
    ...mapState("order", ["order"]),
    canCancelOrder() {
      if (!this.order) return false;
      // Can only cancel if order is Pending or Paid (before Confirmed)
      return ["Pending", "Paid"].includes(this.order.status);
    },
    isSuccessStatus() {
      return ["Paid", "Confirmed", "In Delivery", "Delivered"].includes(
        this.order?.status
      );
    },
  },
  methods: {
    ...mapActions("order", ["fetchOrderById"]),

    async getOrder() {
      const orderId = this.$route.params.id;
      try {
        await this.fetchOrderById(orderId);
      } catch (error) {
        console.error("Error fetching order:", error);
      }
    },

    getHeaderTitle() {
      if (!this.order) return "Order Details";
      switch (this.order.status) {
        case "Paid":
          return "Payment Successful!";
        case "Confirmed":
          return "Order Confirmed!";
        case "In Delivery":
          return "Out for Delivery!";
        case "Delivered":
          return "Order Delivered!";
        case "Cancelled":
          return "Order Cancelled";
        case "Failed":
          return "Payment Failed";
        default:
          return "Order Pending";
      }
    },

    getHeaderSubtitle() {
      if (!this.order) return "";
      switch (this.order.status) {
        case "Paid":
          return "Waiting for admin confirmation";
        case "Confirmed":
          return "Your order is being prepared";
        case "In Delivery":
          return "Your order is on the way";
        case "Delivered":
          return "Your order has been delivered";
        case "Cancelled":
          return "This order has been cancelled";
        case "Failed":
          return "Payment was not successful";
        default:
          return "Processing your order";
      }
    },

    getHeaderIcon() {
      if (!this.order) return "mdi-information";
      switch (this.order.status) {
        case "Paid":
        case "Confirmed":
        case "In Delivery":
        case "Delivered":
          return "mdi-check-circle";
        case "Cancelled":
          return "mdi-cancel";
        case "Failed":
          return "mdi-close-circle";
        default:
          return "mdi-clock-outline";
      }
    },

    formatDate(dateString) {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    getStatusColor(status) {
      switch (status?.toLowerCase()) {
        case "paid":
          return "success";
        case "confirmed":
          return "info";
        case "in delivery":
          return "purple";
        case "delivered":
          return "teal";
        case "pending":
          return "warning";
        case "failed":
        case "cancelled":
          return "error";
        default:
          return "primary";
      }
    },

    getItemPrice(item) {
      if (item.productType === "ebook") {
        return item.bookId.price * 0.7;
      }
      return item.bookId.price;
    },

    calculateSubtotal(order) {
      // Calculate subtotal by adding back discount to total
      if (order.voucher && order.voucher.discountAmount) {
        return order.total + order.voucher.discountAmount;
      }
      return order.total;
    },

    handleCancelOrder() {
      this.cancelDialog = true;
    },

    async confirmCancelOrder() {
      this.cancelling = true;
      try {
        await orderApi.cancelOrder(this.order._id);
        this.showSnackbar("Order cancelled successfully", "success");
        this.cancelDialog = false;
        // Refresh order data
        await this.getOrder();
      } catch (error) {
        console.error("Error cancelling order:", error);
        this.showSnackbar(
          error.response?.data?.msg || "Failed to cancel order",
          "error"
        );
      } finally {
        this.cancelling = false;
      }
    },

    showSnackbar(text, color = "success") {
      this.snackbarText = text;
      this.snackbarColor = color;
      this.snackbar = true;
    },

    goToHome() {
      this.$router.push("/");
    },

    goToOrders() {
      this.$router.push("/profiles?tab=orders");
    },
  },

  async mounted() {
    await this.getOrder();
  },
};
</script>

<style scoped>
.success-gradient {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
}

.warning-gradient {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
}

.summary-gradient {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.pulse-animation {
  animation: pulse 2s ease-in-out infinite;
}

.v-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-btn {
  transition: all 0.2s ease;
}

.v-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
}

.v-list-item {
  transition: background-color 0.2s ease;
}

.v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}
</style>
