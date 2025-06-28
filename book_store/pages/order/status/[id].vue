<template>
  <v-container class="pa-4">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <!-- Success Header -->
        <v-card class="mb-6" elevation="2">
          <v-card-text class="text-center py-8">
            <v-icon 
              icon="mdi-check-circle" 
              size="80" 
              color="success"
              class="mb-4"
            ></v-icon>
            <h1 class="text-h4 text-success mb-2">Payment Successful!</h1>
            <p class="text-h6 text-medium-emphasis">
              Thank you for your purchase
            </p>
          </v-card-text>
        </v-card>

        <!-- Order Details -->
        <v-card class="mb-4" elevation="2" v-if="order">
          <v-card-title class="bg-primary text-white">
            <v-icon icon="mdi-receipt" class="mr-2"></v-icon>
            Order Details
          </v-card-title>
          
          <v-card-text class="pa-4">
            <v-row>
              <v-col cols="12" sm="6">
                <div class="mb-3">
                  <span class="text-subtitle-2 text-medium-emphasis">Order ID:</span>
                  <div class="text-h6 font-weight-bold">{{ order.orderId }}</div>
                </div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="mb-3">
                  <span class="text-subtitle-2 text-medium-emphasis">Order Date:</span>
                  <div class="text-h6">{{ formatDate(order.createdAt) }}</div>
                </div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="mb-3">
                  <span class="text-subtitle-2 text-medium-emphasis">Payment Method:</span>
                  <div class="text-h6">{{ order.paymentMethod }}</div>
                </div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="mb-3">
                  <span class="text-subtitle-2 text-medium-emphasis">Status:</span>
                  <v-chip 
                    :color="getStatusColor(order.status)" 
                    variant="flat"
                    class="ml-2"
                  >
                    {{ order.status }}
                  </v-chip>
                </div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="mb-3">
                  <span class="text-subtitle-2 text-medium-emphasis">Payment Completed:</span>
                  <div class="text-h6">{{ formatDate(order.updatedAt) }}</div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Items Purchased -->
        <v-card class="mb-4" elevation="2" v-if="order && order.items">
          <v-card-title class="bg-secondary text-white">
            <v-icon icon="mdi-book-multiple" class="mr-2"></v-icon>
            Items Purchased ({{ order.items.length }})
          </v-card-title>
          
          <v-list>
            <v-list-item
              v-for="(item, index) in order.items"
              :key="index"
              class="px-4 py-3"
            >
              <template v-slot:prepend>
                <v-avatar size="80" rounded="lg" class="mr-4">
                  <v-img 
                    :src="item.bookId.cover_url" 
                    :alt="item.bookId.title"
                    cover
                  >
                    <template v-slot:placeholder>
                      <v-row class="fill-height ma-0" align="center" justify="center">
                        <v-icon icon="mdi-book" size="40" color="grey-lighten-2"></v-icon>
                      </v-row>
                    </template>
                  </v-img>
                </v-avatar>
              </template>

              <v-list-item-title class="text-h6 mb-1">
                {{ item.bookId.title }}
              </v-list-item-title>
              
              <v-list-item-subtitle class="mb-2">
                <div class="text-body-2 text-medium-emphasis mb-1">
                  by {{ item.bookId.authors.join(', ') }}
                </div>
                <div class="text-body-2 text-medium-emphasis mb-2">
                  Published: {{ item.bookId.first_publish_year }}
                </div>
                <div class="d-flex align-center mb-2">
                  <v-rating
                    :model-value="item.bookId.rating"
                    color="amber"
                    density="compact"
                    size="small"
                    readonly
                    half-increments
                  ></v-rating>
                  <span class="text-body-2 ml-2">({{ item.bookId.rating }})</span>
                </div>
                <div class="d-flex flex-wrap gap-1">
                  <v-chip
                    v-for="subject in item.bookId.subjects"
                    :key="subject"
                    size="small"
                    variant="outlined"
                    color="primary"
                  >
                    {{ subject }}
                  </v-chip>
                </div>
                <v-expansion-panels class="mt-2" variant="accordion">
                  <v-expansion-panel>
                    <v-expansion-panel-title class="text-body-2">
                      <v-icon icon="mdi-book-open-page-variant" class="mr-2"></v-icon>
                      View Description
                    </v-expansion-panel-title>
                    <v-expansion-panel-text class="text-body-2">
                      {{ item.bookId.description }}
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-list-item-subtitle>

              <template v-slot:append>
                <div class="text-right">
                  <div class="text-body-2 text-medium-emphasis">Quantity: {{ item.quantity }}</div>
                  <div class="text-h6 font-weight-bold">${{ (item.bookId.price).toFixed(2) }}</div>
                </div>
              </template>
            </v-list-item>
            
            <v-divider v-if="index < order.items.length - 1" :key="`divider-${index}`"></v-divider>
          </v-list>
        </v-card>

        <!-- Order Summary -->
        <v-card class="mb-6" elevation="2" v-if="order">
          <v-card-title class="bg-success text-white">
            <v-icon icon="mdi-calculator" class="mr-2"></v-icon>
            Order Summary
          </v-card-title>
          <v-card-text class="pa-4">
            <div v-for="(item, index) in order.items" :key="index" class="d-flex justify-space-between mb-2">
              <span>{{ item.bookId.title }} (x{{ item.quantity }})</span>
              <span>${{ (item.bookId.price * item.quantity).toFixed(2) }}</span>
            </div>
            <v-divider class="my-3"></v-divider>
            <div class="d-flex justify-space-between">
              <span class="text-h6 font-weight-bold">Total:</span>
              <span class="text-h5 font-weight-bold text-success">
                ${{ (order.total / 100).toFixed(2) }}
              </span>
            </div>
          </v-card-text>
        </v-card>

        <!-- Action Buttons -->
        <v-row class="mb-4">
          <v-col cols="12" sm="6">
            <v-btn
              color="primary"
              variant="flat"
              size="large"
              block
              prepend-icon="mdi-home"
              @click="goToHome"
            >
              Continue Shopping
            </v-btn>
          </v-col>
          <v-col cols="12" sm="6">
            <v-btn
              color="secondary"
              variant="outlined"
              size="large"
              block
              prepend-icon="mdi-account-box"
              @click="goToOrders"
            >
              View My Orders
            </v-btn>
          </v-col>
        </v-row>

        <!-- Additional Info -->
        <v-alert
          type="info"
          variant="tonal"
          icon="mdi-information"
          class="mb-4"
        >
          <div class="text-body-2">
            <strong>What's next?</strong><br>
            • You will receive an email confirmation shortly<br>
            • Your order will be processed within 1-2 business days<br>
            • Track your order status in "My Orders" section
          </div>
        </v-alert>
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
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    getStatusColor(status) {
      switch (status.toLowerCase()) {
        case 'paid':
          return 'success';
        case 'pending':
          return 'warning';
        case 'failed':
          return 'error';
        default:
          return 'primary';
      }
    },
    
    goToHome() {
      this.$router.push('/');
    },
    
    goToOrders() {
      this.$router.push('/orders');
    }
  },
  
  async mounted() {
    await this.getOrder();
    console.log("Order fetched:", this.order);
  },
};
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}

.v-list-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.v-list-item:last-child {
  border-bottom: none;
}
</style>
