<template>
  <main class="min-h-screen bg-muted">
    <div class="mx-auto w-full max-w-[1200px] p-2 md:p-6">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="mb-2 text-2xl font-bold md:text-3xl">Checkout</h1>
        <nav aria-label="Breadcrumb" class="flex items-center gap-1 text-sm">
          <NuxtLink to="/" class="text-foreground hover:underline">Home</NuxtLink>
          <ChevronRight class="h-4 w-4 text-muted-foreground" />
          <NuxtLink to="/cart" class="text-foreground hover:underline">Cart</NuxtLink>
          <ChevronRight class="h-4 w-4 text-muted-foreground" />
          <span class="text-muted-foreground">Checkout</span>
        </nav>
      </div>

      <CheckoutPaymentMethodPicker
        v-model="selectedPayment"
        :has-ebook="hasEbook"
      />

      <!-- Only COD collects an address on site -->
      <CheckoutShippingDetailsForm
        v-if="selectedPayment === 'cod'"
        :shipping="shipping"
      />

      <CheckoutVoucherPanel :subtotal="subtotal" @applied="onVoucherApplied" />

      <CheckoutOrderReview :items="orderItems" />

      <!-- Totals -->
      <UiCard class="mb-4 rounded-xl shadow md:mb-6">
        <div class="p-4 md:p-6">
          <div class="mb-3 flex justify-between text-base">
            <span class="text-muted-foreground">Subtotal</span>
            <span class="font-medium">{{ formatUsd(subtotal) }}</span>
          </div>
          <div v-if="discount > 0" class="mb-3 flex justify-between text-base">
            <span class="text-muted-foreground">Discount</span>
            <span class="font-medium text-success">
              -{{ formatUsd(discount) }}
            </span>
          </div>
          <UiSeparator class="my-4" />
          <div
            class="flex items-center justify-between rounded-lg bg-primary/10 p-4"
          >
            <span class="text-lg font-bold">Total Amount</span>
            <span class="text-3xl font-bold text-primary">
              {{ formatUsd(total) }}
            </span>
          </div>
          <div class="mt-2 text-center text-xs text-muted-foreground">
            (including VAT)
          </div>
        </div>
      </UiCard>

      <!-- Actions -->
      <div class="mb-4 flex flex-col gap-3 sm:flex-row">
        <UiButton
          variant="outline"
          size="lg"
          class="order-2 h-12 grow text-muted-foreground sm:order-1"
          @click="router.push('/cart')"
        >
          <ArrowLeft class="mr-2 h-5 w-5" />
          <span class="hidden sm:inline">Back to Cart</span>
          <span class="sm:hidden">Back</span>
        </UiButton>
        <UiButton
          size="lg"
          class="order-1 h-12 grow sm:order-2"
          :disabled="isProcessing || !orderItems.length"
          :loading="isProcessing"
          @click="handleConfirmPayment"
        >
          <span class="hidden font-bold sm:inline">
            {{ isProcessing ? "PROCESSING..." : "CONFIRM PAYMENT" }}
          </span>
          <span class="font-bold sm:hidden">
            {{ isProcessing ? "PROCESSING..." : "CONFIRM" }}
          </span>
          <Lock class="ml-2 h-5 w-5" />
        </UiButton>
      </div>

      <UiAlert
        v-if="checkoutError"
        variant="error"
        class="mb-4 rounded-lg"
        closable
        @close="checkoutError = ''"
      >
        {{ checkoutError }}
      </UiAlert>

      <UiAlert variant="success" class="rounded-lg">
        Your payment information is secured with 256-bit SSL encryption
      </UiAlert>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ArrowLeft, ChevronRight, Lock } from "lucide-vue-next";
import { useCartStore } from "@/stores/cart";
import { useOrderStore } from "@/stores/order";
import { formatUsd, unitPrice } from "@/utils/pricing";
import type { PaymentChoice } from "@/components/checkout/PaymentMethodPicker.vue";
import type { CheckoutVoucher } from "@/components/checkout/VoucherPanel.vue";
import { CHECKOUT_ITEMS_KEY, type CheckoutItem, type ShippingAddress } from "@/types";

/**
 * Delivery details for COD. Remembered locally so a returning buyer does not
 * retype their address — the account itself stores no address or phone.
 */
const SHIPPING_STORAGE_KEY = "shippingDetails";

const router = useRouter();
const orderStore = useOrderStore();
const cartStore = useCartStore();

