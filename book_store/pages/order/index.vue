<template>
  <v-app>
    <v-main>
      <v-container class="pa-2 pa-md-4">
        <!-- Delivery Information -->
        <!-- <v-card class="mb-4 mb-md-6" elevation="1">
          <v-card-title class="bg-grey-lighten-4 text-body-1 text-md-h6">
            <v-icon class="mr-2" size="small">mdi-map-marker</v-icon>
            DELIVERY ADDRESS
          </v-card-title>
          <v-card-text class="pa-2 pa-md-4">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.fullName"
                  label="Recipient's full name"
                  placeholder="Enter recipient's full name"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.email"
                  label="Email"
                  placeholder="Enter email"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.phone"
                  label="Phone number"
                  placeholder="Example: 0979123xxx (10 digits)"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="form.country"
                  label="Country"
                  :items="['Vietnam']"
                  variant="outlined"
                  density="compact"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.city"
                  label="Province/City"
                  placeholder="Select province/city"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.district"
                  label="District"
                  placeholder="Select district"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="form.ward"
                  label="Ward"
                  placeholder="Select ward"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="form.address"
                  label="Delivery address"
                  placeholder="Enter delivery address"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card> -->

        <!-- Shipping Method -->
        <v-card class="mb-4 mb-md-6" elevation="1">
          <v-card-title class="bg-grey-lighten-4 text-body-1 text-md-h6">
            <v-icon class="mr-2" size="small">mdi-truck</v-icon>
            SHIPPING METHOD
          </v-card-title>
          <v-card-text class="pa-2 pa-md-4">
            <v-radio-group v-model="selectedShipping" hide-details>
              <v-radio value="standard" color="primary">
                <template v-slot:label>
                  <div class="text-body-2 text-sm-body-1">
                    <div class="font-weight-medium">
                      Standard shipping: {{ shippingFee }}
                    </div>
                    <div class="text-caption text-grey">
                      Estimated delivery: Friday 12/23
                    </div>
                  </div>
                </template>
              </v-radio>
            </v-radio-group>
          </v-card-text>
        </v-card>

        <!-- Payment Methods -->
        <v-card class="mb-4 mb-md-6" elevation="1">
          <v-card-title class="bg-grey-lighten-4 text-body-1 text-md-h6">
            <v-icon class="mr-2" size="small">mdi-credit-card</v-icon>
            PAYMENT METHOD
          </v-card-title>
          <v-card-text class="pa-2 pa-md-4">
            <v-radio-group v-model="selectedPayment" hide-details>
              <!-- <v-radio value="zalopay" color="primary" class="mb-2">
                <template v-slot:label>
                  <div class="d-flex align-center flex-wrap">
                    <v-avatar size="24" class="mr-2 flex-shrink-0">
                    </v-avatar>
                    <span class="text-body-2 text-sm-body-1 mr-2"
                      >ZaloPay Wallet</span
                    >
                    <a
                      href="#"
                      class="text-primary text-decoration-underline text-caption text-sm-body-2"
                      >Details</a
                    >
                  </div>
                </template>
              </v-radio> -->

              <v-radio value="vnpay" color="primary" class="mb-2">
                <template v-slot:label>
                  <div class="d-flex align-center flex-wrap">
                    <v-avatar size="80" class="mr-2 flex-shrink-0">
                      <v-img
                        src="../../assets/vnpay-logo-inkythuatso.svg"
                      ></v-img>
                    </v-avatar>
                  </div>
                </template>
              </v-radio>

              <!-- <v-radio value="momo" color="primary" class="mb-2">
                <template v-slot:label>
                  <div class="d-flex align-center">
                    <v-avatar size="24" class="mr-2 flex-shrink-0">
                    </v-avatar>
                    <span class="text-body-2 text-sm-body-1">Momo Wallet</span>
                  </div>
                </template>
              </v-radio> -->

              <v-radio value="momo" color="primary" class="mb-2">
                <template v-slot:label>
                  <div class="d-flex align-center">
                    <v-avatar size="40" class="mr-2 flex-shrink-0">
                      <v-img
                        src="../../assets/Logo-MoMo-Square-300x300.png"
                      ></v-img>
                    </v-avatar>
                  </div>
                </template>
              </v-radio>
            </v-radio-group>
          </v-card-text>
        </v-card>

        <!-- Promotion Code -->
        <v-card class="mb-4 mb-md-6" elevation="1">
          <v-card-title class="bg-grey-lighten-4 text-body-1 text-md-h6">
            <v-icon class="mr-2" size="small">mdi-tag</v-icon>
            PROMOTION CODE/GIFT CODE
          </v-card-title>
          <v-card-text class="pa-2 pa-md-4">
            <div class="d-flex flex-column flex-sm-row ga-2 mb-2">
              <v-text-field
                v-model="promoCode"
                placeholder="Enter promotion/gift code"
                variant="outlined"
                density="compact"
                hide-details
                class="flex-grow-1"
              ></v-text-field>
              <div class="d-flex ga-2">
                <v-btn
                  color="primary"
                  variant="flat"
                  :size="$vuetify.display.xs ? 'small' : 'default'"
                  class="flex-shrink-0"
                >
                  Apply
                </v-btn>
                <v-btn
                  variant="outlined"
                  color="primary"
                  :size="$vuetify.display.xs ? 'small' : 'default'"
                  class="flex-shrink-0"
                >
                  <span class="d-none d-sm-inline">Choose promotion code</span>
                  <span class="d-sm-none">Choose code</span>
                </v-btn>
              </div>
            </div>
            <div class="text-caption text-grey">
              <v-icon size="small" class="mr-1">mdi-information</v-icon>
              Multiple codes can be applied simultaneously
            </div>
          </v-card-text>
        </v-card>

        <!-- Additional Options -->
        <!-- <v-card class="mb-4 mb-md-6" elevation="1">
          <v-card-title class="bg-grey-lighten-4 text-body-1 text-md-h6">
            <v-icon class="mr-2" size="small">mdi-information</v-icon>
            ADDITIONAL INFORMATION
          </v-card-title>
          <v-card-text class="pa-2 pa-md-4">
            <v-checkbox
              v-model="giftNote"
              label="Add a note"
              color="primary"
              hide-details
              class="mb-2"
              density="compact"
            ></v-checkbox>
            <v-checkbox
              v-model="invoice"
              label="Request VAT invoice"
              color="primary"
              hide-details
              class="mb-3"
              density="compact"
            ></v-checkbox>
            <div class="text-caption">
              <v-icon size="small" class="mr-1">mdi-check</v-icon>
              By proceeding with the purchase, the customer agrees to the
              <a href="#" class="text-primary">General Transaction Terms</a>
              issued by Book50:
              <a href="#" class="text-primary">Terms of use</a> |
              <a href="#" class="text-primary">Payment security policy</a>
              |
              <a href="#" class="text-primary"
                >Personal information privacy policy</a
              >
              | <a href="#" class="text-primary">Shipping policy</a> |
              <a href="#" class="text-primary">Return and refund policy</a>.
            </div>
          </v-card-text>
        </v-card> -->

        <!-- Order Review -->
        <v-card class="mb-4 mb-md-6" elevation="1">
          <v-card-title class="bg-grey-lighten-4 text-body-1 text-md-h6">
            <v-icon class="mr-2" size="small">mdi-cart</v-icon>
            REVIEW YOUR ORDER
          </v-card-title>
          <v-card-text v-if="cartItems.length" class="pa-2 pa-md-4">
            <!-- Loop through cartItems -->
            <div
              v-for="(item, index) in cartItems"
              :key="item._id"
              class="mb-4"
              :class="{ 'border-bottom pb-4': index < cartItems.length - 1 }"
            >
              <!-- Mobile Layout -->
              <div class="d-flex d-sm-none flex-column gap-3">
                <div class="d-flex gap-3">
                  <img
                    :src="item.bookId.cover_url"
                    width="60"
                    height="80"
                    class="flex-shrink-0 rounded"
                    :alt="item.bookId.title"
                  />
                  <div class="flex-grow-1 min-width-0">
                    <div class="font-weight-medium mb-1 text-body-2">
                      {{ item.bookId.title }}
                    </div>
                    <div class="text-caption text-grey mb-2">
                      Author: {{ item.bookId.authors.join(", ") }}
                    </div>
                    <div class="text-subtitle-2 text-primary">
                      {{ item.bookId.price }}
                    </div>
                  </div>
                </div>
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center gap-2">
                    <v-btn
                      size="x-small"
                      variant="outlined"
                      icon="mdi-minus"
                      @click="updateQuantity(item, -1)"
                      :disabled="item.quantity <= 1"
                    ></v-btn>
                    <span class="px-2 text-body-2">{{ item.quantity }}</span>
                    <v-btn
                      size="x-small"
                      variant="outlined"
                      icon="mdi-plus"
                      @click="updateQuantity(item, 1)"
                    ></v-btn>
                  </div>
                  <span class="text-subtitle-2 font-weight-bold">
                    {{ item.bookId.price * item.quantity }}
                  </span>
                </div>
              </div>

              <!-- Desktop/Tablet Layout -->
              <div class="d-none d-sm-flex align-center ga-4">
                <img
                  :src="item.bookId.cover_url"
                  width="180"
                  height="200"
                  class="flex-shrink-0 rounded"
                  :alt="item.bookId.title"
                />
                <div class="flex-grow-1">
                  <div class="font-weight-medium mb-1">
                    {{ item.bookId.title }}
                  </div>
                  <div class="text-caption text-grey mb-2">
                    Author: {{ item.bookId.authors.join(", ") }}
                  </div>
                  <div class="d-flex align-center justify-space-between">
                    <span class="text-h6 text-primary"
                      >{{ item.bookId.price }}$</span
                    >
                    <div class="d-flex align-center gap-2">
                      <v-btn
                        size="small"
                        variant="outlined"
                        icon="mdi-minus"
                        @click="updateQuantity(item, -1)"
                        :disabled="item.quantity <= 1"
                      ></v-btn>
                      <span class="px-3">{{ item.quantity }}</span>
                      <v-btn
                        size="small"
                        variant="outlined"
                        icon="mdi-plus"
                        @click="updateQuantity(item, 1)"
                      ></v-btn>
                    </div>
                    <span class="text-h6">{{
                      item.bookId.price * item.quantity
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Order Summary -->
        <v-card class="mb-4 mb-md-6" elevation="1">
          <v-card-text class="pa-2 pa-md-4">
            <div class="d-flex justify-space-between mb-2 text-body-2">
              <span>Subtotal</span>
              <span>{{ formattedSubtotal }}</span>
            </div>
            <div class="d-flex justify-space-between mb-2 text-body-2">
              <span>Shipping fee (Standard shipping)</span>
              <span>{{ formattedShippingFee }}</span>
            </div>
            <v-divider class="my-3"></v-divider>
            <div
              class="d-flex justify-space-between text-subtitle-1 text-md-h6 font-weight-bold"
            >
              <span>Total amount (including VAT)</span>
              <span class="text-primary">{{ formattedTotal }}</span>
            </div>
          </v-card-text>
        </v-card>

        <!-- Action Buttons -->
        <div class="d-flex flex-column flex-sm-row ga-3">
          <v-btn
            variant="outlined"
            :size="$vuetify.display.xs ? 'default' : 'large'"
            prepend-icon="mdi-arrow-left"
            class="flex-grow-1 order-2 order-sm-1"
          >
            <span class="d-none d-sm-inline">Back to order</span>
            <span class="d-sm-none">Back</span>
          </v-btn>
          <v-btn
            color="primary"
            :size="$vuetify.display.xs ? 'default' : 'large'"
            class="flex-grow-1 order-1 order-sm-2"
            @click="handleConfirmPayment"
          >
            <span class="d-none d-sm-inline">CONFIRM PAYMENT</span>
            <span class="d-sm-none">CONFIRM</span>
          </v-btn>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  data() {
    return {
      form: {
        fullName: "",
        email: "",
        phone: "",
        country: "Việt Nam",
        city: "",
        district: "",
        ward: "",
        address: "",
      },
      selectedShipping: "standard",
      selectedPayment: "vnpay",
      promoCode: "",
      giftNote: false,
      invoice: false,
      shippingFee: 30000,
      exchangeRate: 24000, // USD to VND exchange rate
    };
  },
  computed: {
    ...mapState("order", ["cartItems"]),

    subtotal() {
      if (!this.cartItems || this.cartItems.length === 0) return 0;

      return this.cartItems.reduce((sum, item) => {
        return sum + item.bookId.price * item.quantity;
      }, 0);
    },

    total() {
      return this.subtotal + this.shippingFee / this.exchangeRate;
    },

    // Format currency display
    formattedSubtotal() {
      return `$${this.subtotal.toFixed(2)}`;
    },

    formattedShippingFee() {
      return `$${(this.shippingFee / this.exchangeRate).toFixed(2)}`;
    },

    formattedTotal() {
      return `$${this.total.toFixed(2)}`;
    },
  },
  async mounted() {
    await this.fetchCartPreview();
    console.log(this.cartItems, "Cart items loaded");
  },
  methods: {
    ...mapActions("order", [
      "fetchCartPreview",
      "createOrder",
      "createMomoOrder",
    ]),

    updateQuantity(item, change) {
      // Implement quantity update logic
      item.quantity += change;
    },
    async handleConfirmPayment() {
      try {
        if (this.selectedPayment === "vnpay") {
          console.log("Creating order with VNPay payment...");
          const paymentUrl = await this.createOrder();
          if (paymentUrl) {
            console.log("Redirecting to VNPay payment URL:", paymentUrl);
            window.location.href = paymentUrl;
          } else {
            console.error("Failed to get VNPay payment URL");
            alert("Payment processing failed. Please try again.");
          }
        } else if (this.selectedPayment === "momo") {
          console.log("Creating order with MoMo payment...");
          const paymentUrl = await this.createMomoOrder();
          if (paymentUrl) {
            console.log("Redirecting to MoMo payment URL:", paymentUrl);
            window.location.href = paymentUrl;
          } else {
            console.error("Failed to get MoMo payment URL");
            alert("Payment processing failed. Please try again.");
          }
        } else {
          // Handle other payment methods
          console.log(
            "Processing order with payment method:",
            this.selectedPayment
          );
          // Implement other payment methods here
        }
      } catch (error) {
        console.error("Error processing payment:", error);
        alert(
          "An error occurred while processing your payment. Please try again."
        );
      }
    },
  },
};
</script>

<style scoped>
.v-card-title {
  font-size: 0.95rem;
  font-weight: 600;
  padding: 12px 16px;
}

@media (max-width: 599px) {
  .v-card-title {
    padding: 8px 12px;
    font-size: 0.875rem;
  }
}

.v-radio :deep(.v-selection-control__wrapper) {
  margin-right: 8px;
}

.rounded {
  border-radius: 8px;
}

.min-width-0 {
  min-width: 0;
}

@media (max-width: 599px) {
  .text-caption {
    font-size: 0.75rem;
  }
}
</style>
