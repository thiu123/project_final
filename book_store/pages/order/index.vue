<template>
  <main class="min-h-screen bg-muted">
    <div class="mx-auto w-full max-w-[1200px] p-2 md:p-6">
      <!-- Page Header -->
      <div class="mb-6">
        <h1 class="mb-2 text-2xl font-bold md:text-3xl">Checkout</h1>
        <nav aria-label="Breadcrumb" class="flex items-center gap-1 text-sm">
          <span class="text-foreground">Home</span>
          <ChevronRight class="h-4 w-4 text-muted-foreground" />
          <span class="text-foreground">Cart</span>
          <ChevronRight class="h-4 w-4 text-muted-foreground" />
          <span class="text-muted-foreground">Checkout</span>
        </nav>
      </div>

      <!-- Payment Methods -->
      <UiCard class="mb-4 overflow-hidden rounded-xl shadow md:mb-6">
        <div class="flex items-center bg-primary px-4 py-4 text-primary-foreground">
          <CreditCard class="mr-3 h-6 w-6" />
          <span class="text-lg font-semibold">Payment Method</span>
        </div>
        <div class="p-4 md:p-6">
          <div role="radiogroup" class="flex flex-col gap-3">
            <button
              type="button"
              role="radio"
              :aria-checked="selectedPayment === 'vnpay'"
              class="rounded-lg border p-4 text-left transition-colors"
              :class="
                selectedPayment === 'vnpay'
                  ? 'border-primary bg-primary/5 dark:bg-primary/10'
                  : 'border-border bg-card'
              "
              @click="selectedPayment = 'vnpay'"
            >
              <div class="flex items-center">
                <span
                  class="mr-3 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border"
                  :class="
                    selectedPayment === 'vnpay'
                      ? 'border-primary'
                      : 'border-input'
                  "
                >
                  <span
                    v-if="selectedPayment === 'vnpay'"
                    class="h-2 w-2 rounded-full bg-primary"
                  ></span>
                </span>
                <span
                  class="mr-3 flex h-[60px] w-[60px] shrink-0 items-center justify-center overflow-hidden rounded bg-white"
                >
                  <img
                    :src="vnpayLogo"
                    alt="VNPay"
                    class="h-full w-full object-contain"
                  />
                </span>
                <span class="text-base font-medium">VNPay Wallet</span>
              </div>
            </button>

            <button
              type="button"
              role="radio"
              :aria-checked="selectedPayment === 'momo'"
              class="rounded-lg border p-4 text-left transition-colors"
              :class="
                selectedPayment === 'momo'
                  ? 'border-primary bg-primary/5 dark:bg-primary/10'
                  : 'border-border bg-card'
              "
              @click="selectedPayment = 'momo'"
            >
              <div class="flex items-center">
                <span
                  class="mr-3 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border"
                  :class="
                    selectedPayment === 'momo'
                      ? 'border-primary'
                      : 'border-input'
                  "
                >
                  <span
                    v-if="selectedPayment === 'momo'"
                    class="h-2 w-2 rounded-full bg-primary"
                  ></span>
                </span>
                <span
                  class="mr-3 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded"
                >
                  <img
                    :src="momoLogo"
                    alt="MoMo"
                    class="h-full w-full object-cover"
                  />
                </span>
                <span class="text-base font-medium">Momo Wallet</span>
              </div>
            </button>
          </div>
        </div>
      </UiCard>

      <!-- Promotion Code -->
      <UiCard class="mb-4 overflow-hidden rounded-xl shadow md:mb-6">
        <div class="flex items-center bg-primary px-4 py-4 text-primary-foreground">
          <TicketPercent class="mr-3 h-6 w-6" />
          <span class="text-lg font-semibold">Promotion Code</span>
        </div>
        <div class="p-4 md:p-6">
          <div class="mb-3 flex flex-col gap-3 sm:flex-row">
            <UiInput
              v-model="voucherCode"
              placeholder="Enter promotion or gift code"
              :disabled="appliedVoucher !== null"
              wrapper-class="grow"
              @focus="showAvailableVouchers = true"
            >
              <template #prepend>
                <Tag class="h-4 w-4" />
              </template>
            </UiInput>
            <div class="flex gap-2">
              <UiButton
                v-if="!appliedVoucher"
                size="lg"
                class="shrink-0 px-6"
                :loading="voucherLoading"
                :disabled="!voucherCode.trim() || voucherLoading"
                @click="applyVoucherCode"
              >
                Apply
              </UiButton>
              <UiButton
                v-else
                variant="destructive"
                size="lg"
                class="shrink-0 px-6"
                @click="removeVoucherCode"
              >
                Remove
              </UiButton>
              <UiButton
                variant="outline"
                size="lg"
                class="shrink-0 border-primary/50 text-primary hover:text-primary"
                @click="showAvailableVouchers = !showAvailableVouchers"
              >
                <Percent class="mr-2 h-4 w-4" />
                <span class="hidden sm:inline">Browse Codes</span>
                <span class="sm:hidden">Browse</span>
              </UiButton>
            </div>
          </div>

          <!-- Applied Voucher Display -->
          <UiAlert v-if="appliedVoucher" variant="success" class="mb-3">
            <div class="text-sm">
              <strong>{{ appliedVoucher.code }}</strong> applied!
              <div class="mt-1 text-xs">
                {{ appliedVoucher.description }}
              </div>
              <div class="mt-1 text-xs font-bold">
                You saved ${{ voucherDiscount.toFixed(2) }}!
              </div>
            </div>
          </UiAlert>

          <!-- Voucher Error -->
          <UiAlert
            v-if="voucherError"
            variant="error"
            class="mb-3"
            closable
            @close="voucherError = ''"
          >
            {{ voucherError }}
          </UiAlert>

          <!-- Available Vouchers List -->
          <div v-if="showAvailableVouchers" class="mt-4">
            <div class="mb-3 flex items-center text-sm font-bold">
              <TicketPercent class="mr-2 h-4 w-4" />
              Available Vouchers
            </div>

            <UiProgress v-if="loadingVouchers" indeterminate class="mb-3" />

            <div
              v-if="!loadingVouchers && availableVouchers.length === 0"
              class="py-4 text-center text-muted-foreground"
            >
              <Ticket class="mx-auto h-12 w-12 text-muted-foreground/50" />
              <div class="mt-2">No vouchers available</div>
            </div>

            <div v-if="!loadingVouchers" class="voucher-list max-h-[400px] overflow-y-auto pr-1">
              <div
                v-for="voucher in availableVouchers"
                :key="voucher._id"
                class="mb-3 cursor-pointer rounded-lg border-2 bg-card p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
                :class="
                  appliedVoucher && appliedVoucher.code === voucher.code
                    ? 'border-success bg-success/5'
                    : 'border-border'
                "
                @click="selectVoucher(voucher)"
              >
                <div class="flex items-center justify-between">
                  <div class="min-w-0 grow">
                    <div class="mb-2 flex items-center">
                      <UiBadge class="mr-2 font-bold">
                        {{ voucher.code }}
                      </UiBadge>
                      <UiBadge
                        :variant="
                          voucher.discountType === 'percentage'
                            ? 'success'
                            : 'info'
                        "
                        class="text-[10px]"
                      >
                        {{
                          voucher.discountType === "percentage"
                            ? `${voucher.discountValue}% OFF`
                            : `$${voucher.discountValue} OFF`
                        }}
                      </UiBadge>
                    </div>
                    <div class="mb-1 text-sm text-muted-foreground">
                      {{ voucher.description }}
                    </div>
                    <div
                      class="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground"
                    >
                      <span class="inline-flex items-center">
                        <ShoppingCart class="mr-1 h-3 w-3" />
                        Min order: ${{ voucher.minOrderAmount }}
                      </span>
                      <span
                        v-if="voucher.maxDiscount"
                        class="ml-2 inline-flex items-center"
                      >
                        <ShieldCheck class="mr-1 h-3 w-3" />
                        Max discount: ${{ voucher.maxDiscount }}
                      </span>
                    </div>
                  </div>
                  <span class="ml-2 shrink-0 text-primary">
                    <CircleArrowRight class="h-6 w-6" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <UiAlert v-if="!showAvailableVouchers" variant="info">
            Click "Browse Codes" to see available vouchers
          </UiAlert>
        </div>
      </UiCard>

      <!-- Order Review -->
      <UiCard class="mb-4 overflow-hidden rounded-xl shadow md:mb-6">
        <div class="flex items-center bg-primary px-4 py-4 text-primary-foreground">
          <ShoppingCart class="mr-3 h-6 w-6" />
          <span class="text-lg font-semibold"
            >Order Summary ({{ orderItems.length }} items)</span
          >
        </div>
        <div v-if="orderItems.length" class="p-4 md:p-6">
          <div
            v-for="(item, index) in orderItems"
            :key="item.bookId || item._id"
            class="mb-4"
            :class="{
              'border-b border-border pb-4': index < orderItems.length - 1,
            }"
          >
            <!-- Mobile Layout -->
            <div class="flex flex-col sm:hidden">
              <div class="mb-3 flex gap-3">
                <img
                  :src="getItemCoverUrl(item)"
                  :alt="getItemTitle(item)"
                  class="h-[110px] w-[80px] shrink-0 rounded bg-muted object-cover"
                />
                <div class="min-w-0 grow">
                  <div class="mb-2 text-base font-bold">
                    {{ getItemTitle(item) }}
                  </div>
                  <div
                    class="mb-2 flex items-center text-xs text-muted-foreground"
                  >
                    <User class="mr-1 h-3 w-3" />
                    {{ getItemAuthors(item) }}
                  </div>
                  <UiBadge
                    :variant="
                      item.productType === 'ebook' ? 'success' : 'default'
                    "
                    class="rounded-md"
                  >
                    {{
                      item.productType === "ebook" ? "📱 Ebook" : "📚 Hardbook"
                    }}
                  </UiBadge>
                </div>
              </div>
              <div
                class="flex items-center justify-between rounded bg-muted p-3"
              >
                <div class="flex items-center gap-2">
                  <span class="text-sm text-muted-foreground">Qty:</span>
                  <span class="px-3 text-base font-medium">{{
                    item.quantity
                  }}</span>
                </div>
                <span class="text-lg font-bold text-primary">
                  ${{
                    (
                      getItemPrice(item) *
                      (item.productType === "ebook" ? 0.7 : 1) *
                      item.quantity
                    ).toFixed(2)
                  }}
                </span>
              </div>
            </div>

            <!-- Desktop/Tablet Layout -->
            <div class="hidden items-start gap-4 sm:flex">
              <img
                :src="getItemCoverUrl(item)"
                :alt="getItemTitle(item)"
                class="h-[160px] w-[120px] shrink-0 rounded bg-muted object-cover"
              />
              <div class="min-w-0 grow">
                <div class="mb-2 text-lg font-semibold">
                  {{ getItemTitle(item) }}
                </div>
                <div
                  class="mb-3 flex items-center text-sm text-muted-foreground"
                >
                  <User class="mr-1 h-4 w-4" />
                  {{ getItemAuthors(item) }}
                </div>
                <div
                  class="flex flex-wrap items-center justify-between gap-3"
                >
                  <div class="flex items-center gap-2">
                    <UiBadge
                      :variant="
                        item.productType === 'ebook' ? 'success' : 'default'
                      "
                      class="rounded-md px-3 py-1.5"
                    >
                      <span class="text-lg font-semibold">
                        ${{
                          (
                            getItemPrice(item) *
                            (item.productType === "ebook" ? 0.7 : 1)
                          ).toFixed(2)
                        }}
                      </span>
                    </UiBadge>
                    <UiBadge
                      :variant="
                        item.productType === 'ebook' ? 'success' : 'info'
                      "
                    >
                      {{
                        item.productType === "ebook"
                          ? "📱 Ebook"
                          : "📚 Hardbook"
                      }}
                    </UiBadge>
                  </div>
                  <div
                    class="flex items-center gap-2 rounded bg-muted p-2"
                  >
                    <span class="text-sm text-muted-foreground">Qty:</span>
                    <span class="px-3 text-lg font-medium">{{
                      item.quantity
                    }}</span>
                  </div>
                  <span class="text-2xl font-bold text-primary"
                    >${{
                      (
                        getItemPrice(item) *
                        (item.productType === "ebook" ? 0.7 : 1) *
                        item.quantity
                      ).toFixed(2)
                    }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </UiCard>

      <!-- Order Summary -->
      <UiCard class="mb-4 rounded-xl shadow md:mb-6">
        <div class="p-4 md:p-6">
          <div class="mb-3 flex justify-between text-base">
            <span class="text-muted-foreground">Subtotal</span>
            <span class="font-medium">{{ formattedSubtotal }}</span>
          </div>
          <div
            v-if="voucherDiscount > 0"
            class="mb-3 flex justify-between text-base"
          >
            <span class="text-muted-foreground">Discount</span>
            <span class="font-medium text-success"
              >-${{ voucherDiscount.toFixed(2) }}</span
            >
          </div>
          <UiSeparator class="my-4" />
          <div
            class="flex items-center justify-between rounded-lg bg-primary/10 p-4"
          >
            <span class="text-lg font-bold">Total Amount</span>
            <span class="text-3xl font-bold text-primary">{{
              formattedTotal
            }}</span>
          </div>
          <div class="mt-2 text-center text-xs text-muted-foreground">
            (including VAT)
          </div>
        </div>
      </UiCard>

      <!-- Action Buttons -->
      <div class="mb-4 flex flex-col gap-3 sm:flex-row">
        <UiButton
          variant="outline"
          size="lg"
          class="order-2 h-12 grow text-muted-foreground sm:order-1"
          @click="goBackToCart"
        >
          <ArrowLeft class="mr-2 h-5 w-5" />
          <span class="hidden sm:inline">Back to Cart</span>
          <span class="sm:hidden">Back</span>
        </UiButton>
        <UiButton
          size="lg"
          class="order-1 h-12 grow sm:order-2"
          :disabled="isProcessingPayment"
          :loading="isProcessingPayment"
          @click="handleConfirmPayment"
        >
          <span class="hidden font-bold sm:inline">
            {{ isProcessingPayment ? "PROCESSING..." : "CONFIRM PAYMENT" }}
          </span>
          <span class="font-bold sm:hidden">
            {{ isProcessingPayment ? "PROCESSING..." : "CONFIRM" }}
          </span>
          <Lock class="ml-2 h-5 w-5" />
        </UiButton>
      </div>

      <!-- Security Notice -->
      <UiAlert variant="success" class="rounded-lg">
        Your payment information is secured with 256-bit SSL encryption
      </UiAlert>
    </div>
  </main>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useOrderStore } from "@/stores/order";
