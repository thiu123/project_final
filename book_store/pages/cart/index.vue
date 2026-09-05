<template>
  <div
    class="min-h-screen bg-gradient-to-br from-white to-blue-50 dark:from-background dark:to-background"
  >
    <div class="container mx-auto p-4 md:p-6">
      <div class="grid grid-cols-12 gap-4">
        <!-- Cart Items Section -->
        <div class="col-span-12 lg:col-span-8">
          <UiCard class="mb-4 overflow-hidden rounded-xl border-0 shadow-md">
            <div class="flex items-center bg-waterblue px-4 py-4 text-white">
              <ShoppingCart class="mr-3 h-7 w-7" />
              <span class="text-2xl font-bold"
                >Cart ({{ cartItems.length }} items)</span
              >
            </div>

            <UiSeparator />

            <div class="p-0">
              <!-- Desktop Header -->
              <div
                class="hidden grid-cols-12 items-center p-4 text-base font-medium md:grid"
              >
                <div class="col-span-6 flex items-center">
                  <UiCheckbox
                    v-model="selectAll"
                    :label="`Select all ${cartItems.length} items`"
                  />
                </div>
                <div class="col-span-2 text-center">Quantity</div>
                <div class="col-span-2 text-right">Price</div>
                <div class="col-span-2 flex justify-end">
                  <UiButton
                    v-if="selectAll && selectedItems.length > 0"
                    variant="ghost"
                    size="sm"
                    class="font-bold text-destructive hover:text-destructive"
                    @click="deleteSelectedItems"
                  >
                    <Trash2 class="mr-1 h-4 w-4" />
                    Delete All
                  </UiButton>
                  <span v-else>Delete</span>
                </div>
              </div>

              <!-- Mobile Header -->
              <div
                class="flex items-center justify-between bg-muted p-4 md:hidden"
              >
                <UiCheckbox
                  v-model="selectAll"
                  :label="`Select all ${cartItems.length} items`"
                />
                <UiButton
                  variant="ghost"
                  size="sm"
                  class="text-waterblue hover:text-waterblue"
                  :disabled="selectedItems.length === 0"
                  @click="deleteSelectedItems"
                >
                  <Trash2 class="mr-1 h-4 w-4" />
                  Delete Selected
                </UiButton>
              </div>

              <!-- Empty Cart -->
              <div v-if="isLoaded && !cartItems.length" class="p-8 text-center">
                <ShoppingCart
                  class="mx-auto mb-4 h-20 w-20 text-muted-foreground/40"
                />
                <h3 class="mb-3 text-2xl font-bold text-foreground">
                  Your cart is empty
                </h3>
                <p
                  class="mx-auto mb-6 max-w-[400px] text-base text-muted-foreground"
                >
                  Add items to cart to continue shopping
                </p>
                <NuxtLink to="/" class="inline-block">
                  <UiButton
                    size="lg"
                    class="rounded-lg bg-waterblue font-bold text-white shadow hover:bg-waterblue/90"
                  >
                    <ShoppingBag class="mr-2 h-5 w-5" />
                    Continue Shopping
                  </UiButton>
                </NuxtLink>
              </div>

              <!-- Cart Items -->
              <template v-if="cartItems.length > 0">
                <div
                  v-for="(item, index) in cartItems"
                  :key="index"
                  class="mx-3 mb-3 bg-transparent transition-all duration-300"
                >
                  <div class="grid grid-cols-12 items-center gap-2 p-4">
                    <!-- Checkbox and Image -->
                    <div class="col-span-12 flex items-center sm:col-span-6">
                      <UiCheckbox
                        class="mr-3 hidden md:flex"
                        :model-value="isItemSelected(item)"
                        @update:model-value="
                          (checked) => toggleItemSelected(item, checked === true)
                        "
                      />
                      <div class="mr-4 flex min-w-[80px] items-center">
                        <img
                          :src="item?.bookId?.cover_url"
                          :alt="item?.bookId?.title || 'Book cover'"
                          class="h-[120px] w-[80px] bg-muted object-cover shadow"
                        />
                      </div>

                      <div class="min-w-0 grow">
                        <div
                          class="mb-2 truncate text-base font-bold text-foreground"
                        >
                          {{ item?.bookId?.title || "Product name" }}
                        </div>
                        <div
                          class="mb-2 text-sm text-muted-foreground md:hidden"
                        >
                          by {{ (item?.bookId as any)?.author || "Unknown Author" }}
                        </div>
                        <div
                          class="mb-2 text-lg font-bold text-waterblue md:hidden"
                        >
                          ${{ getItemPrice(item) }}
                        </div>
                        <div class="mb-2 flex flex-wrap gap-2">
                          <UiBadge
                            :variant="
                              item.productType === 'ebook'
                                ? 'success'
                                : 'default'
                            "
                            class="text-xs"
                          >
                            {{
                              item.productType === "ebook"
                                ? "📱 Ebook"
                                : "📚 Hardbook"
                            }}
                          </UiBadge>

                          <!-- Stock display for hardbooks -->
                          <UiBadge
                            v-if="item.productType === 'hardbook'"
                            :variant="getStockColor(item.bookId?.stock ?? 0)"
                            class="text-xs"
                          >
                            {{ getStockText(item.bookId?.stock ?? 0) }}
                          </UiBadge>
                        </div>
                        <UiBadge
                          v-if="
                            item?.bookId?.subjects &&
                            item?.bookId?.subjects.length > 0
                          "
                          variant="outline"
                          class="border-waterblue/50 text-xs capitalize text-waterblue"
                        >
                          {{ item?.bookId?.subjects[0] }}
                        </UiBadge>
                      </div>
                    </div>

                    <!-- Quantity -->
                    <div
                      class="col-span-4 flex items-center justify-center sm:col-span-2"
                    >
                      <div
                        class="flex min-w-[80px] items-center justify-center rounded-lg bg-waterblue/5 p-1"
                      >
                        <button
                          type="button"
                          class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-200 hover:bg-muted/70 disabled:pointer-events-none disabled:opacity-50"
                          :disabled="item.quantity <= 1"
                          aria-label="Decrease quantity"
                          @click="decreaseQuantity(item)"
                        >
                          <Minus class="h-3.5 w-3.5" />
                        </button>
                        <input
                          v-model="item.quantity"
                          type="number"
                          class="mx-1 h-8 w-[45px] min-w-[35px] rounded-lg border border-input bg-background px-1 text-center text-sm text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-waterblue/15 text-waterblue transition-all duration-200 hover:bg-waterblue/25 disabled:pointer-events-none disabled:opacity-50"
                          :disabled="
                            item.productType === 'hardbook' &&
                            item.quantity >= (item.bookId?.stock ?? 0)
                          "
                          aria-label="Increase quantity"
                          @click="increaseQuantity(item)"
                        >
                          <Plus class="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <!-- Price -->
                    <div class="hidden text-right md:col-span-2 md:block">
                      <div class="text-right">
                        <div class="text-base font-bold text-waterblue">
                          ${{ getItemPrice(item) }}
                        </div>
                        <div
                          v-if="item.productType === 'ebook'"
                          class="text-xs text-muted-foreground line-through"
                        >
                          ${{ item?.bookId?.price || "0" }}
                        </div>
                      </div>
                    </div>

                    <!-- Delete Button -->
                    <div class="col-span-4 text-right sm:col-span-2">
                      <UiButton
                        variant="ghost"
                        size="iconSm"
                        class="text-destructive transition-all duration-200 hover:text-destructive"
                        aria-label="Remove item"
                        @click="confirmDeleteItem(item.bookId?._id)"
                      >
                        <Trash2 class="h-5 w-5" />
                      </UiButton>
                    </div>
                  </div>
                  <UiSeparator v-if="index < cartItems.length - 1" />
                </div>
              </template>

              <UiSeparator />
            </div>
          </UiCard>
        </div>

        <!-- Order Summary Section -->
        <div class="col-span-12 lg:col-span-4">
          <UiCard
            class="overflow-hidden rounded-xl border-0 shadow-md lg:sticky lg:top-6"
          >
            <div class="flex items-center bg-waterblue px-4 py-4 text-white">
              <Receipt class="mr-2 h-6 w-6" />
              <span class="font-bold">PAYMENT SUMMARY</span>
            </div>

            <div class="p-6">
              <UiAlert
                v-if="selectedItems.length === 0"
                variant="info"
                class="mb-4"
              >
                No items selected
              </UiAlert>

              <div v-else class="mb-4">
                <div class="mb-2 flex items-center justify-between">
                  <span class="text-xs text-muted-foreground"
                    >Selected items</span
                  >
                  <span class="text-xs font-bold text-waterblue">
                    {{ selectedItems.length }} / {{ cartItems.length }}
                  </span>
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between py-1.5">
                  <span class="text-base text-foreground">Subtotal</span>
                  <span class="text-base font-bold text-foreground"
                    >${{ totalPrice.toFixed(2) }}</span
                  >
                </div>

                <div class="flex items-center justify-between py-1.5">
                  <span class="text-base text-foreground">Shipping fee</span>
                  <span class="text-base font-bold text-foreground">$0.00</span>
                </div>

                <UiSeparator class="my-3" />

                <div class="flex items-center justify-between py-1.5">
                  <span class="text-lg font-bold text-foreground">Total</span>
                  <span class="text-lg font-bold text-waterblue"
                    >${{ totalPrice.toFixed(2) }}</span
                  >
                </div>

                <div class="py-1.5">
                  <span class="text-xs text-muted-foreground"
                    >(VAT included)</span
                  >
                </div>
              </div>

              <UiButton
                size="lg"
                block
                class="mt-6 rounded-lg bg-waterblue text-lg font-bold text-white shadow hover:bg-waterblue/90"
                :disabled="selectedItems.length === 0"
                @click="handleCheckout"
              >
                <CreditCard class="mr-2 h-5 w-5" />
                CHECKOUT ({{ selectedItems.length }})
              </UiButton>

              <UiAlert
                v-if="selectedItems.length === 0"
                variant="warning"
                class="mt-3 text-xs"
              >
                Please select at least one item to checkout
              </UiAlert>

              <div class="mt-4 flex items-center justify-center gap-2">
                <ShieldCheck class="h-4 w-4 text-lightgreen" />
                <span class="text-xs text-muted-foreground"
                  >Secure payment</span
                >
              </div>
            </div>
          </UiCard>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <UiDialog v-model:open="confirmDelete">
      <UiDialogContent
        class="sm:max-w-sm"
        @pointer-down-outside.prevent
        @escape-key-down.prevent
      >
        <UiDialogHeader>
          <UiDialogTitle>Delete item</UiDialogTitle>
        </UiDialogHeader>

        <p class="text-sm text-foreground">
          Are you sure you want to remove this item from your cart?
        </p>

        <UiDialogFooter>
          <UiButton
            variant="ghost"
            class="rounded-lg text-muted-foreground"
            @click="confirmDelete = false"
          >
            Cancel
          </UiButton>
          <UiButton
            variant="destructive"
            class="rounded-lg font-bold"
            @click="deleteItem"
          >
            Delete
          </UiButton>
        </UiDialogFooter>
      </UiDialogContent>
    </UiDialog>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useCartStore } from "@/stores/cart";
