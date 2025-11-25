<template>
  <v-app>
    <v-main class="bg-grey-lighten-4">
      <v-container class="pa-2 pa-md-6" style="max-width: 1200px">
        <!-- Page Header -->
        <div class="mb-6">
          <h1 class="text-h5 text-md-h4 font-weight-bold mb-2">Checkout</h1>
          <v-breadcrumbs
            class="pa-0"
            :items="[
              { title: 'Home', disabled: false },
              { title: 'Cart', disabled: false },
              { title: 'Checkout', disabled: true },
            ]"
          >
            <template v-slot:divider>
              <v-icon>mdi-chevron-right</v-icon>
            </template>
          </v-breadcrumbs>
        </div>

        <!-- Shipping Method -->
        <!-- <v-card class="mb-4 mb-md-6 rounded-lg" elevation="2">
          <v-card-title class="bg-primary text-white d-flex align-center py-4">
            <v-icon class="mr-3" size="24">mdi-truck-fast</v-icon>
            <span class="text-h6">Shipping Method</span>
          </v-card-title>
          <v-card-text class="pa-4 pa-md-6">
            <v-radio-group v-model="selectedShipping" hide-details>
              <v-card
                class="pa-4 mb-0 border"
                :class="
                  selectedShipping === 'standard'
                    ? 'border-primary bg-blue-lighten-5'
                    : 'border-grey-lighten-2'
                "
                flat
              >
                <v-radio value="standard" color="primary">
                  <template v-slot:label>
                    <div class="ml-3">
                      <div class="text-body-1 font-weight-bold mb-1">
                        Standard Shipping - {{ shippingFee }}
                      </div>
                      <div class="text-body-2 text-grey-darken-1">
                        <v-icon size="small" class="mr-1"
                          >mdi-clock-outline</v-icon
                        >
                        Estimated delivery: Friday 12/23
                      </div>
                    </div>
                  </template>
                </v-radio>
              </v-card>
            </v-radio-group>
          </v-card-text>
        </v-card> -->

        <!-- Payment Methods -->
        <v-card class="mb-4 mb-md-6 rounded-lg" elevation="2">
          <v-card-title class="bg-primary text-white d-flex align-center py-4">
            <v-icon class="mr-3" size="24">mdi-credit-card-outline</v-icon>
            <span class="text-h6">Payment Method</span>
          </v-card-title>
          <v-card-text class="pa-4 pa-md-6">
            <v-radio-group v-model="selectedPayment" hide-details>
              <v-card
                class="pa-4 mb-3 border"
                :class="
                  selectedPayment === 'vnpay'
                    ? 'border-primary bg-blue-lighten-5'
                    : 'border-grey-lighten-2'
                "
                flat
              >
                <v-radio value="vnpay" color="primary">
                  <template v-slot:label>
                    <div class="d-flex align-center ml-3">
                      <v-avatar size="60" class="mr-3 flex-shrink-0 rounded">
                        <v-img
                          src="../../assets/vnpay-logo-inkythuatso.svg"
                        ></v-img>
                      </v-avatar>
                      <span class="text-body-1 font-weight-medium"
                        >VNPay Wallet</span
                      >
                    </div>
                  </template>
                </v-radio>
              </v-card>

              <v-card
                class="pa-4 mb-0 border"
                :class="
                  selectedPayment === 'momo'
                    ? 'border-primary bg-blue-lighten-5'
                    : 'border-grey-lighten-2'
                "
                flat
              >
                <v-radio value="momo" color="primary">
                  <template v-slot:label>
                    <div class="d-flex align-center ml-3">
                      <v-avatar size="40" class="mr-3 flex-shrink-0 rounded">
                        <v-img
                          src="../../assets/Logo-MoMo-Square-300x300.png"
                        ></v-img>
                      </v-avatar>
                      <span class="text-body-1 font-weight-medium"
                        >Momo Wallet</span
                      >
                    </div>
                  </template>
                </v-radio>
              </v-card>
            </v-radio-group>
          </v-card-text>
        </v-card>

        <!-- Promotion Code -->
        <v-card class="mb-4 mb-md-6 rounded-lg" elevation="2">
          <v-card-title class="bg-primary text-white d-flex align-center py-4">
            <v-icon class="mr-3" size="24">mdi-ticket-percent</v-icon>
            <span class="text-h6">Promotion Code</span>
          </v-card-title>
          <v-card-text class="pa-4 pa-md-6">
            <div class="d-flex flex-column flex-sm-row ga-3 mb-3">
              <v-text-field
                v-model="voucherCode"
                placeholder="Enter promotion or gift code"
                variant="outlined"
                density="comfortable"
                hide-details
                class="flex-grow-1"
                prepend-inner-icon="mdi-tag-outline"
                @focus="showAvailableVouchers = true"
                :disabled="appliedVoucher !== null"
              ></v-text-field>
              <div class="d-flex ga-2">
                <v-btn
                  v-if="!appliedVoucher"
                  color="primary"
                  variant="flat"
                  size="large"
                  class="flex-shrink-0 px-6"
                  :loading="voucherLoading"
                  :disabled="!voucherCode.trim() || voucherLoading"
                  @click="applyVoucherCode"
                >
                  Apply
                </v-btn>
                <v-btn
                  v-else
                  color="error"
                  variant="flat"
                  size="large"
                  class="flex-shrink-0 px-6"
                  @click="removeVoucherCode"
                >
                  Remove
                </v-btn>
                <v-btn
                  variant="outlined"
                  color="primary"
                  size="large"
                  class="flex-shrink-0"
                  @click="showAvailableVouchers = !showAvailableVouchers"
                >
                  <v-icon class="mr-2">mdi-percent</v-icon>
                  <span class="d-none d-sm-inline">Browse Codes</span>
                  <span class="d-sm-none">Browse</span>
                </v-btn>
              </div>
            </div>

            <!-- Applied Voucher Display -->
            <v-alert
              v-if="appliedVoucher"
              type="success"
              variant="tonal"
              density="compact"
              class="mb-3"
              icon="mdi-check-circle"
            >
              <div class="text-body-2">
                <strong>{{ appliedVoucher.code }}</strong> applied!
                <div class="text-caption mt-1">
                  {{ appliedVoucher.description }}
                </div>
                <div class="text-caption text-success mt-1 font-weight-bold">
                  You saved ${{ voucherDiscount.toFixed(2) }}!
                </div>
              </div>
            </v-alert>

            <!-- Voucher Error -->
            <v-alert
              v-if="voucherError"
              type="error"
              variant="tonal"
              density="compact"
              class="mb-3"
              closable
              @click:close="voucherError = ''"
            >
              {{ voucherError }}
            </v-alert>

            <!-- Available Vouchers List -->
            <v-expand-transition>
              <div v-if="showAvailableVouchers" class="mt-4">
                <div
                  class="text-subtitle-2 font-weight-bold mb-3 d-flex align-center"
                >
                  <v-icon size="small" class="mr-2">mdi-ticket-percent</v-icon>
                  Available Vouchers
                </div>

                <v-progress-linear
                  v-if="loadingVouchers"
                  indeterminate
                  color="primary"
                  class="mb-3"
                ></v-progress-linear>

                <div
                  v-if="!loadingVouchers && availableVouchers.length === 0"
                  class="text-center text-grey-darken-1 py-4"
                >
                  <v-icon size="48" color="grey-lighten-1"
                    >mdi-ticket-outline</v-icon
                  >
                  <div class="mt-2">No vouchers available</div>
                </div>

                <div v-if="!loadingVouchers" class="voucher-list">
                  <v-card
                    v-for="voucher in availableVouchers"
                    :key="voucher._id"
                    class="mb-3 voucher-card"
                    :class="{
                      'voucher-applied':
                        appliedVoucher && appliedVoucher.code === voucher.code,
                    }"
                    variant="outlined"
                    @click="selectVoucher(voucher)"
                  >
                    <v-card-text class="pa-3">
                      <div class="d-flex justify-space-between align-center">
                        <div class="flex-grow-1">
                          <div class="d-flex align-center mb-2">
                            <v-chip
                              size="small"
                              color="primary"
                              variant="flat"
                              class="mr-2 font-weight-bold"
                            >
                              {{ voucher.code }}
                            </v-chip>
                            <v-chip
                              size="x-small"
                              :color="
                                voucher.discountType === 'percentage'
                                  ? 'success'
                                  : 'info'
                              "
                              variant="tonal"
                            >
                              {{
                                voucher.discountType === "percentage"
                                  ? `${voucher.discountValue}% OFF`
                                  : `$${voucher.discountValue} OFF`
                              }}
                            </v-chip>
                          </div>
                          <div class="text-body-2 text-grey-darken-1 mb-1">
                            {{ voucher.description }}
                          </div>
                          <div class="text-caption text-grey-darken-1">
                            <v-icon size="x-small" class="mr-1"
                              >mdi-cart-outline</v-icon
                            >
                            Min order: ${{ voucher.minOrderAmount }}
                            <span v-if="voucher.maxDiscount" class="ml-2">
                              <v-icon size="x-small" class="mr-1"
                                >mdi-shield-star</v-icon
                              >
                              Max discount: ${{ voucher.maxDiscount }}
                            </span>
                          </div>
                        </div>
                        <v-btn
                          icon
                          variant="text"
                          size="small"
                          color="primary"
                          class="ml-2"
                        >
                          <v-icon>mdi-arrow-right-circle</v-icon>
                        </v-btn>
                      </div>
                    </v-card-text>
                  </v-card>
                </div>
              </div>
            </v-expand-transition>

            <v-alert
              v-if="!showAvailableVouchers"
              density="compact"
              type="info"
              variant="tonal"
              icon="mdi-information-outline"
            >
              Click "Browse Codes" to see available vouchers
            </v-alert>
          </v-card-text>
        </v-card>

        <!-- Order Review -->
        <v-card class="mb-4 mb-md-6 rounded-lg" elevation="2">
          <v-card-title class="bg-primary text-white d-flex align-center py-4">
            <v-icon class="mr-3" size="24">mdi-cart-outline</v-icon>
            <span class="text-h6"
              >Order Summary ({{ orderItems.length }} items)</span
            >
          </v-card-title>
          <v-card-text v-if="orderItems.length" class="pa-4 pa-md-6">
            <div
              v-for="(item, index) in orderItems"
              :key="item.bookId || item._id"
              class="mb-4"
              :class="{
                'pb-4 border-b border-grey-lighten-2':
                  index < orderItems.length - 1,
              }"
            >
              <!-- Mobile Layout -->
              <div class="d-flex d-sm-none flex-column">
                <div class="d-flex gap-3 mb-3">
                  <v-card class="flex-shrink-0" elevation="0">
                    <v-img
                      :src="getItemCoverUrl(item)"
                      width="80"
                      height="110"
                      :alt="getItemTitle(item)"
                      cover
                    ></v-img>
                  </v-card>
                  <div class="flex-grow-1 min-width-0">
                    <div class="font-weight-bold mb-2 text-body-1">
                      {{ getItemTitle(item) }}
                    </div>
                    <div class="text-caption text-grey-darken-1 mb-2">
                      <v-icon size="x-small" class="mr-1"
                        >mdi-account-outline</v-icon
                      >
                      {{ getItemAuthors(item) }}
                    </div>
                    <v-chip
                      :color="
                        item.productType === 'ebook' ? 'success' : 'primary'
                      "
                      size="small"
                      label
                    >
                      {{
                        item.productType === "ebook"
                          ? "📱 Ebook"
                          : "📚 Hardbook"
                      }}
                    </v-chip>
                  </div>
                </div>
                <div
                  class="d-flex align-center justify-space-between bg-grey-lighten-4 pa-3 rounded"
                >
                  <div class="d-flex align-center gap-2">
                    <span class="text-body-2 text-grey-darken-1">Qty:</span>
                    <span class="px-3 text-body-1 font-weight-medium">{{
                      item.quantity
                    }}</span>
                  </div>
                  <span class="text-h6 font-weight-bold text-primary">
                    ${{
                      (
                        getItemPrice(item) *
                        (item.productType === "ebook" ? 0.7 : 1) *
                        item.quantity
                      ).toFixed(2)
                    }}
                  </span>
                </div>
              </div>

              <!-- Desktop/Tablet Layout -->
              <div class="d-none d-sm-flex align-start ga-4">
                <v-card class="flex-shrink-0" elevation="0">
                  <v-img
                    :src="getItemCoverUrl(item)"
                    width="120"
                    height="160"
                    :alt="getItemTitle(item)"
                    cover
                  ></v-img>
                </v-card>
                <div class="flex-grow-1">
                  <div class="font-weight-bold mb-2 text-h6">
                    {{ getItemTitle(item) }}
                  </div>
                  <div class="text-body-2 text-grey-darken-1 mb-3">
                    <v-icon size="small" class="mr-1"
                      >mdi-account-outline</v-icon
                    >
                    {{ getItemAuthors(item) }}
                  </div>
                  <div
                    class="d-flex align-center justify-space-between flex-wrap gap-3"
                  >
                    <div class="d-flex align-center ga-2">
                      <v-chip
                        :color="
                          item.productType === 'ebook' ? 'success' : 'primary'
                        "
                        size="large"
                        label
                      >
                        <span class="text-h6">
                          ${{
                            (
                              getItemPrice(item) *
                              (item.productType === "ebook" ? 0.7 : 1)
                            ).toFixed(2)
                          }}
                        </span>
                      </v-chip>
                      <v-chip
                        :color="
                          item.productType === 'ebook' ? 'success' : 'info'
                        "
                        size="small"
                        variant="tonal"
                      >
                        {{
                          item.productType === "ebook"
                            ? "📱 Ebook"
                            : "📚 Hardbook"
                        }}
                      </v-chip>
                    </div>
                    <div
                      class="d-flex align-center gap-2 bg-grey-lighten-4 pa-2 rounded"
                    >
                      <span class="text-body-2 text-grey-darken-1">Qty:</span>
                      <span class="px-3 text-h6 font-weight-medium">{{
                        item.quantity
                      }}</span>
                    </div>
                    <span class="text-h5 font-weight-bold text-primary"
                      >${{
                        (
                          getItemPrice(item) *
                          (item.productType === "ebook" ? 0.7 : 1) *
                          item.quantity
                        ).toFixed(2)
                      }}</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Order Summary -->
        <v-card class="mb-4 mb-md-6 rounded-lg" elevation="2">
          <v-card-text class="pa-4 pa-md-6">
            <div class="d-flex justify-space-between mb-3 text-body-1">
              <span class="text-grey-darken-2">Subtotal</span>
              <span class="font-weight-medium">{{ formattedSubtotal }}</span>
            </div>
            <div
              v-if="voucherDiscount > 0"
              class="d-flex justify-space-between mb-3 text-body-1"
            >
              <span class="text-grey-darken-2">Discount</span>
              <span class="font-weight-medium text-success"
                >-${{ voucherDiscount.toFixed(2) }}</span
              >
            </div>
            <v-divider class="my-4"></v-divider>
            <div
              class="d-flex justify-space-between align-center pa-4 bg-blue-lighten-5 rounded-lg"
            >
              <span class="text-h6 font-weight-bold">Total Amount</span>
              <span class="text-h4 font-weight-bold text-primary">{{
                formattedTotal
              }}</span>
            </div>
            <div class="text-caption text-grey-darken-1 mt-2 text-center">
              (including VAT)
            </div>
          </v-card-text>
        </v-card>

        <!-- Action Buttons -->
        <div class="d-flex flex-column flex-sm-row ga-3 mb-4">
          <v-btn
            variant="outlined"
            color="grey-darken-1"
            size="x-large"
            prepend-icon="mdi-arrow-left"
            class="flex-grow-1 order-2 order-sm-1"
          >
            <span class="d-none d-sm-inline">Back to Cart</span>
            <span class="d-sm-none">Back</span>
          </v-btn>
          <v-btn
            color="primary"
            size="x-large"
            class="flex-grow-1 order-1 order-sm-2"
            @click="handleConfirmPayment"
            :disabled="isProcessingPayment"
            :loading="isProcessingPayment"
            append-icon="mdi-lock-check"
          >
            <span class="d-none d-sm-inline font-weight-bold">
              {{ isProcessingPayment ? "PROCESSING..." : "CONFIRM PAYMENT" }}
            </span>
            <span class="d-sm-none font-weight-bold">
              {{ isProcessingPayment ? "PROCESSING..." : "CONFIRM" }}
            </span>
          </v-btn>
        </div>

        <!-- Security Notice -->
        <v-alert
          type="success"
          variant="tonal"
          density="compact"
          icon="mdi-shield-check"
          class="rounded-lg"
        >
          Your payment information is secured with 256-bit SSL encryption
        </v-alert>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { validateVoucher, getAllVouchers } from "@/api/voucherApi";

