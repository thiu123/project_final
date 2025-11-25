<template>
  <div class="bg-gradient-to-br from-white to-blue-50 min-h-screen">
    <v-container class="pa-4 pa-md-6">
      <v-row>
        <!-- Cart Items Section -->
        <v-col cols="12" lg="8" xl="8">
          <v-card class="mb-4" elevation="3" rounded="xl">
            <v-card-title
              class="d-flex align-center py-4 px-4 bg-waterblue text-white"
            >
              <v-icon
                icon="mdi-cart-outline"
                color="white"
                class="mr-3"
                size="large"
              ></v-icon>
              <span class="text-h5 font-weight-bold"
                >Cart ({{ cartItems.length }} items)</span
              >
            </v-card-title>

            <v-divider></v-divider>

            <v-card-text class="pa-0">
              <!-- Desktop Header -->
              <v-row
                class="ma-0 pa-4 text-subtitle-1 font-weight-medium d-none d-md-flex"
              >
                <v-col cols="6" class="d-flex align-center">
                  <v-checkbox
                    v-model="selectAll"
                    :label="`Select all ${cartItems.length} items`"
                    hide-details
                    density="compact"
                    color="waterblue"
                  ></v-checkbox>
                </v-col>
                <v-col cols="2" class="text-center">Quantity</v-col>
                <v-col cols="2" class="text-end">Price</v-col>
                <v-col cols="2">Delete</v-col>
              </v-row>

              <!-- Mobile Header -->
              <div
                class="d-flex d-md-none align-center justify-space-between pa-4 bg-grey-lighten-5"
              >
                <v-checkbox
                  v-model="selectAll"
                  :label="`Select all ${cartItems.length} items`"
                  hide-details
                  density="compact"
                  color="waterblue"
                ></v-checkbox>
                <v-btn
                  variant="text"
                  color="waterblue"
                  size="small"
                  @click="deleteSelectedItems"
                  :disabled="selectedItems.length === 0"
                >
                  <v-icon start>mdi-delete</v-icon>
                  Delete Selected
                </v-btn>
              </div>

              <v-card
                v-if="isLoaded && !cartItems.length"
                class="pa-8 text-center"
              >
                <v-icon
                  icon="mdi-cart-outline"
                  size="80"
                  color="grey-lighten-2"
                  class="mb-4"
                ></v-icon>
                <h3 class="text-h5 font-weight-bold text-customblack mb-3">
                  Your cart is empty
                </h3>
                <p
                  class="text-body-1 text-grey-darken-1 mb-6 mx-auto"
                  style="max-width: 400px"
                >
                  Add items to cart to continue shopping
                </p>
                <v-btn
                  color="waterblue"
                  prepend-icon="mdi-shopping"
                  variant="elevated"
                  size="large"
                  rounded="lg"
                  to="/"
                  class="font-weight-bold text-white"
                >
                  Continue Shopping
                </v-btn>
              </v-card>

              <!-- Cart Items -->
              <v-slide-y-transition group v-if="cartItems.length > 0">
                <div
                  v-for="(item, index) in cartItems"
                  :key="index"
                  class="mb-3 mx-3 transition-all duration-300 bg-transparent"
                  rounded="lg"
                >
                  <v-row class="ma-0 pa-4 align-center">
                    <!-- Checkbox and Image -->
                    <v-col
                      cols="12"
                      sm="6"
                      md="6"
                      lg="6"
                      class="d-flex align-center"
                    >
                      <v-checkbox
                        v-model="selectedItems"
                        :value="item?.bookId?._id"
                        hide-details
                        density="compact"
                        color="waterblue"
                        class="mr-3 d-none d-md-flex"
                      ></v-checkbox>
                      <div
                        class="mr-4 d-flex align-center"
                        style="min-width: 80px"
                      >
                        <v-img
                          :src="item?.bookId?.cover_url"
                          width="80"
                          height="120"
                          class="elevation-2"
                          cover
                        >
                          <template v-slot:placeholder>
                            <v-row
                              class="fill-height ma-0"
                              align="center"
                              justify="center"
                            >
                              <v-progress-circular
                                indeterminate
                                color="waterblue"
                              ></v-progress-circular>
                            </v-row>
                          </template>
                        </v-img>
                      </div>

                      <div class="flex-grow-1 min-width-0">
                        <div
                          class="text-subtitle-1 font-weight-bold text-customblack mb-2 text-truncate"
                        >
                          {{ item?.bookId?.title || "Product name" }}
                        </div>
                        <div
                          class="text-body-2 text-grey-darken-1 mb-2 d-md-none"
                        >
                          by {{ item?.bookId?.author || "Unknown Author" }}
                        </div>
                        <div
                          class="text-h6 font-weight-bold text-waterblue mb-2 d-md-none"
                        >
                          ${{ getItemPrice(item) }}
                        </div>
                        <div class="d-flex ga-2 mb-2 flex-wrap">
                          <v-chip
                            size="small"
                            :color="
                              item.productType === 'ebook'
                                ? 'success'
                                : 'primary'
                            "
                            variant="tonal"
                            class="text-caption"
                          >
                            {{
                              item.productType === "ebook"
                                ? "📱 Ebook"
                                : "📚 Hardbook"
                            }}
                          </v-chip>

                          <!-- Stock display for hardbooks -->
                          <v-chip
                            v-if="item.productType === 'hardbook'"
                            size="small"
                            :color="getStockColor(item.bookId.stock)"
                            variant="outlined"
                            class="text-caption"
                          >
                            {{ getStockText(item.bookId.stock) }}
                          </v-chip>
                        </div>
                        <v-chip
                          size="small"
                          color="waterblue"
                          variant="outlined"
                          class="text-caption text-capitalize"
                          v-if="
                            item?.bookId?.subjects &&
                            item?.bookId?.subjects.length > 0
                          "
                        >
                          {{ item?.bookId?.subjects[0] }}
                        </v-chip>
                      </div>
                    </v-col>

                    <!-- Quantity - Much Smaller -->
                    <v-col
                      cols="4"
                      sm="2"
                      class="d-flex justify-center align-center"
                    >
                      <div
                        class="d-flex align-center justify-center pa-1 rounded-lg"
                        style="
                          background: rgba(82, 149, 208, 0.05);
                          min-width: 80px;
                        "
                      >
                        <v-btn
                          icon="mdi-minus"
                          variant="tonal"
                          size="x-small"
                          color="grey-darken-1"
                          density="comfortable"
                          @click="decreaseQuantity(item)"
                          :disabled="item.quantity <= 1"
                          class="transition-all duration-200"
                        ></v-btn>
                        <v-text-field
                          v-model="item.quantity"
                          type="number"
                          variant="outlined"
                          density="compact"
                          hide-details
                          class="mx-1"
                          :hide-spin-buttons="true"
                          style="min-width: 35px; max-width: 45px"
                          rounded="lg"
                          color="waterblue"
                        ></v-text-field>

                        <v-btn
                          icon="mdi-plus"
                          variant="tonal"
                          size="x-small"
                          color="waterblue"
                          density="comfortable"
                          @click="increaseQuantity(item)"
                          :disabled="
                            item.productType === 'hardbook' &&
                            item.quantity >= item.bookId.stock
                          "
                          class="transition-all duration-200"
                        ></v-btn>
                      </div>
                    </v-col>

                    <!-- Price -->
                    <v-col cols="4" sm="2" class="text-end d-none d-md-block">
                      <div class="text-end">
                        <div
                          class="text-subtitle-1 font-weight-bold text-waterblue"
                        >
                          ${{ getItemPrice(item) }}
                        </div>
                        <div
                          v-if="item.productType === 'ebook'"
                          class="text-caption text-grey-darken-1 text-decoration-line-through"
                        >
                          ${{ item?.bookId?.price || "0" }}
                        </div>
                      </div>
                    </v-col>

                    <!-- Delete Button -->
                    <v-col cols="4" sm="2" class="text-end">
                      <v-btn
                        variant="text"
                        icon
                        size="small"
                        color="error"
                        @click="confirmDeleteItem(item.bookId._id)"
                        class="transition-all duration-200"
                      >
                        <v-icon>mdi-trash-can-outline</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                  <v-divider v-if="index < cartItems.length - 1"></v-divider>
                </div>
              </v-slide-y-transition>

              <v-divider></v-divider>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Order Summary Section -->
        <v-col cols="12" lg="4" xl="4">
          <!-- Order Summary Card -->
          <v-card
            elevation="3"
            rounded="xl"
            class="position-sticky"
            style="top: 24px"
          >
            <v-card-title
              class="py-4 px-4 bg-waterblue text-white d-flex align-center"
            >
              <v-icon icon="mdi-receipt" color="white" class="mr-2"></v-icon>
              <span class="font-weight-bold">PAYMENT SUMMARY</span>
            </v-card-title>

            <v-card-text class="pa-6">
              <v-alert
                v-if="selectedItems.length === 0"
                type="info"
                variant="tonal"
                density="compact"
                class="mb-4"
              >
                No items selected
              </v-alert>

              <div v-else class="mb-4">
                <div class="d-flex align-center justify-space-between mb-2">
                  <span class="text-caption text-grey-darken-1"
                    >Selected items</span
                  >
                  <span class="text-caption font-weight-bold text-waterblue">
                    {{ selectedItems.length }} / {{ cartItems.length }}
                  </span>
                </div>
              </div>

              <v-list density="compact" class="pa-0 bg-transparent">
                <v-list-item class="px-0">
                  <template v-slot:prepend>
                    <span class="text-body-1 text-customblack">Subtotal</span>
                  </template>
                  <template v-slot:append>
                    <span class="text-body-1 font-weight-bold text-customblack"
                      >${{ totalPrice.toFixed(2) }}</span
                    >
                  </template>
                </v-list-item>

                <v-list-item class="px-0">
                  <template v-slot:prepend>
                    <span class="text-body-1 text-customblack"
                      >Shipping fee</span
                    >
                  </template>
                  <template v-slot:append>
                    <span class="text-body-1 font-weight-bold text-customblack"
                      >$0.00</span
                    >
                  </template>
                </v-list-item>

                <v-divider class="my-3"></v-divider>

                <v-list-item class="px-0">
                  <template v-slot:prepend>
                    <span class="text-h6 font-weight-bold text-customblack"
                      >Total</span
                    >
                  </template>
                  <template v-slot:append>
                    <span class="text-h6 font-weight-bold text-waterblue"
                      >${{ totalPrice.toFixed(2) }}</span
                    >
                  </template>
                </v-list-item>

                <v-list-item class="px-0">
                  <template v-slot:prepend>
                    <span class="text-caption text-grey-darken-1"
                      >(VAT included)</span
                    >
                  </template>
                </v-list-item>
              </v-list>

              <v-btn
                color="waterblue"
                size="large"
                block
                elevation="2"
                class="text-h6 font-weight-bold mt-6 text-white"
                prepend-icon="mdi-cash-register"
                rounded="lg"
                @click="handleCheckout"
                :disabled="selectedItems.length === 0"
              >
                CHECKOUT ({{ selectedItems.length }})
              </v-btn>

              <v-alert
                v-if="selectedItems.length === 0"
                type="warning"
                variant="tonal"
                density="compact"
                class="mt-3 text-caption"
              >
                Please select at least one item to checkout
              </v-alert>

              <div class="d-flex align-center justify-center gap-2 mt-4">
                <v-icon
                  icon="mdi-shield-check"
                  color="lightgreen"
                  size="small"
                ></v-icon>
                <span class="text-caption text-grey-darken-1"
                  >Secure payment</span
                >
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="confirmDelete" max-width="400" persistent>
      <v-card rounded="xl">
        <v-card-title
          class="text-h5 font-weight-bold text-customblack pa-6 pb-0"
        >
          Delete item
        </v-card-title>
        <v-card-text class="pa-6 pt-4">
          Are you sure you want to remove this item from your cart?
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="confirmDelete = false"
            rounded="lg"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="deleteItem"
            rounded="lg"
            class="font-weight-bold"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  data() {
    return {
      drawer: false,
      selectAll: false,
      selectedItems: [],
      confirmDelete: false,
      itemToDelete: null,
      isLoaded: false,
      loading: false,
    };
  },
  computed: {
    ...mapState("cart", ["cart"]),
    cartItems() {
      return this.cart?.items || [];
    },
    selectedCartItems() {
      // Get only selected items
      return this.cartItems.filter((item) =>
        this.selectedItems.includes(item.bookId._id)
      );
    },
    totalPrice() {
      // Calculate total only for selected items
      return this.selectedCartItems.reduce((total, item) => {
        const price =
          item.productType === "ebook"
            ? item.bookId.price * 0.7
            : item.bookId.price;
        return total + price * item.quantity;
      }, 0);
    },
  },
  watch: {
    selectAll(val) {
      if (val) {
        console.log("Selecting all items", val);
        this.selectedItems = this.cartItems.map((item) => item.bookId._id);
      } else {
        this.selectedItems = [];
      }
    },
    selectedItems(val) {
      console.log("Selected items changed:", val);
      this.selectAll =
        val.length === this.cartItems.length && this.cartItems.length > 0;
    },
  },
  methods: {
    ...mapActions("cart", ["fetchCart", "removeCartItem"]),

    handleCheckout() {
      if (this.selectedItems.length === 0) {
        return;
      }

      // Get selected items data
      const selectedItemsData = this.selectedCartItems.map((item) => ({
        bookId: item.bookId._id,
        title: item.bookId.title,
        authors: item.bookId.authors[0],
        cover_url: item.bookId.cover_url,
        price: item.bookId.price,
        quantity: item.quantity,
        productType: item.productType,
        subjects: item.bookId.subjects,
        stock: item.bookId.stock,
      }));

      // Store in localStorage for order page (only on client side)
      if (import.meta.client) {
        localStorage.setItem(
          "checkoutItems",
          JSON.stringify(selectedItemsData)
        );
      }

      console.log("Checkout with items:", selectedItemsData);

      // Navigate to order page
      this.$router.push("/order");
    },

    getItemPrice(item) {
      const basePrice = item?.bookId?.price || 0;
      if (item.productType === "ebook") {
        return (basePrice * 0.7).toFixed(2); // 70% giá hardbook cho ebook
      }
      return basePrice.toFixed(2);
    },

    getStockColor(stock) {
      if (stock > 20) return "success";
      if (stock > 0) return "warning";
      return "error";
    },

    getStockText(stock) {
      if (stock > 20) return `${stock} in stock`;
      if (stock > 0) return `Only ${stock} left!`;
      return "Out of stock";
    },

    increaseQuantity(item) {
      // For hardbooks, check stock limit
      if (item.productType === "hardbook") {
        const maxAllowed = item.bookId.stock || 0;
        if (item.quantity < maxAllowed) {
          item.quantity++;
        }
      } else {
        // Ebook has no stock limit
        item.quantity++;
      }
    },
    decreaseQuantity(item) {
      if (item.quantity > 1) {
        item.quantity--;
      }
    },
    confirmDeleteItem(bookId) {
      if(!bookId) return;
      this.itemToDelete = bookId;
      this.confirmDelete = true;
    },
    async deleteItem() {
      try {
        if(!this.itemToDelete) return;

        if(this.selectAll) {
          // If all selected, delete all selected items
          await this.deleteSelectedItems();
          this.confirmDelete = false;
          this.itemToDelete = null;
          return;
        }
        
        if (this.itemToDelete) {
          await this.removeCartItem(this.itemToDelete);
          this.confirmDelete = false;
          this.itemToDelete = null;
        }
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    },
    async deleteSelectedItems() {
      try {
        for (const bookId of this.selectedItems) {
          await this.removeCartItem(bookId);
        }
        this.selectedItems = [];
      } catch (error) {
        console.error("Error deleting selected items:", error);
      }
    },
  },
  async mounted() {
    this.loading = true;
    this.isLoaded = false;

    try {
      await this.fetchCart();

      // Auto-select all items when cart loads
      if (this.cartItems.length > 0) {
        this.selectedItems = this.cartItems.map((item) => item.bookId._id);
        this.selectAll = true;
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
    } finally {
      this.loading = false;
      this.isLoaded = true;
    }
  },
};
</script>

<style scoped>
/* Responsive adjustments using Vuetify utility classes */
@media (max-width: 960px) {
  .position-sticky {
    position: static !important;
  }
}

@media (max-width: 600px) {
  .d-flex.justify-center.align-center > div {
    min-width: 70px !important;
  }

  .mr-4.d-flex.align-center {
    min-width: 60px !important;
  }
}
</style>