import {
  CreditCard,
  Minus,
  Plus,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Trash2,
} from "lucide-vue-next";
import type { CartItem } from "@/types";

const cartStore = useCartStore();
const { cart } = storeToRefs(cartStore);
const router = useRouter();

const selectAll = ref(false);
const selectedItems = ref<string[]>([]);
const confirmDelete = ref(false);
const itemToDelete = ref<string | null>(null);
const isLoaded = ref(false);
const loading = ref(false);

const cartItems = computed<CartItem[]>(() => cart.value?.items || []);

// Get only selected items
const selectedCartItems = computed(() =>
  cartItems.value.filter((item) =>
    selectedItems.value.includes(item.bookId?._id || "")
  )
);

// Calculate total only for selected items
const totalPrice = computed(() =>
  selectedCartItems.value.reduce((total, item) => {
    const price =
      item.productType === "ebook"
        ? (item.bookId?.price || 0) * 0.7
        : item.bookId?.price || 0;
    return total + price * item.quantity;
  }, 0)
);

watch(selectAll, (val) => {
  if (val) {
    console.log("Selecting all items", val);
    selectedItems.value = cartItems.value.map(
      (item) => item.bookId?._id || ""
    );
  } else {
    if (selectedItems.value.length === cartItems.value.length) {
      selectedItems.value = [];
    }
  }
});

