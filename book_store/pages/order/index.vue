<template>
  <div class="container mx-auto max-w-7xl px-4 pt-10 md:pt-16">
    <header class="hero-rise border-b border-border pb-8 md:pb-10">
      <nav
        aria-label="Breadcrumb"
        class="flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground"
      >
        <NuxtLink to="/" class="transition-colors hover:text-foreground">Home</NuxtLink>
        <span class="text-border" aria-hidden="true">/</span>
        <NuxtLink to="/cart" class="transition-colors hover:text-foreground">Cart</NuxtLink>
        <span class="text-border" aria-hidden="true">/</span>
        <span class="text-foreground" aria-current="page">Checkout</span>
      </nav>
      <h1
        class="mt-6 font-serif text-4xl font-normal leading-[1.02] tracking-[-0.025em] md:text-6xl"
      >
        Almost <span class="italic">yours</span>.
      </h1>
      <p class="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-muted-foreground">
        Choose how to pay, add a code if you have one, and confirm your order.
      </p>
    </header>

    <div class="mt-10 grid grid-cols-1 gap-12 md:mt-12 lg:grid-cols-12 lg:gap-16">
      <div class="divide-y divide-border lg:col-span-7">
        <section class="pb-10 md:pb-12" aria-labelledby="step-payment">
          <div :class="STEP_HEAD_CLASS">
            <span :class="STEP_NUMBER_CLASS">{{ stepNumber("payment") }}</span>
            <div class="min-w-0">
              <h2 id="step-payment" :class="STEP_TITLE_CLASS">Payment</h2>
              <p class="mt-1 text-[14px] text-muted-foreground">How would you like to pay?</p>
            </div>
          </div>
          <div :class="STEP_BODY_CLASS">
            <CheckoutPaymentMethodPicker
              v-model="selectedPayment"
              :has-ebook="hasEbook"
            />
          </div>
        </section>

        <section
          v-if="selectedPayment === 'cod'"
          class="py-10 md:py-12"
          aria-labelledby="step-delivery"
        >
          <div :class="STEP_HEAD_CLASS">
            <span :class="STEP_NUMBER_CLASS">{{ stepNumber("delivery") }}</span>
            <div class="min-w-0">
              <h2 id="step-delivery" :class="STEP_TITLE_CLASS">Delivery</h2>
              <p class="mt-1 text-[14px] text-muted-foreground">
                Where should the courier bring your books?
              </p>
            </div>
          </div>
          <div :class="STEP_BODY_CLASS">
            <CheckoutShippingDetailsForm :shipping="shipping" />
          </div>
        </section>

        <section class="py-10 md:py-12" aria-labelledby="step-code">
          <div :class="STEP_HEAD_CLASS">
            <span :class="STEP_NUMBER_CLASS">{{ stepNumber("code") }}</span>
            <div class="min-w-0">
              <h2 id="step-code" :class="STEP_TITLE_CLASS">Promotion code</h2>
              <p class="mt-1 text-[14px] text-muted-foreground">
                Optional. Enter a code or choose one of ours.
              </p>
            </div>
          </div>
          <div :class="STEP_BODY_CLASS">
            <CheckoutVoucherPanel :subtotal="subtotal" @applied="onVoucherApplied" />
          </div>
        </section>
      </div>

      <aside class="lg:col-span-5" aria-labelledby="step-review">
        <div class="bg-muted px-5 py-8 sm:px-8 lg:sticky lg:top-32">
          <div class="flex items-baseline gap-4">
            <span :class="STEP_NUMBER_CLASS">{{ stepNumber("review") }}</span>
            <h2 id="step-review" :class="STEP_TITLE_CLASS">Review</h2>
            <span class="eyebrow ml-auto tabular-nums">
              {{ orderItems.length }} {{ orderItems.length === 1 ? "book" : "books" }}
            </span>
          </div>

          <div class="mt-6">
            <CheckoutOrderReview :items="orderItems" />
          </div>

          <dl class="divide-y divide-border border-b border-border text-[15px]">
            <div class="flex items-baseline justify-between gap-4 py-3">
              <dt class="text-muted-foreground">Subtotal</dt>
              <dd class="tabular-nums">{{ formatUsd(subtotal) }}</dd>
            </div>
            <div v-if="discount > 0" class="flex items-baseline justify-between gap-4 py-3">
              <dt class="text-muted-foreground">
                Discount
                <span
                  v-if="appliedVoucher?.code"
                  class="ml-1 text-[11px] font-medium uppercase tracking-[0.12em]"
                >
                  {{ appliedVoucher.code }}
                </span>
              </dt>
              <dd class="tabular-nums">&minus;{{ formatUsd(discount) }}</dd>
            </div>
            <div v-if="hasHardback" class="flex items-baseline justify-between gap-4 py-3">
              <dt class="text-muted-foreground">Delivery</dt>
              <dd>Free</dd>
            </div>
          </dl>

          <div class="flex items-baseline justify-between gap-4 pt-6">
            <span class="eyebrow">Total</span>
            <span class="font-serif text-4xl leading-none tabular-nums md:text-5xl">
              {{ formatUsd(total) }}
            </span>
          </div>
          <p class="mt-2 text-right text-[12px] text-muted-foreground">VAT included</p>

          <UiButton
            variant="ink"
            size="cta"
            block
            class="mt-8 shadow-none"
            :disabled="isProcessing || !orderItems.length"
            :loading="isProcessing"
            @click="handleConfirmPayment"
          >
            <Lock v-if="!isProcessing" :stroke-width="1.5" />
            {{ ctaLabel }}
          </UiButton>

          <p
            v-if="checkoutError"
            role="alert"
            class="mt-4 flex items-start justify-between gap-4 text-[13px] leading-relaxed text-destructive"
          >
            <span class="inline-flex items-start gap-2">
              <span class="mt-[8px] size-1.5 shrink-0 rounded-full bg-destructive" />
              {{ checkoutError }}
            </span>
            <button
              type="button"
              class="mt-0.5 shrink-0 opacity-70 transition-opacity hover:opacity-100"
              aria-label="Dismiss"
              @click="checkoutError = ''"
            >
              <X class="size-4" :stroke-width="1.5" />
            </button>
          </p>

          <div class="mt-6 flex justify-center">
            <NuxtLink
              to="/cart"
              class="group inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em]"
            >
              <ArrowLeft
                class="size-4 transition-transform group-hover:-translate-x-1"
                :stroke-width="1.5"
              />
              <span class="ed-link">Back to cart</span>
            </NuxtLink>
          </div>

          <p
            class="mt-8 flex items-center gap-2 border-t border-border pt-5 text-[12px] text-muted-foreground"
          >
            <ShieldCheck class="size-3.5 shrink-0" :stroke-width="1.5" />
            Your payment information is secured with 256-bit SSL encryption
          </p>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Lock, ShieldCheck, X } from "lucide-vue-next";
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

const STEP_HEAD_CLASS = "flex items-baseline gap-4 md:gap-6";
const STEP_NUMBER_CLASS =
  "shrink-0 font-serif text-xl leading-none tabular-nums text-muted-foreground md:w-10 md:text-2xl";
const STEP_TITLE_CLASS =
  "font-serif text-2xl font-normal leading-snug tracking-[-0.015em] md:text-[2rem]";
const STEP_BODY_CLASS = "mt-6 md:mt-8 md:pl-16";

type CheckoutStep = "payment" | "delivery" | "code" | "review";

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

const hasHardback = computed(() =>
  orderItems.value.some((item) => item.productType === "hardbook")
);

const visibleSteps = computed<CheckoutStep[]>(() =>
  selectedPayment.value === "cod"
    ? ["payment", "delivery", "code", "review"]
    : ["payment", "code", "review"]
);

const ctaLabel = computed(() => {
  if (isProcessing.value) return "Processing";
  return selectedPayment.value === "cod" ? "Place order" : "Confirm payment";
});

function stepNumber(step: CheckoutStep) {
  return String(visibleSteps.value.indexOf(step) + 1).padStart(2, "0");
}

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