import {
  ArrowLeft,
  ChevronRight,
  CircleArrowRight,
  CreditCard,
  Lock,
  Percent,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Ticket,
  TicketPercent,
  User,
} from "lucide-vue-next";
import { validateVoucher, getAllVouchers } from "@/api/voucherApi";
import type { Voucher } from "@/types";
import vnpayLogo from "~/assets/vnpay-logo-inkythuatso.svg";
import momoLogo from "~/assets/Logo-MoMo-Square-300x300.png";

// The backend voucher documents carry a description that the shared Voucher
// type does not declare.
type CheckoutVoucher = Voucher & { description?: string };

// Items come either from localStorage ("checkoutItems" written by the cart
// page: flattened fields) or from the order store (populated bookId objects),
// so the helpers below probe both shapes.
type CheckoutDisplayItem = Record<string, any> & {
  quantity: number;
  productType: string;
};

const orderStore = useOrderStore();
const { cartItems } = storeToRefs(orderStore);
const router = useRouter();

const selectedPayment = ref("vnpay");
const voucherCode = ref("");
const isProcessingPayment = ref(false);
// Voucher states
const appliedVoucher = ref<CheckoutVoucher | null>(null);
const voucherDiscount = ref(0);
const voucherLoading = ref(false);
const voucherError = ref("");
const showAvailableVouchers = ref(false);
const availableVouchers = ref<CheckoutVoucher[]>([]);
const loadingVouchers = ref(false);

