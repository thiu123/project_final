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
                        :value="item.bookId._id"
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
                          class="rounded-lg elevation-2"
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
                          ${{ item?.bookId?.price || "0" }}
                        </div>
                        <v-chip
                          size="small"
                          color="waterblue"
                          variant="outlined"
                          class="text-caption text-capitalize"
                          v-if="
                            item.bookId.subjects &&
                            item.bookId.subjects.length > 0
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
                          class="transition-all duration-200"
                        ></v-btn>
                      </div>
                    </v-col>

                    <!-- Price -->
                    <v-col cols="4" sm="2" class="text-end d-none d-md-block">
                      <div
                        class="text-subtitle-1 font-weight-bold text-waterblue"
                      >
                        ${{ item?.bookId?.price || "0" }}
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
          <!-- Promotions Card -->
          <v-card class="mb-4" elevation="3" rounded="xl">
            <v-card-title
              class="py-3 px-4 bg-customyellow text-darkgreen d-flex align-center"
            >
              <v-icon
                icon="mdi-ticket-percent"
                color="darkgreen"
                class="mr-2"
              ></v-icon>
              <span class="font-weight-bold">PROMOTIONS</span>
              <v-spacer></v-spacer>
              <v-btn
                variant="text"
                color="darkgreen"
                size="small"
                append-icon="mdi-chevron-right"
                class="text-caption"
              >
                View more
              </v-btn>
            </v-card-title>

            <v-card-text class="pa-0">
              <!-- Discount Code -->
              <v-expand-transition>
                <div class="pa-4">
                  <v-sheet class="pa-4 rounded-lg bg-grey-lighten-5 mb-4">
                    <div class="d-flex justify-space-between align-center mb-3">
                      <div class="font-weight-bold text-customblack">
                        20% OFF CODE
                      </div>
                      <v-btn
                        variant="text"
                        color="waterblue"
                        size="small"
                        density="compact"
                        class="text-caption"
                      >
                        Details
                      </v-btn>
                    </div>

                    <div class="text-caption text-grey-darken-1 mb-4">
                      For orders from $720 - Not applicable for Gift Cards -
                      Valid from Dec 20, 2022 - Dec 27, 2022
                    </div>

                    <div class="d-flex ga-2">
                      <v-text-field
                        placeholder="Enter promotion code"
                        variant="outlined"
                        density="compact"
                        hide-details
                        class="flex-grow-1"
                        bg-color="white"
                        prepend-inner-icon="mdi-ticket-outline"
                        rounded="lg"
                        color="waterblue"
                      ></v-text-field>

                      <v-btn
                        color="waterblue"
                        variant="elevated"
                        class="text-white font-weight-bold"
                        >Apply</v-btn
                      >
                    </div>
                  </v-sheet>

                  <!-- Free Shipping -->
                  <v-sheet class="pa-4 rounded-lg bg-lightgreen text-white">
                    <div class="d-flex justify-space-between align-center mb-3">
                      <div class="font-weight-bold">FREE SHIPPING CODE</div>
                      <v-btn
                        variant="text"
                        color="white"
                        size="small"
                        density="compact"
                        class="text-caption"
                      >
                        Details
                      </v-btn>
                    </div>

                    <div class="text-caption mb-4 opacity-90">
                      For orders from $500 - Not applicable for Gift Cards -
                      Valid from Dec 21, 2022
                    </div>

                    <v-progress-linear
                      model-value="80"
                      color="white"
                      height="8"
                      rounded
                      class="mb-3"
                      bg-color="rgba(255,255,255,0.3)"
                    ></v-progress-linear>

                    <div class="d-flex align-center justify-space-between mb-3">
                      <span class="text-caption opacity-90">$0</span>
                      <span class="text-caption font-weight-bold">$500</span>
                    </div>

                    <div
                      class="text-caption font-weight-medium mb-4 d-flex align-center"
                    >
                      <v-icon
                        icon="mdi-check-circle"
                        size="small"
                        class="mr-2"
                      ></v-icon>
                      Conditions met
                    </div>

                    <v-btn
                      color="white"
                      variant="elevated"
                      block
                      class="text-darkgreen font-weight-bold"
                    >
                      Apply
                    </v-btn>

                    <div
                      class="d-flex align-center mt-3 text-caption opacity-90"
                    >
                      <v-icon
                        icon="mdi-information-outline"
                        size="small"
                        class="mr-2"
                      ></v-icon>
                      Multiple codes can be applied simultaneously
                    </div>
                  </v-sheet>
                </div>
              </v-expand-transition>
            </v-card-text>
          </v-card>

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
              <span class="font-weight-bold">PAYMENT</span>
            </v-card-title>

            <v-card-text class="pa-6">
              <v-list density="compact" class="pa-0 bg-transparent">
                <v-list-item class="px-0">
                  <template v-slot:prepend>
                    <span class="text-body-1 text-customblack">Subtotal</span>
                  </template>
                  <template v-slot:append>
                    <span class="text-body-1 font-weight-bold text-customblack"
                      >$120.00</span
                    >
                  </template>
                </v-list-item>

                <v-list-item class="px-0">
                  <template v-slot:prepend>
                    <span class="text-body-1 text-customblack">Discount</span>
                  </template>
                  <template v-slot:append>
                    <span class="text-body-1 text-error font-weight-bold"
                      >-$0.00</span
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
                      >$120.00</span
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
              >
                CHECKOUT
              </v-btn>

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
      selectAll: true,
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
  },
  watch: {
    selectAll(val) {
      if (val) {
        this.selectedItems = this.cartItems.map((item) => item.bookId._id);
      } else {
        this.selectedItems = [];
      }
    },
    selectedItems(val) {
      this.selectAll =
        val.length === this.cartItems.length && this.cartItems.length > 0;
    },
  },
  methods: {
    ...mapActions("cart", ["fetchCart", "removeCartItem"]),
    increaseQuantity(item) {
      item.quantity++;
    },
    decreaseQuantity(item) {
      if (item.quantity > 1) {
        item.quantity--;
      }
    },
    confirmDeleteItem(bookId) {
      console.log("Deleting item with bookId:", bookId);
      this.itemToDelete = bookId;
      this.confirmDelete = true;
    },
    async deleteItem() {
      try {
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
