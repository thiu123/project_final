<template>
  <div class="container mx-auto max-w-7xl px-4 pt-10 md:pt-16">
    <header class="hero-rise border-b border-border pb-8 md:pb-10">
      <p class="eyebrow">Your cart</p>
      <h1
        class="mt-5 font-serif text-4xl font-normal leading-[1.02] tracking-[-0.025em] md:text-6xl"
      >
        <template v-if="!isLoaded">Your cart</template>
        <template v-else-if="!cartItems.length">
          Nothing <span class="italic">here</span> yet.
        </template>
        <template v-else>
          {{ countHeadline }} <span class="italic">set aside</span>.
        </template>
      </h1>
      <p
        v-if="isLoaded && cartItems.length"
        class="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-muted-foreground"
      >
        Choose the books you want to take to checkout. Prices include VAT and
        delivery is free.
      </p>
    </header>

    <section
      v-if="isLoaded && !cartItems.length"
      class="hero-rise pt-10 md:pt-12"
      style="--rise-delay: 120ms"
    >
      <div class="max-w-[46ch]">
        <p class="text-[15px] leading-relaxed text-muted-foreground">
          Your cart is empty. Browse the shelves and add a hardback or an ebook
          when something catches your eye.
        </p>
        <UiButton as-child variant="ink" size="cta" class="mt-8 shadow-none">
          <NuxtLink to="/">Continue shopping</NuxtLink>
        </UiButton>
      </div>
    </section>

    <div
      v-else
      class="mt-8 grid grid-cols-1 gap-12 md:mt-10 lg:grid-cols-12 lg:gap-16"
    >
      <section class="lg:col-span-8" aria-label="Books in your cart">
        <div
          class="flex items-center justify-between gap-4 border-b border-border pb-4"
        >
          <UiCheckbox
            :model-value="allSelected"
            :class="CHECKBOX_CLASS"
            :disabled="!cartItems.length"
            @update:model-value="setAllSelected($event === true)"
          >
            <span class="text-[12px] font-medium uppercase tracking-[0.14em]">
              Select all
              <span class="tabular-nums text-muted-foreground">
                ({{ cartItems.length }})
              </span>
            </span>
          </UiCheckbox>

          <button
            type="button"
            class="text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            :disabled="!selectedIds.length"
            @click="deleteSelectedItems"
          >
            <span class="ed-link">Remove selected</span>
          </button>
        </div>

        <div
          class="hidden border-b border-border py-3 md:grid md:grid-cols-[minmax(0,1fr)_8rem_6.5rem] md:gap-8 md:pl-[calc(1rem+1.5rem+5rem+1.5rem)]"
          aria-hidden="true"
        >
          <span class="eyebrow">Book</span>
          <span class="eyebrow text-center">Quantity</span>
          <span class="eyebrow text-right">Total</span>
        </div>

        <div v-if="!isLoaded" class="divide-y divide-border">
          <div v-for="i in 3" :key="i" class="flex gap-6 py-8">
            <UiSkeleton class="ml-10 aspect-[2/3] w-16 rounded-none md:w-20" />
            <div class="flex-1 space-y-3 pt-1">
              <UiSkeleton class="h-5 w-2/3 rounded-none" />
              <UiSkeleton class="h-3 w-1/4 rounded-none" />
              <UiSkeleton class="h-3 w-1/3 rounded-none" />
            </div>
          </div>
        </div>

        <div v-else class="divide-y divide-border border-b border-border">
          <CartItemRow
            v-for="(item, index) in cartItems"
            :key="item.bookId?._id ?? index"
            :item="item"
            :selected="isSelected(item)"
            @update:selected="setSelected(item, $event)"
            @update:quantity="updateQuantity(item, $event)"
            @remove="confirmDeleteItem(item.bookId?._id)"
          />
        </div>
      </section>

      <aside class="lg:col-span-4">
        <div class="bg-muted px-6 py-8 md:px-8 lg:sticky lg:top-32">
          <h2 class="font-serif text-2xl font-normal leading-snug">
            Order summary
          </h2>

          <dl class="mt-6 divide-y divide-border border-y border-border text-[15px]">
            <div class="flex items-baseline justify-between gap-4 py-3">
              <dt class="text-muted-foreground">Selected</dt>
              <dd class="tabular-nums">
                {{ selectedIds.length }} of {{ cartItems.length }}
              </dd>
            </div>
            <div class="flex items-baseline justify-between gap-4 py-3">
              <dt class="text-muted-foreground">Subtotal</dt>
              <dd class="tabular-nums">{{ formatUsd(totalPrice) }}</dd>
            </div>
            <div class="flex items-baseline justify-between gap-4 py-3">
              <dt class="text-muted-foreground">Delivery</dt>
              <dd>Free</dd>
            </div>
          </dl>

          <div class="flex items-baseline justify-between gap-4 pt-6">
            <span class="eyebrow">Total</span>
            <span class="font-serif text-4xl leading-none tabular-nums">
              {{ formatUsd(totalPrice) }}
            </span>
          </div>
          <p class="mt-2 text-right text-[12px] text-muted-foreground">VAT included</p>

          <UiButton
            variant="ink"
            size="cta"
            block
            class="mt-8 shadow-none"
            :disabled="!selectedIds.length"
            @click="handleCheckout"
          >
            Checkout
            <span class="tabular-nums opacity-70">({{ selectedIds.length }})</span>
          </UiButton>

          <p
            v-if="isLoaded && cartItems.length && !selectedIds.length"
            class="mt-3 text-center text-[13px] text-muted-foreground"
          >
            Select at least one book to check out.
          </p>

          <div class="mt-6 flex justify-center">
            <NuxtLink
              to="/"
              class="group inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em]"
            >
              <span class="ed-link">Continue shopping</span>
              <ArrowRight
                class="size-4 transition-transform group-hover:translate-x-1"
                :stroke-width="1.5"
              />
            </NuxtLink>
          </div>

          <p
            class="mt-8 flex items-center gap-2 border-t border-border pt-5 text-[12px] text-muted-foreground"
          >
            <Lock class="size-3.5 shrink-0" :stroke-width="1.5" />
            Secure payment with VNPay, MoMo or cash on delivery
          </p>
        </div>
      </aside>
    </div>

    <UiDialog v-model:open="confirmDelete">
      <UiDialogContent
        class="rounded-none shadow-none sm:max-w-sm sm:rounded-none"
        @pointer-down-outside.prevent
        @escape-key-down.prevent
      >
        <UiDialogHeader>
          <UiDialogTitle class="font-serif text-2xl font-normal">
            Remove this book?
          </UiDialogTitle>
        </UiDialogHeader>

        <p class="text-[15px] leading-relaxed text-muted-foreground">
          It will be taken out of your cart. You can add it again at any time.
        </p>

        <UiDialogFooter class="gap-2">
          <UiButton variant="ghost" :class="DIALOG_BUTTON_CLASS" @click="confirmDelete = false">
            Cancel
          </UiButton>
          <UiButton variant="ink" :class="DIALOG_BUTTON_CLASS" @click="deleteItem">
            Remove
          </UiButton>
        </UiDialogFooter>
      </UiDialogContent>
    </UiDialog>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ArrowRight, Lock } from "lucide-vue-next";
import { useCartStore } from "@/stores/cart";
import { formatUsd, unitPrice } from "@/utils/pricing";
import { CHECKOUT_ITEMS_KEY, type CartItem, type CheckoutItem } from "@/types";

const CHECKBOX_CLASS =
  "rounded-none border-foreground/50 shadow-none data-[state=checked]:border-foreground data-[state=checked]:bg-foreground data-[state=checked]:text-background";

const DIALOG_BUTTON_CLASS =
  "text-[12px] font-medium uppercase tracking-[0.14em] shadow-none";

const NUMBER_WORDS = [
  "No",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
];

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

const countHeadline = computed(() => {
  const count = cartItems.value.length;
  const word = NUMBER_WORDS[count] ?? String(count);
  return `${word} ${count === 1 ? "book" : "books"},`;
});

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