// Use checkout items from localStorage if available, otherwise use all cart items
const orderItems = computed<CheckoutDisplayItem[]>(() => {
  // Check if running on client side
  if (import.meta.client) {
    const checkoutItems = localStorage.getItem("checkoutItems");
    if (checkoutItems) {
      try {
        return JSON.parse(checkoutItems);
      } catch (e) {
        console.error("Error parsing checkout items:", e);
        return (cartItems.value as CheckoutDisplayItem[]) || [];
      }
    }
  }
  return (cartItems.value as CheckoutDisplayItem[]) || [];
});

const subtotal = computed(() => {
  if (!orderItems.value || orderItems.value.length === 0) return 0;

  return orderItems.value.reduce((sum, item) => {
    const price =
      item.productType === "ebook"
        ? (item.price || item.bookId?.price || 0) * 0.7
        : item.price || item.bookId?.price || 0;
    return sum + price * item.quantity;
  }, 0);
});

const total = computed(() => subtotal.value - voucherDiscount.value);

// Format currency display
const formattedSubtotal = computed(() => `$${subtotal.value.toFixed(2)}`);
const formattedTotal = computed(() => `$${total.value.toFixed(2)}`);

// Helper methods to get item properties (handle both localStorage and store data)
function getItemCoverUrl(item: CheckoutDisplayItem): string {
  return item.cover_url || item.bookId?.cover_url || "";
}

