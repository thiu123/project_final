<template>
  <div
    class="min-h-screen bg-gradient-to-br from-white to-blue-50 dark:from-background dark:to-background"
  >
    <div class="container mx-auto p-4 md:p-6">
      <div class="grid grid-cols-12 gap-4">
        <!-- Items -->
        <div class="col-span-12 lg:col-span-8">
          <UiCard class="mb-4 overflow-hidden rounded-xl border-0 shadow-md">
            <div class="flex items-center bg-waterblue px-4 py-4 text-white">
              <ShoppingCart class="mr-3 h-7 w-7" />
              <span class="text-2xl font-bold">
                Cart ({{ cartItems.length }} items)
              </span>
            </div>

            <UiSeparator />

            <!-- Desktop header -->
            <div
              class="hidden grid-cols-12 items-center p-4 text-base font-medium md:grid"
            >
              <div class="col-span-6 flex items-center">
                <UiCheckbox
                  :model-value="allSelected"
                  :label="`Select all ${cartItems.length} items`"
                  @update:model-value="setAllSelected($event === true)"
                />
              </div>
              <div class="col-span-2 text-center">Quantity</div>
              <div class="col-span-2 text-right">Price</div>
              <div class="col-span-2 flex justify-end">
                <UiButton
                  v-if="selectedIds.length"
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

            <!-- Mobile header -->
            <div class="flex items-center justify-between bg-muted p-4 md:hidden">
              <UiCheckbox
                :model-value="allSelected"
                :label="`Select all ${cartItems.length} items`"
                @update:model-value="setAllSelected($event === true)"
              />
              <UiButton
                variant="ghost"
                size="sm"
                class="text-waterblue hover:text-waterblue"
                :disabled="!selectedIds.length"
                @click="deleteSelectedItems"
              >
                <Trash2 class="mr-1 h-4 w-4" />
                Delete Selected
              </UiButton>
            </div>

            <!-- Empty -->
            <div v-if="isLoaded && !cartItems.length" class="p-8 text-center">
              <ShoppingCart class="mx-auto mb-4 h-20 w-20 text-muted-foreground/40" />
              <h3 class="mb-3 text-2xl font-bold text-foreground">
                Your cart is empty
              </h3>
              <p class="mx-auto mb-6 max-w-[400px] text-base text-muted-foreground">
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

            <!-- Rows -->
            <div
              v-for="(item, index) in cartItems"
              :key="item.bookId?._id ?? index"
              class="mx-3 mb-3 bg-transparent"
            >
              <CartItemRow
                :item="item"
                :selected="isSelected(item)"
                @update:selected="setSelected(item, $event)"
                @update:quantity="updateQuantity(item, $event)"
                @remove="confirmDeleteItem(item.bookId?._id)"
              />
              <UiSeparator v-if="index < cartItems.length - 1" />
            </div>

            <UiSeparator />
          </UiCard>
        </div>

        <!-- Summary -->
        <div class="col-span-12 lg:col-span-4">
          <UiCard
            class="overflow-hidden rounded-xl border-0 shadow-md lg:sticky lg:top-6"
          >
            <div class="flex items-center bg-waterblue px-4 py-4 text-white">
              <Receipt class="mr-2 h-6 w-6" />
              <span class="font-bold">PAYMENT SUMMARY</span>
            </div>

            <div class="p-6">
              <UiAlert v-if="!selectedIds.length" variant="info" class="mb-4">
                No items selected
              </UiAlert>

              <div v-else class="mb-4 flex items-center justify-between">
                <span class="text-xs text-muted-foreground">Selected items</span>
                <span class="text-xs font-bold text-waterblue">
                  {{ selectedIds.length }} / {{ cartItems.length }}
                </span>
              </div>

              <div class="flex items-center justify-between py-1.5">
                <span class="text-base text-foreground">Subtotal</span>
                <span class="text-base font-bold text-foreground">
                  {{ formatUsd(totalPrice) }}
                </span>
              </div>

              <div class="flex items-center justify-between py-1.5">
                <span class="text-base text-foreground">Shipping fee</span>
                <span class="text-base font-bold text-foreground">$0.00</span>
              </div>

              <UiSeparator class="my-3" />

              <div class="flex items-center justify-between py-1.5">
                <span class="text-lg font-bold text-foreground">Total</span>
                <span class="text-lg font-bold text-waterblue">
                  {{ formatUsd(totalPrice) }}
                </span>
              </div>

              <div class="py-1.5">
                <span class="text-xs text-muted-foreground">(VAT included)</span>
              </div>

              <UiButton
                size="lg"
                block
                class="mt-6 rounded-lg bg-waterblue text-lg font-bold text-white shadow hover:bg-waterblue/90"
                :disabled="!selectedIds.length"
                @click="handleCheckout"
              >
                <CreditCard class="mr-2 h-5 w-5" />
                CHECKOUT ({{ selectedIds.length }})
              </UiButton>

              <UiAlert
                v-if="!selectedIds.length"
                variant="warning"
                class="mt-3 text-xs"
              >
                Please select at least one item to checkout
              </UiAlert>

              <div class="mt-4 flex items-center justify-center gap-2">
                <ShieldCheck class="h-4 w-4 text-lightgreen" />
                <span class="text-xs text-muted-foreground">Secure payment</span>
              </div>
            </div>
          </UiCard>
        </div>
      </div>
    </div>

    <!-- Delete confirmation -->
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
import {
  CreditCard,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Trash2,
} from "lucide-vue-next";
import { useCartStore } from "@/stores/cart";
import { formatUsd, unitPrice } from "@/utils/pricing";
import { CHECKOUT_ITEMS_KEY, type CartItem, type CheckoutItem } from "@/types";