export default {
  data() {
    return {
      selectedShipping: "standard",
      selectedPayment: "vnpay",
      voucherCode: "",
      giftNote: false,
      invoice: false,
      shippingFee: 30000,
      exchangeRate: 24000, // USD to VND exchange rate
      isProcessingPayment: false,
      // Voucher states
      appliedVoucher: null,
      voucherDiscount: 0,
      voucherLoading: false,
      voucherError: "",
      showAvailableVouchers: false,
      availableVouchers: [],
      loadingVouchers: false,
    };
  },
  computed: {
    ...mapState("order", ["cartItems"]),

    // Use checkout items from localStorage if available, otherwise use all cart items
    orderItems() {
      // Check if running on client side
      if (import.meta.client) {
        const checkoutItems = localStorage.getItem("checkoutItems");
        if (checkoutItems) {
          try {
            return JSON.parse(checkoutItems);
          } catch (e) {
            console.error("Error parsing checkout items:", e);
            return this.cartItems || [];
          }
        }
      }
      return this.cartItems || [];
    },

    subtotal() {
      if (!this.orderItems || this.orderItems.length === 0) return 0;

      return this.orderItems.reduce((sum, item) => {
        const price =
          item.productType === "ebook"
            ? (item.price || item.bookId?.price || 0) * 0.7
            : item.price || item.bookId?.price || 0;
        return sum + price * item.quantity;
      }, 0);
    },

    total() {
      return this.subtotal - this.voucherDiscount;
    },

    // Format currency display
    formattedSubtotal() {
      return `$${this.subtotal.toFixed(2)}`;
    },

    formattedTotal() {
      return `$${this.total.toFixed(2)}`;
    },
  },
  async mounted() {
    await this.loadAvailableVouchers();
  },
  methods: {
    ...mapActions("order", ["createOrder", "createMomoOrder"]),

    // Helper methods to get item properties (handle both localStorage and store data)
    getItemCoverUrl(item) {
      return item.cover_url || item.bookId?.cover_url || "";
    },
    getItemTitle(item) {
      return item.title || item.bookId?.title || "Unknown";
    },
    getItemAuthors(item) {
      const authors = item.authors
      return authors 
    },
    getItemPrice(item) {
      return item.price || item.bookId?.price || 0;
    },

    async loadAvailableVouchers() {
      try {
        this.loadingVouchers = true;
        const response = await getAllVouchers();
        if (response) {
          this.availableVouchers = response;
        }
      } catch (error) {
        console.error("Error loading vouchers:", error);
      } finally {
        this.loadingVouchers = false;
      }
    },

    selectVoucher(voucher) {
      if (this.appliedVoucher && this.appliedVoucher.code === voucher.code) {
        return; // Already applied
      }
      this.voucherCode = voucher.code;
      this.applyVoucherCode();
    },

    async applyVoucherCode() {
      if (!this.voucherCode.trim()) return;

      this.voucherLoading = true;
      this.voucherError = "";

      try {
        const response = await validateVoucher(
          this.voucherCode.trim(),
          this.subtotal
        );

        if (response.success) {
          this.appliedVoucher = response.data.voucher;
          this.voucherDiscount = response.data.discountAmount;
          this.showAvailableVouchers = false;
        }
      } catch (error) {
        console.error("Voucher validation error:", error);
        this.voucherError =
          error.message || "Invalid voucher code. Please try again.";
        this.appliedVoucher = null;
        this.voucherDiscount = 0;
      } finally {
        this.voucherLoading = false;
      }
    },

    removeVoucherCode() {
      this.appliedVoucher = null;
      this.voucherDiscount = 0;
      this.voucherCode = "";
      this.voucherError = "";
    },

    updateQuantity(item, change) {
      // Implement quantity update logic
      item.quantity += change;
    },
    async handleConfirmPayment() {
      // Prevent double click
      if (this.isProcessingPayment) {
        console.log("Payment already in progress...");
        return;
      }

      try {
        this.isProcessingPayment = true;

        // Get voucher code if applied
        const voucherCode = this.appliedVoucher
          ? this.appliedVoucher.code
          : null;

        if (this.selectedPayment === "vnpay") {
          console.log("Creating order with VNPay payment...");
          console.log("Voucher code:", voucherCode);
          const paymentUrl = await this.createOrder(voucherCode);
          if (paymentUrl) {
            console.log("Redirecting to VNPay payment URL:", paymentUrl);
            window.location.href = paymentUrl;
          } else {
            console.error("Failed to get VNPay payment URL");
            alert("Payment processing failed. Please try again.");
            this.isProcessingPayment = false;
          }
        } else if (this.selectedPayment === "momo") {
          console.log("Creating order with MoMo payment...");
          console.log("Voucher code:", voucherCode);
          const paymentUrl = await this.createMomoOrder(voucherCode);
          if (paymentUrl) {
            console.log("Redirecting to MoMo payment URL:", paymentUrl);
            window.location.href = paymentUrl;
          } else {
            console.error("Failed to get MoMo payment URL");
            alert("Payment processing failed. Please try again.");
            this.isProcessingPayment = false;
          }
        } else {
          // Handle other payment methods
          console.log(
            "Processing order with payment method:",
            this.selectedPayment
          );
          this.isProcessingPayment = false;
          // Implement other payment methods here
        }
      } catch (error) {
        console.error("Error processing payment:", error);
        alert(
          "An error occurred while processing your payment. Please try again."
        );
        this.isProcessingPayment = false;
      }
    },
  },
};
</script>

<style scoped>
.v-card {
  overflow: hidden;
}

.rounded-lg {
  border-radius: 12px !important;
}

.v-radio :deep(.v-selection-control__wrapper) {
  margin-right: 8px;
}

.min-width-0 {
  min-width: 0;
}

.border-b {
  border-bottom: 1px solid;
}

/* Voucher card styles */
.voucher-list {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 4px;
}

.voucher-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.voucher-card:hover {
  border-color: rgb(var(--v-theme-primary));
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.voucher-applied {
  border-color: rgb(var(--v-theme-success));
  background-color: rgba(var(--v-theme-success), 0.05);
}

/* Scrollbar styles */
.voucher-list::-webkit-scrollbar {
  width: 6px;
}

.voucher-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.voucher-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.voucher-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Smooth transitions */
.v-btn,
.v-card {
  transition: all 0.3s ease;
}

.v-btn:hover {
  transform: translateY(-1px);
}

/* Better focus states */
.v-btn:focus {
  box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.2);
}
</style>