function getItemTitle(item: CheckoutDisplayItem): string {
  return item.title || item.bookId?.title || "Unknown";
}

function getItemAuthors(item: CheckoutDisplayItem) {
  const authors = item.authors;
  return authors;
}

function getItemPrice(item: CheckoutDisplayItem): number {
  return item.price || item.bookId?.price || 0;
}

async function loadAvailableVouchers() {
  try {
    loadingVouchers.value = true;
    const response = await getAllVouchers(true);
    if (response) {
      availableVouchers.value = Array.isArray(response)
        ? response
        : response.data || [];
    }
  } catch (error) {
    console.error("Error loading vouchers:", error);
  } finally {
    loadingVouchers.value = false;
  }
}

function selectVoucher(voucher: CheckoutVoucher) {
  if (appliedVoucher.value && appliedVoucher.value.code === voucher.code) {
    return; // Already applied
  }
  voucherCode.value = voucher.code;
  applyVoucherCode();
}

async function applyVoucherCode() {
  if (!voucherCode.value.trim()) return;

  voucherLoading.value = true;
  voucherError.value = "";

  try {
    const response = await validateVoucher(
      voucherCode.value.trim(),
      subtotal.value
    );

    if (response.success) {
      appliedVoucher.value = response.data.voucher;
      voucherDiscount.value = response.data.discountAmount;
      showAvailableVouchers.value = false;
    }
  } catch (error: any) {
    console.error("Voucher validation error:", error);
    voucherError.value =
      error.message || "Invalid voucher code. Please try again.";
    appliedVoucher.value = null;
    voucherDiscount.value = 0;
  } finally {
    voucherLoading.value = false;
  }
}