const router = useRouter();
const cartStore = useCartStore();
const { items: cartItems } = storeToRefs(cartStore);

const selectedIds = ref<string[]>([]);
const confirmDelete = ref(false);
const itemToDelete = ref<string | null>(null);
const isLoaded = ref(false);

const selectedCartItems = computed(() =>
  cartItems.value.filter((item) => isSelected(item))
);

const totalPrice = computed(() =>
  selectedCartItems.value.reduce(
    (sum, item) =>
      sum + unitPrice(item.bookId?.price ?? 0, item.productType) * item.quantity,
    0
  )
);

const allSelected = computed(
  () =>
    cartItems.value.length > 0 &&
    selectedIds.value.length === cartItems.value.length
);

// Items removed elsewhere (or by a failed update refetch) must not linger in
// the selection, or the totals count books that are no longer in the cart.
watch(cartItems, (items) => {
  const present = new Set(items.map((item) => item.bookId?._id));
  selectedIds.value = selectedIds.value.filter((id) => present.has(id));
});

onMounted(async () => {
  try {
    await cartStore.fetchCart();
    // A freshly loaded cart starts fully selected — the common case is
    // checking out everything.
    setAllSelected(true);
  } catch (error) {
    console.error("Error fetching cart:", error);
  } finally {
    isLoaded.value = true;
  }
});

function isSelected(item: CartItem) {
  const id = item.bookId?._id;
  return !!id && selectedIds.value.includes(id);
}

function setSelected(item: CartItem, selected: boolean) {
  const id = item.bookId?._id;
  if (!id) return;
  selectedIds.value = selected
    ? [...new Set([...selectedIds.value, id])]
    : selectedIds.value.filter((existing) => existing !== id);
}

function setAllSelected(selected: boolean) {
  selectedIds.value = selected
    ? cartItems.value.flatMap((item) => item.bookId?._id ?? [])
    : [];
}

async function updateQuantity(item: CartItem, quantity: number) {
  const id = item.bookId?._id;
  if (!id) return;
  await cartStore.updateCartItem(id, quantity);
}

function handleCheckout() {
  if (!selectedIds.value.length) return;

  const payload: CheckoutItem[] = selectedCartItems.value.map((item) => ({
    bookId: item.bookId!._id,
    title: item.bookId?.title ?? "",
    authors: item.bookId?.authors?.[0],
    cover_url: item.bookId?.cover_url,
    price: item.bookId?.price ?? 0,
    quantity: item.quantity,
    productType: item.productType,
    subjects: item.bookId?.subjects,
    stock: item.bookId?.stock,
  }));

  localStorage.setItem(CHECKOUT_ITEMS_KEY, JSON.stringify(payload));
  router.push("/order");
}

function confirmDeleteItem(bookId?: string) {
  if (!bookId) return;
  itemToDelete.value = bookId;
  confirmDelete.value = true;
}

async function deleteItem() {
  if (!itemToDelete.value) return;
  try {
    await cartStore.removeCartItem(itemToDelete.value);
  } catch (error) {
    console.error("Error deleting item:", error);
  } finally {
    confirmDelete.value = false;
    itemToDelete.value = null;
  }
}

async function deleteSelectedItems() {
  if (!selectedIds.value.length) return;
  try {
    for (const bookId of [...selectedIds.value]) {
      await cartStore.removeCartItem(bookId);
    }
  } catch (error) {
    console.error("Error deleting selected items:", error);
  }
}
</script>