const selectedPayment = ref<PaymentChoice>("vnpay");
const isProcessing = ref(false);
const checkoutError = ref("");

const appliedVoucher = ref<CheckoutVoucher | null>(null);
const discount = ref(0);

const orderItems = ref<CheckoutItem[]>([]);

const shipping = reactive<ShippingAddress>({
  fullName: "",
  phone: "",
  address: "",
  note: "",
});

const subtotal = computed(() =>
  orderItems.value.reduce(
    (sum, item) => sum + unitPrice(item.price, item.productType) * item.quantity,
    0
  )
);

const total = computed(() => Math.max(0, subtotal.value - discount.value));

const hasEbook = computed(() =>
  orderItems.value.some((item) => item.productType === "ebook")
);

// Keep the selection valid if an ebook is in the basket.
watch(hasEbook, (ebookPresent) => {
  if (ebookPresent && selectedPayment.value === "cod") {
    selectedPayment.value = "vnpay";
  }
});

onMounted(() => {
  orderItems.value = readCheckoutItems();
  loadSavedShipping();
});

function readCheckoutItems(): CheckoutItem[] {
  try {
    const raw = localStorage.getItem(CHECKOUT_ITEMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Error parsing checkout items:", error);
    return [];
  }
}

function loadSavedShipping() {
  try {
    const saved = localStorage.getItem(SHIPPING_STORAGE_KEY);
    if (saved) Object.assign(shipping, JSON.parse(saved));
  } catch {
    // A corrupt entry just means the buyer types it again.
  }
}

function rememberShipping() {
  try {
    localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(shipping));
  } catch {
    // Private browsing and full storage are both survivable here.
  }
}

/**
 * Mirrors the backend rules so the buyer is told what is wrong before a round
 * trip. The server still validates: this is convenience, not the guard.
 */
function validateShipping(): string | null {
  if (!shipping.fullName.trim()) return "Please enter the recipient's name.";
  if (!/^(0|\+84)\d{9}$/.test(shipping.phone.replace(/[\s.-]/g, ""))) {
    return "Please enter a valid Vietnamese phone number, e.g. 0912345678.";
  }
  if (shipping.address.trim().length < 10) {
    return "Please enter a full delivery address.";
  }
  return null;
}

function onVoucherApplied(voucher: CheckoutVoucher | null, amount: number) {
  appliedVoucher.value = voucher;
  discount.value = amount;
}

async function handleConfirmPayment() {
  if (isProcessing.value) return;

  isProcessing.value = true;
  checkoutError.value = "";

  const code = appliedVoucher.value?.code ?? null;

  try {
    if (selectedPayment.value === "cod") {
      await placeCodOrder(code);
      return;
    }
    await redirectToGateway(selectedPayment.value, code);
  } catch (error: any) {
    // The backend explains real rejections (ebook in cart, expired voucher);
    // show that instead of a generic failure.
    console.error("Error processing payment:", error);
    checkoutError.value =
      error?.response?.data?.msg ??
      "An error occurred while processing your payment. Please try again.";
  } finally {
    // A successful gateway hand-off navigates away, so leaving the button
    // enabled here is harmless and every failure path needs it back.
    isProcessing.value = false;
  }
}

async function redirectToGateway(
  gateway: Exclude<PaymentChoice, "cod">,
  code: string | null
) {
  const paymentUrl =
    gateway === "vnpay"
      ? await orderStore.createOrder(code)
      : await orderStore.createMomoOrder(code);

  if (!paymentUrl) {
    checkoutError.value = "Payment processing failed. Please try again.";
    return;
  }
  window.location.href = paymentUrl;
}

async function placeCodOrder(code: string | null) {
  const invalid = validateShipping();
  if (invalid) {
    checkoutError.value = invalid;
    return;
  }

  // No gateway to bounce through: the order is placed here and the buyer goes
  // straight to the status page it returns.
  const { orderId } = await orderStore.createCodOrder({ ...shipping }, code);
  rememberShipping();
  localStorage.removeItem(CHECKOUT_ITEMS_KEY);
  // Placing a COD order commits the goods immediately, so the server has
  // already deleted the cart. The gateway flows reload the whole app on the way
  // back and pick that up for free; this one is a client-side route, so without
  // this the nav badge keeps counting items that no longer exist.
  cartStore.clearCart();
  await router.push(`/order/status/${orderId}`);
}
</script>