watch(
  selectedItems,
  (val) => {
    console.log("Selected items changed:", val);
    // Update selectAll checkbox based on selection
    selectAll.value =
      val.length === cartItems.value.length && cartItems.value.length > 0;
  },
  { deep: true }
);

watch(
  cartItems,
  (newItems, oldItems) => {
    // When cart items change (e.g., item deleted), update selected items
    if (newItems.length !== oldItems?.length) {
      const validBookIds = newItems.map((item) => item.bookId?._id);
      selectedItems.value = selectedItems.value.filter((id) =>
        validBookIds.includes(id)
      );
    }
  },
  { deep: true }
);

function isItemSelected(item: CartItem) {
  return selectedItems.value.includes(item.bookId?._id || "");
}

function toggleItemSelected(item: CartItem, checked: boolean) {
  const bookId = item.bookId?._id;
  if (!bookId) return;
  if (checked) {
    if (!selectedItems.value.includes(bookId)) {
      selectedItems.value.push(bookId);
    }
  } else {
    selectedItems.value = selectedItems.value.filter((id) => id !== bookId);
  }
}

function handleCheckout() {
  if (selectedItems.value.length === 0) {
    return;
  }

  // Get selected items data
  const selectedItemsData = selectedCartItems.value.map((item) => ({
    bookId: item.bookId?._id,
    title: item.bookId?.title,
    authors: item.bookId?.authors?.[0],
    cover_url: item.bookId?.cover_url,
    price: item.bookId?.price,
    quantity: item.quantity,
    productType: item.productType,
    subjects: item.bookId?.subjects,
    stock: item.bookId?.stock,
  }));

  // Store in localStorage for order page (only on client side)
  if (import.meta.client) {
    localStorage.setItem("checkoutItems", JSON.stringify(selectedItemsData));
  }

  console.log("Checkout with items:", selectedItemsData);

  // Navigate to order page
  router.push("/order");
}

