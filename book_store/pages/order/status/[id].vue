<template>
  <v-container class="pa-4 pa-md-8">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <!-- Success Header with Animation -->
        <v-card class="mb-8 overflow-hidden" elevation="0" rounded="xl">
          <div class="success-gradient pa-8 pa-md-12 text-center">
            <v-icon
              icon="mdi-check-circle"
              size="100"
              color="white"
              class="mb-4 pulse-animation"
            ></v-icon>
            <h1 class="text-h3 text-md-h2 text-white font-weight-bold mb-3">
              Payment Successful!
            </h1>
            <p class="text-h6 text-white text-opacity-90">
              Thank you for your purchase
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
                      ${{ item.bookId.price.toFixed(2) }}
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
                    </div>
                    <div class="text-caption text-grey-darken-1">
                      ${{ item.bookId.price.toFixed(2) }} × {{ item.quantity }}
                    </div>
                  </div>
                  <div class="text-h6 font-weight-bold text-primary">
                    ${{ (item.bookId.price * item.quantity).toFixed(2) }}
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
                {{ calculateSubtotal(order).toLocaleString() }} VNĐ
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
                  -{{ order.voucher.discountAmount.toLocaleString() }} VNĐ
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
                    {{ order.total.toLocaleString() }} VNĐ
                  </div>
                </div>
                <v-icon
                  icon="mdi-check-circle"
                  size="60"
                  color="success"
                ></v-icon>
              </div>

              <!-- USD Equivalent -->
              <div
                class="text-center mt-4 pt-4"
                style="border-top: 2px dashed rgba(76, 175, 80, 0.3)"
              >
                <span
                  class="text-body-2 text-success-darken-1 font-weight-medium"
                >
                  ≈ ${{ (order.total / 24000).toFixed(2) }} USD
                </span>
              </div>
            </v-card>
          </v-card-text>
        </v-card>

        <!-- Action Buttons -->
        <v-row class="mb-6" dense>
          <v-col cols="12" sm="6">
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
          <v-col cols="12" sm="6">
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
                      icon="mdi-clock-fast"
                      size="18"
                      class="mr-2 mt-1"
                      color="info"
                    ></v-icon>
                    <span
                      >Your order will be processed within 1-2 business
                      days</span
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
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapState } from "vuex";

export default {
  name: "CheckoutSuccess",
  data() {
    return {
      status: "",
      orderId: "",
    };
  },
  computed: {
    ...mapState("order", ["order"]),
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

    formatDate(dateString) {
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
      switch (status.toLowerCase()) {
        case "paid":
          return "success";
        case "pending":
          return "warning";
        case "failed":
          return "error";
        default:
          return "primary";
      }
    },

    calculateSubtotal(order) {
      // Calculate subtotal by adding back discount to total
      if (order.voucher && order.voucher.discountAmount) {
        return order.total + order.voucher.discountAmount;
      }
      return order.total;
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
    console.log("Order fetched:", this.order);
  },
};
</script>

<style scoped>
.success-gradient {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
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
