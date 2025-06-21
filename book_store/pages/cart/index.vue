<template>
  <div>
    <v-container>
      <v-row>
        <!-- Cart Items Section -->
        <v-col cols="12" md="8">
          <v-card class="mb-4" elevation="2" rounded="lg">
            <v-card-title
              class="d-flex align-center py-4 px-4 bg-primary-lighten-5"
            >
              <v-icon
                icon="mdi-cart-outline"
                color="primary"
                class="mr-2"
                size="large"
              ></v-icon>
              <span class="text-h5 font-weight-bold"
                >Cart {{ cartItems.length }} items</span
              >
            </v-card-title>

            <v-divider></v-divider>

            <v-card-text class="pa-0">
              <v-row
                class="ma-0 pa-4 text-subtitle-1 font-weight-medium d-none d-sm-flex"
              >
                <v-col cols="5" class="d-flex align-center">
                  <v-checkbox
                    v-model="selectAll"
                    :label="`Select all ${cartItems.length} items`"
                    hide-details
                    density="compact"
                    color="primary"
                  ></v-checkbox>
                </v-col>
                <v-col cols="2" class="text-center">Quantity</v-col>
                <v-col cols="3" class="text-end">Price</v-col>
                <v-col cols="2">Delete</v-col>
              </v-row>

              <v-row
                v-if="loading && !isLoaded"
                align="center"
                justify="center"
                class="my-10"
              >
                <v-col cols="auto">
                  <v-progress-circular indeterminate color="primary" />
                </v-col>
              </v-row>
              <template>
                <div>
                  <!-- Loading Spinner -->
                  <v-row
                    v-if="loading && !isLoaded"
                    align="center"
                    justify="center"
                    class="my-10"
                  >
                    <v-col cols="auto">
                      <v-progress-circular indeterminate color="primary" />
                    </v-col>
                  </v-row>

                  <template v-else-if="isLoaded">
                    <!-- Empty Cart State -->
                    <v-card
                      v-if="!cartItems.length"
                      class="pa-8 text-center"
                      flat
                    >
                      <v-img
                        src="https://cdn.vuetifyjs.com/images/cards/cooking.png"
                        width="100"
                        height="100"
                        class="mx-auto mb-4"
                        contain
                      />
                      <h3 class="text-h6 mb-2">Your cart is empty</h3>
                      <p class="text-body-2 text-grey-darken-1 mb-4">
                        Add items to cart to continue shopping
                      </p>
                      <v-btn
                        color="primary"
                        prepend-icon="mdi-shopping"
                        variant="elevated"
                        to="/"
                      >
                        Continue Shopping
                      </v-btn>
                    </v-card>

                    <!-- Cart Items -->
                    <v-slide-y-transition group v-else>
                      <v-card
                        v-for="(item, index) in cartItems"
                        :key="index"
                        class="mb-2 transition-fast-in-fast-out"
                        elevation="0"
                        rounded="0"
                      >
                        <v-row class="ma-0 pa-4 align-center">
                          <!-- Checkbox and Image -->
                          <v-col
                            cols="12"
                            sm="5"
                            md="4"
                            lg="5"
                            class="d-flex align-center"
                          >
                            <v-checkbox
                              v-model="selectedItems"
                              :value="item.bookId._id"
                              hide-details
                              density="compact"
                              color="primary"
                              class="mr-2 d-none d-sm-flex"
                            />
                            <div class="book-image-container mr-4">
                              <v-img
                                :src="item?.bookId?.cover_url"
                                width="80"
                                height="120"
                                class="rounded-lg"
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
                                      color="primary"
                                    />
                                  </v-row>
                                </template>
                              </v-img>
                            </div>

                            <div class="flex-grow-1 min-width-0">
                              <div
                                class="text-subtitle-1 font-weight-medium mb-1 text-truncate"
                              >
                                {{ item?.bookId?.title || "Product name" }}
                              </div>
                              <div
                                class="text-body-2 text-primary-darken-1 mb-2 d-sm-none font-weight-bold"
                              >
                                {{ item?.bookId?.price || "0" }} $
                              </div>
                              <v-chip
                                size="small"
                                color="primary"
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

                          <!-- Quantity -->
                          <v-col
                            cols="7"
                            sm="2"
                            class="d-flex justify-sm-center align-center"
                          >
                            <v-btn
                              icon="mdi-minus"
                              variant="tonal"
                              size="x-small"
                              color="grey-darken-1"
                              density="comfortable"
                              @click="decreaseQuantity(item)"
                              :disabled="item.quantity <= 1"
                            />
                            <v-text-field
                              v-model="item.quantity"
                              type="number"
                              variant="outlined"
                              density="compact"
                              hide-details
                              class="mx-2"
                              :hide-spin-buttons="true"
                              style="min-width: 45px; max-width: 60px"
                            />
                            <v-btn
                              icon="mdi-plus"
                              variant="tonal"
                              size="x-small"
                              color="primary"
                              density="comfortable"
                              @click="increaseQuantity(item)"
                            />
                          </v-col>

                          <!-- Price -->
                          <v-col
                            cols="3"
                            sm="3"
                            class="text-end d-none d-sm-block"
                          >
                            <div
                              class="text-subtitle-1 font-weight-bold text-primary-darken-1"
                            >
                              {{ item?.bookId?.price || "0" }} $
                            </div>
                          </v-col>

                          <!-- Delete Button -->
                          <v-col cols="5" sm="2" class="text-end text-sm-start">
                            <v-btn
                              variant="flat"
                              :ripple="false"
                              icon
                              size="small"
                              @click="confirmDeleteItem(item.bookId._id)"
                            >
                              <v-icon color="red">mdi-trash-can-outline</v-icon>
                            </v-btn>
                          </v-col>
                        </v-row>
                        <v-divider v-if="index < cartItems.length - 1" />
                      </v-card>
                    </v-slide-y-transition>
                  </template>
                </div>
              </template>

              <v-divider></v-divider>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Order Summary Section -->
        <v-col cols="12" md="4">
          <!-- Promotions Card -->
          <v-card class="mb-4" elevation="2" rounded="lg">
            <v-card-title
              class="py-3 px-4 bg-primary-lighten-5 d-flex align-center"
            >
              <v-icon
                icon="mdi-ticket-percent"
                color="primary"
                class="mr-2"
              ></v-icon>
              <span class="font-weight-bold">PROMOTIONS</span>
              <v-spacer></v-spacer>
              <v-btn
                variant="text"
                color="primary"
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
                  <v-sheet class="pa-3 rounded-lg bg-primary-lighten-5 mb-4">
                    <div class="d-flex justify-space-between align-center mb-2">
                      <div class="font-weight-bold">20% OFF CODE</div>
                      <v-btn
                        variant="text"
                        color="primary"
                        size="small"
                        density="compact"
                        class="text-caption"
                      >
                        Details
                      </v-btn>
                    </div>

                    <div class="text-caption text-grey-darken-1 mb-3">
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
                      ></v-text-field>

                      <v-btn color="primary" variant="elevated">Apply</v-btn>
                    </div>
                  </v-sheet>

                  <!-- Free Shipping -->
                  <v-sheet class="pa-3 rounded-lg bg-success-lighten-5">
                    <div class="d-flex justify-space-between align-center mb-2">
                      <div class="font-weight-bold">FREE SHIPPING CODE</div>
                      <v-btn
                        variant="text"
                        color="success"
                        size="small"
                        density="compact"
                        class="text-caption"
                      >
                        Details
                      </v-btn>
                    </div>

                    <div class="text-caption text-grey-darken-1 mb-3">
                      For orders from $500 - Not applicable for Gift Cards -
                      Valid from Dec 21, 2022
                    </div>

                    <v-progress-linear
                      model-value="80"
                      color="success"
                      height="8"
                      rounded
                      class="mb-2"
                      bg-color="success-lighten-3"
                    ></v-progress-linear>

                    <div class="d-flex align-center justify-space-between mb-3">
                      <span class="text-caption text-grey-darken-1">$0</span>
                      <span class="text-caption text-success font-weight-bold"
                        >$500</span
                      >
                    </div>

                    <div
                      class="text-caption text-success font-weight-medium mb-3 d-flex align-center"
                    >
                      <v-icon
                        icon="mdi-check-circle"
                        size="small"
                        class="mr-1"
                      ></v-icon>
                      Conditions met
                    </div>

                    <v-btn color="success" variant="elevated" block>
                      Apply
                    </v-btn>

                    <div
                      class="d-flex align-center mt-3 text-caption text-grey-darken-1"
                    >
                      <v-icon
                        icon="mdi-information-outline"
                        size="small"
                        class="mr-1"
                      ></v-icon>
                      Multiple codes can be applied simultaneously
                    </div>
                  </v-sheet>
                </div>
              </v-expand-transition>
            </v-card-text>
          </v-card>

          <!-- Order Summary Card -->
          <v-card elevation="2" rounded="lg" class="sticky-card">
            <v-card-title
              class="py-3 px-4 bg-primary-lighten-5 d-flex align-center"
            >
              <v-icon icon="mdi-receipt" color="primary" class="mr-2"></v-icon>
              <span class="font-weight-bold">PAYMENT</span>
            </v-card-title>

            <v-card-text class="pa-4">
              <v-list density="compact" class="pa-0 bg-transparent">
                <v-list-item>
                  <template v-slot:prepend>
                    <span class="text-body-1">Subtotal</span>
                  </template>
                  <template v-slot:append>
                    <span class="text-body-1">$120.00</span>
                  </template>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <span class="text-body-1">Discount</span>
                  </template>
                  <template v-slot:append>
                    <span class="text-body-1 text-error">-$0.00</span>
                  </template>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <span class="text-body-1">Shipping fee</span>
                  </template>
                  <template v-slot:append>
                    <span class="text-body-1">$0.00</span>
                  </template>
                </v-list-item>

                <v-divider class="my-2"></v-divider>

                <v-list-item>
                  <template v-slot:prepend>
                    <span class="text-subtitle-1 font-weight-bold">Total</span>
                  </template>
                  <template v-slot:append>
                    <span class="text-subtitle-1 font-weight-bold"
                      >$120.00</span
                    >
                  </template>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <span class="text-caption text-grey-darken-1"
                      >(VAT included)</span
                    >
                  </template>
                </v-list-item>
              </v-list>

              <v-btn
                color="primary"
                size="large"
                block
                elevation="2"
                class="text-h6 font-weight-bold mt-4"
                prepend-icon="mdi-cash-register"
              >
                CHECKOUT
              </v-btn>

              <div class="d-flex align-center justify-center gap-2 mt-4">
                <v-icon
                  icon="mdi-shield-check"
                  color="success"
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
    <v-dialog v-model="confirmDelete" max-width="400">
      <v-card>
        <v-card-title class="text-h5">Delete item</v-card-title>
        <v-card-text>
          Are you sure you want to remove this item from your cart?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="confirmDelete = false"
          >
            Cancel
          </v-btn>
          <v-btn color="error" variant="elevated" @click="deleteItem">
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
    // async deleteSelectedItems() {
    //   try {
    //     for (const bookId of this.selectedItems) {
    //       await this.removeCartItem(bookId);
    //     }
    //     this.selectedItems = [];
    //   } catch (error) {
    //     console.error("Error deleting selected items:", error);
    //   }
    // },
  },
  async mounted() {
    this.loading = true;
    this.isLoaded = false;

    try {
      await this.fetchCart();
      if (this.cartItems.length > 0) {
        this.selectedItems = this.cartItems.map((item) => item.bookId._id);
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
<style>
.sticky-card {
  position: sticky;
  top: 24px;
}

.book-image-container {
  min-width: 100px;
  display: flex;
  align-items: center;
}

@media (max-width: 960px) {
  .sticky-card {
    position: static;
  }
}
</style>