function removeVoucherCode() {
  appliedVoucher.value = null;
  voucherDiscount.value = 0;
  voucherCode.value = "";
  voucherError.value = "";
}

function goBackToCart() {
  router.push("/cart");
}

async function handleConfirmPayment() {
  // Prevent double click
  if (isProcessingPayment.value) {
    console.log("Payment already in progress...");
    return;
  }

  try {
    isProcessingPayment.value = true;

    // Get voucher code if applied
    const code = appliedVoucher.value ? appliedVoucher.value.code : null;

    if (selectedPayment.value === "vnpay") {
      console.log("Creating order with VNPay payment...");
      console.log("Voucher code:", code);
      const paymentUrl = await orderStore.createOrder(code);
      if (paymentUrl) {
        console.log("Redirecting to VNPay payment URL:", paymentUrl);
        window.location.href = paymentUrl;
      } else {
        console.error("Failed to get VNPay payment URL");
        alert("Payment processing failed. Please try again.");
        isProcessingPayment.value = false;
      }
    } else if (selectedPayment.value === "momo") {
      console.log("Creating order with MoMo payment...");
      console.log("Voucher code:", code);
      const paymentUrl = await orderStore.createMomoOrder(code);
      if (paymentUrl) {
        console.log("Redirecting to MoMo payment URL:", paymentUrl);
        window.location.href = paymentUrl;
      } else {
        console.error("Failed to get MoMo payment URL");
        alert("Payment processing failed. Please try again.");
        isProcessingPayment.value = false;
      }
    } else {
      // Handle other payment methods
      console.log(
        "Processing order with payment method:",
        selectedPayment.value
      );
      isProcessingPayment.value = false;
      // Implement other payment methods here
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    alert("An error occurred while processing your payment. Please try again.");
    isProcessingPayment.value = false;
  }
}

onMounted(async () => {
  await loadAvailableVouchers();
});
</script>

<style scoped>
/* Custom scrollbar for the voucher list (not expressible with Tailwind) */
.voucher-list::-webkit-scrollbar {
  width: 6px;
}

.voucher-list::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

.voucher-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.voucher-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