function getItemPrice(item: CartItem) {
  const basePrice = item?.bookId?.price || 0;
  if (item.productType === "ebook") {
    return (basePrice * 0.7).toFixed(2);
  }
  return basePrice.toFixed(2);
}

function getStockColor(stock: number): "success" | "warning" | "destructive" {
  if (stock > 20) return "success";
  if (stock > 0) return "warning";
  return "destructive";
}

function getStockText(stock: number) {
  if (stock > 20) return `${stock} in stock`;
  if (stock > 0) return `Only ${stock} left!`;
  return "Out of stock";
}

function increaseQuantity(item: CartItem) {
  // For hardbooks, check stock limit
  if (item.productType === "hardbook") {
    const maxAllowed = item.bookId?.stock || 0;
    if (item.quantity < maxAllowed) {
      item.quantity++;
    }
  } else {
    // Ebook has no stock limit
    item.quantity++;
  }
}

function decreaseQuantity(item: CartItem) {
  if (item.quantity > 1) {
    item.quantity--;
  }
}

function confirmDeleteItem(bookId?: string) {
  if (!bookId) return;
  itemToDelete.value = bookId;
  confirmDelete.value = true;
}

async function deleteItem() {
  try {
    if (!itemToDelete.value) return;

    await cartStore.removeCartItem(itemToDelete.value);

    // Remove from selected items if it was selected
    const index = selectedItems.value.indexOf(itemToDelete.value);
    if (index > -1) {
      selectedItems.value.splice(index, 1);
    }

    confirmDelete.value = false;
    itemToDelete.value = null;
  } catch (error) {
    console.error("Error deleting item:", error);
  }
}

async function deleteSelectedItems() {
  try {
    if (selectedItems.value.length === 0) {
      return;
    }

    // Create a copy of selected items to delete
    const itemsToDelete = [...selectedItems.value];

    for (const bookId of itemsToDelete) {
      await cartStore.removeCartItem(bookId);
    }

    // Clear selected items after deletion
    selectedItems.value = [];
    selectAll.value = false;
  } catch (error) {
    console.error("Error deleting selected items:", error);
  }
}

onMounted(async () => {
  loading.value = true;
  isLoaded.value = false;

  try {
    await cartStore.fetchCart();

    // Auto-select all items when cart loads
    if (cartItems.value.length > 0) {
      selectedItems.value = cartItems.value.map(
        (item) => item.bookId?._id || ""
      );
      selectAll.value = true;
    }
  } catch (err) {
    console.error("Error fetching cart:", err);
  } finally {
    loading.value = false;
    isLoaded.value = true;
  }
});
</script>
