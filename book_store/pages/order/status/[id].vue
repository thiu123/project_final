<template>
  <div class="container mx-auto p-4 md:p-8">
    <div class="mx-auto w-full md:w-10/12 lg:w-8/12">
      <!-- Success Header with Animation -->
      <div class="mb-8 overflow-hidden rounded-xl">
        <div
          :class="isSuccessStatus ? 'success-gradient' : 'warning-gradient'"
          class="p-8 text-center md:p-12"
        >
          <component
            :is="headerIcon"
            class="pulse-animation mx-auto mb-4 h-[100px] w-[100px] text-white"
          />
          <h1 class="mb-3 text-4xl font-bold text-white md:text-5xl">
            {{ getHeaderTitle() }}
          </h1>
          <p v-if="!isEbookOnly" class="text-lg text-white/90">
            {{ getHeaderSubtitle() }}
          </p>
        </div>
      </div>

      <!-- Order Details -->
      <UiCard v-if="order" class="mb-6 overflow-hidden rounded-lg shadow">
        <div class="flex items-center bg-muted/60 p-5">
          <ReceiptText class="mr-3 h-7 w-7 text-primary" />
          <span class="text-2xl font-bold">Order Details</span>
        </div>

        <UiSeparator />

        <div class="p-6">
          <div class="grid grid-cols-12 gap-2">
            <div class="col-span-12 sm:col-span-6 md:col-span-4">
              <div class="h-full rounded-lg bg-blue-50 p-4 dark:bg-blue-950/40">
                <div
                  class="mb-1 text-xs font-medium text-blue-700 dark:text-blue-300"
                >
                  Order ID
                </div>
                <div
                  class="text-lg font-semibold text-blue-900 dark:text-blue-100"
                >
                  {{ order.orderId }}
                </div>
              </div>
            </div>

            <div class="col-span-12 sm:col-span-6 md:col-span-4">
              <div
                class="h-full rounded-lg bg-purple-50 p-4 dark:bg-purple-950/40"
              >
                <div
                  class="mb-1 text-xs font-medium text-purple-700 dark:text-purple-300"
                >
                  Order Date
                </div>
                <div
                  class="text-base font-bold text-purple-900 dark:text-purple-100"
                >
                  {{ formatDate(order.createdAt) }}
                </div>
              </div>
            </div>

            <div class="col-span-12 sm:col-span-6 md:col-span-4">
              <div
                class="h-full rounded-lg bg-orange-50 p-4 dark:bg-orange-950/40"
              >
                <div
                  class="mb-1 text-xs font-medium text-orange-700 dark:text-orange-300"
                >
                  Payment Method
                </div>
                <div
                  class="text-base font-bold text-orange-900 dark:text-orange-100"
                >
                  {{ order.paymentMethod }}
                </div>
              </div>
            </div>

            <div class="col-span-12 sm:col-span-6 md:col-span-4">
              <div
                class="h-full rounded-lg bg-green-50 p-4 dark:bg-green-950/40"
              >
                <div
                  class="mb-1 text-xs font-medium text-green-700 dark:text-green-300"
                >
                  Status
                </div>
                <UiBadge
                  :variant="getStatusVariant(order.status)"
                  :class="'mt-1 font-bold ' + getStatusClass(order.status)"
                >
                  {{ order.status }}
                </UiBadge>
              </div>
            </div>

            <div
              v-if="order?.confirmedByAdmin"
              class="col-span-12 sm:col-span-6 md:col-span-4"
            >
              <div
                class="h-full rounded-lg bg-indigo-50 p-4 dark:bg-indigo-950/40"
              >
                <div
                  class="mb-1 text-xs font-medium text-indigo-700 dark:text-indigo-300"
                >
                  Admin Confirmed
                </div>
                <div
                  class="text-base font-bold text-indigo-900 dark:text-indigo-100"
                >
                  {{ formatDate(order?.confirmedAt) }}
                </div>
              </div>
            </div>

            <div class="col-span-12 sm:col-span-6 md:col-span-8">
              <div class="h-full rounded-lg bg-teal-50 p-4 dark:bg-teal-950/40">
                <div
                  class="mb-1 text-xs font-medium text-teal-700 dark:text-teal-300"
                >
                  Payment Completed
                </div>
                <div
                  class="text-base font-bold text-teal-900 dark:text-teal-100"
                >
                  {{ formatDate(order.updatedAt) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </UiCard>

      <!-- Items Purchased -->
      <UiCard
        v-if="order && order.items"
        class="mb-6 overflow-hidden rounded-lg shadow"
      >
        <div class="flex items-center bg-muted/60 p-5">
          <BookCopy class="mr-3 h-7 w-7 text-secondary" />
          <span class="text-2xl font-bold">Items Purchased</span>
          <UiBadge variant="secondary" class="ml-3">
            {{ order.items.length }}
            {{ order.items.length === 1 ? "item" : "items" }}
          </UiBadge>
        </div>

        <UiSeparator />

        <div class="p-0">
          <template v-for="(item, index) in order?.items" :key="index">
            <div
              class="flex items-start px-6 py-5 transition-colors duration-200 hover:bg-muted/30"
            >
              <div class="mr-5 shrink-0 overflow-hidden rounded-lg shadow-md">
                <img
                  v-if="item?.bookId?.cover_url"
                  :src="item?.bookId?.cover_url"
                  :alt="item?.bookId?.title"
                  class="h-[140px] w-[100px] rounded-lg bg-muted object-cover"
                />
                <div
                  v-else
                  class="flex h-[140px] w-[100px] items-center justify-center rounded-lg bg-muted"
                >
                  <Book class="h-12 w-12 text-muted-foreground/40" />
                </div>
              </div>

              <div class="min-w-0 grow">
                <div class="mb-2 text-lg font-bold">
                  {{ item.bookId?.title }}
                </div>

                <div
                  class="mb-2 flex items-center text-sm text-muted-foreground"
                >
                  <User class="mr-1 h-4 w-4" />
                  {{ item.bookId?.authors.join(", ") }}
                </div>

                <div
                  class="mb-3 flex items-center text-sm text-muted-foreground"
                >
                  <Calendar class="mr-1 h-4 w-4" />
                  Published {{ item.bookId?.first_publish_year }}
                </div>

                <div class="mb-3 flex items-center">
                  <UiRating
                    :model-value="item.bookId?.rating || 0"
                    :size="16"
                    readonly
                  />
                  <span class="ml-2 text-sm font-medium">
                    {{ item.bookId?.rating }}
                  </span>
                </div>

                <div class="mb-3 flex flex-wrap gap-2">
                  <UiBadge
                    v-for="subject in item.bookId?.subjects.slice(0, 3)"
                    :key="subject"
                    class="border-transparent bg-primary/10 text-primary"
                  >
                    {{ subject }}
                  </UiBadge>
                  <UiBadge
                    v-if="(item.bookId?.subjects.length || 0) > 3"
                    variant="outline"
                    class="border-transparent text-primary"
                  >
                    +{{ (item.bookId?.subjects.length || 0) - 3 }} more
                  </UiBadge>
                </div>

                <details class="mt-3 rounded-lg bg-muted">
                  <summary
                    class="cursor-pointer select-none rounded-lg px-4 py-3 text-sm font-medium"
                  >
                    View Description
                  </summary>
                  <div class="px-4 pb-3 text-sm text-foreground">
                    {{ item.bookId?.description }}
                  </div>
                </details>
              </div>

              <div class="ml-4 shrink-0 text-right">
                <UiBadge
                  class="mb-2 border-transparent bg-primary/10 text-primary"
                >
                  Qty: {{ item.quantity }}
                </UiBadge>
                <div class="text-lg font-bold text-primary">
                  ${{ getItemPrice(item).toFixed(2) }}
                </div>
                <div class="text-xs text-muted-foreground">per item</div>
              </div>
            </div>

            <div v-if="index < order.items.length - 1" class="px-6">
              <UiSeparator />
            </div>
          </template>
        </div>
      </UiCard>

      <!-- Order Summary -->
      <UiCard v-if="order" class="mb-8 overflow-hidden rounded-lg shadow-md">
        <div class="summary-gradient p-5">
          <div class="flex items-center">
            <Calculator class="mr-3 h-7 w-7 text-white" />
            <span class="text-2xl font-bold text-white">Order Summary</span>
          </div>
        </div>

        <UiSeparator />

        <div class="p-6">
          <!-- Items List -->
          <div class="mb-5">
            <div
              class="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >
              Items Breakdown
            </div>
            <div
              v-for="(item, index) in order.items"
              :key="index"
              class="mb-2 rounded-lg bg-muted/60 p-4"
            >
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-base font-medium text-foreground">
                    {{ item.bookId?.title }}
                    <UiBadge
                      v-if="item.productType === 'ebook'"
                      variant="success"
                      class="ml-2 text-[10px]"
                    >
                      Ebook
                    </UiBadge>
                  </div>
                  <div class="text-xs text-muted-foreground">
                    ${{ getItemPrice(item).toFixed(2) }} × {{ item.quantity }}
                  </div>
                </div>
                <div class="text-lg font-bold text-primary">
                  ${{ (getItemPrice(item) * item.quantity).toFixed(2) }}
                </div>
              </div>
            </div>
          </div>

          <UiSeparator class="my-5" />

          <!-- Subtotal -->
          <div class="mb-4 flex items-center justify-between px-2">
            <span class="text-base font-medium text-muted-foreground"
              >Subtotal</span
            >
            <span class="text-lg font-bold text-foreground">
              ${{ (calculateSubtotal(order) / 24000).toFixed(2) }}
            </span>
          </div>

          <!-- Voucher Discount -->
          <div
            v-if="order.voucher && order.voucher.code"
            class="mb-4 rounded-lg bg-green-50 p-4 dark:bg-green-950/40"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <span
                  class="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success"
                >
                  <TicketPercent class="h-5 w-5 text-white" />
                </span>
                <div>
                  <div class="text-base font-medium text-foreground">
                    Voucher Discount
                  </div>
                  <UiBadge variant="success" class="mt-1">
                    {{ order.voucher.code }}
                  </UiBadge>
                </div>
              </div>
              <div class="text-lg font-bold text-success">
                -${{ (order.voucher.discountAmount / 24000).toFixed(2) }}
              </div>
            </div>
          </div>

          <UiSeparator class="my-5" />

          <!-- Total -->
          <div class="rounded-lg bg-green-50 p-5 dark:bg-green-950/40">
            <div class="flex items-center justify-between">
              <div>
                <div
                  class="mb-1 text-xs font-bold uppercase tracking-widest text-green-700 dark:text-green-300"
                >
                  Total Paid
                </div>
                <div class="text-3xl font-bold text-success">
                  ${{ (order.total / 24000).toFixed(2) }}
                </div>
              </div>
              <CheckCircle2 class="h-[60px] w-[60px] text-success" />
            </div>

            <!-- VND Equivalent -->
            <div
              class="mt-4 border-t-2 border-dashed border-success/30 pt-4 text-center"
            >
              <span
                class="text-sm font-medium text-green-700 dark:text-green-300"
              >
                ≈ {{ order.total.toLocaleString() }} VNĐ
              </span>
            </div>
          </div>
        </div>
      </UiCard>

      <!-- Action Buttons -->
      <div class="mb-6 grid grid-cols-12 gap-2">
        <div
          v-if="canCancelOrder"
          class="col-span-12 sm:col-span-6 md:col-span-4"
        >
          <UiButton
            variant="destructive"
            size="lg"
            block
            class="h-12 rounded-lg font-bold shadow"
            :loading="cancelling"
            @click="handleCancelOrder"
          >
            <Ban class="mr-2 h-5 w-5" />
            Cancel Order
          </UiButton>
        </div>
        <div
          class="col-span-12"
          :class="
            canCancelOrder ? 'sm:col-span-6 md:col-span-4' : 'sm:col-span-6'
          "
        >
          <UiButton
            size="lg"
            block
            class="h-12 rounded-lg font-bold shadow"
            @click="goToHome"
          >
            <Home class="mr-2 h-5 w-5" />
            Continue Shopping
          </UiButton>
        </div>
        <div
          class="col-span-12"
          :class="
            canCancelOrder ? 'sm:col-span-12 md:col-span-4' : 'sm:col-span-6'
          "
        >
          <UiButton
            variant="secondary"
            size="lg"
            block
            class="h-12 rounded-lg font-bold shadow"
            @click="goToOrders"
          >
            <Package class="mr-2 h-5 w-5" />
            View My Orders
          </UiButton>
        </div>
      </div>

      <!-- Additional Info -->
      <div class="mb-4 rounded-lg bg-blue-50 p-5 dark:bg-blue-950/40">
        <div class="flex items-start">
          <span
            class="mr-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-info"
          >
            <Info class="h-7 w-7 text-white" />
          </span>
          <div>
            <div
              class="mb-3 text-lg font-bold text-blue-800 dark:text-blue-200"
            >
              What's Next?
            </div>
            <div class="text-sm text-blue-700 dark:text-blue-300">
              <div class="mb-2 flex items-start">
                <MailCheck
                  class="mr-2 mt-1 h-[18px] w-[18px] shrink-0 text-info"
                />
                <span>You will receive an email confirmation shortly</span>
              </div>
              <div class="mb-2 flex items-start">
                <ShieldCheck
                  class="mr-2 mt-1 h-[18px] w-[18px] shrink-0 text-info"
                />
                <span>Admin will review and confirm your order</span>
              </div>
              <div class="mb-2 flex items-start">
                <Clock
                  class="mr-2 mt-1 h-[18px] w-[18px] shrink-0 text-info"
                />
                <span
                  >Your order will be processed after admin confirmation</span
                >
              </div>
              <div class="flex items-start">
                <Route
                  class="mr-2 mt-1 h-[18px] w-[18px] shrink-0 text-info"
                />
                <span>Track your order status in "My Orders" section</span>
              </div>
              <div
                v-if="!order?.confirmedByAdmin && order?.status === 'Paid'"
                class="mt-3 flex items-start"
              >
                <AlertCircle
                  class="mr-2 mt-1 h-[18px] w-[18px] shrink-0 text-warning"
                />
                <span class="text-warning"
                  >You can cancel this order before admin confirmation</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cancel Confirmation Dialog -->
      <UiDialog v-model:open="cancelDialog">
        <UiDialogContent class="sm:max-w-lg">
          <UiDialogHeader>
            <UiDialogTitle
              class="flex items-center text-xl font-semibold text-destructive"
            >
              <TriangleAlert class="mr-2 h-5 w-5" />
              Cancel Order?
            </UiDialogTitle>
          </UiDialogHeader>

          <div>
            <p class="mb-3 text-base">
              Are you sure you want to cancel this order?
            </p>
            <UiAlert variant="warning">
              This action cannot be undone. Your payment will be refunded within
              5-7 business days.
            </UiAlert>
          </div>

          <UiDialogFooter>
            <UiButton
              variant="ghost"
              :disabled="cancelling"
              @click="cancelDialog = false"
            >
              Keep Order
            </UiButton>
            <UiButton
              variant="destructive"
              :loading="cancelling"
              @click="confirmCancelOrder"
            >
              Yes, Cancel Order
            </UiButton>
          </UiDialogFooter>
        </UiDialogContent>
      </UiDialog>

      <!-- Snackbar -->
      <SnackbarAlert
        v-model="snackbar"
        :text="snackbarText"
        :color="snackbarColor"
        :timeout="3000"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useOrderStore } from "@/stores/order";
import {
  AlertCircle,
  Ban,
  Book,
  BookCopy,
  Calculator,
  Calendar,
  CheckCircle2,
  Clock,
  Home,
  Info,
  MailCheck,
  Package,
  ReceiptText,
  Route,
  ShieldCheck,
  TicketPercent,
  TriangleAlert,
  User,
  XCircle,
} from "lucide-vue-next";
import orderApi from "~/api/orderApi";
import type { Order, OrderItem } from "@/types";

const orderStore = useOrderStore();
const { order } = storeToRefs(orderStore);
const route = useRoute();
const router = useRouter();

const cancelDialog = ref(false);
const cancelling = ref(false);
const snackbar = ref(false);
const snackbarText = ref("");
const snackbarColor = ref("success");

const canCancelOrder = computed(() => {
  if (!order.value) return false;

  const hasEbook = order.value.items?.some(
    (item) => item.productType === "ebook"
  );

  if (hasEbook && order.value.status === "Paid") {
    return false;
  }

  return ["Pending", "Paid"].includes(order.value.status);
});

const isSuccessStatus = computed(() =>
  ["Paid", "Confirmed", "In Delivery", "Delivered"].includes(
    order.value?.status ?? ""
  )
);

const isEbookOnly = computed(() => {
  if (!order.value || !order.value.items) return false;
  return order.value.items.every((item) => item.productType === "ebook");
});

const headerIcon = computed(() => {
  if (!order.value) return Info;
  switch (order.value.status) {
    case "Paid":
    case "Confirmed":
    case "In Delivery":
    case "Delivered":
      return CheckCircle2;
    case "Cancelled":
      return Ban;
    case "Failed":
      return XCircle;
    default:
      return Clock;
  }
});

async function getOrder() {
  const orderId = route.params.id as string;
  try {
    await orderStore.fetchOrderById(orderId);
  } catch (error) {
    console.error("Error fetching order:", error);
  }
}

function getHeaderTitle() {
  if (!order.value) return "Order Details";
  switch (order.value.status) {
    case "Paid":
      return "Payment Successful!";
    case "Confirmed":
      return "Order Confirmed!";
    case "In Delivery":
      return "Out for Delivery!";
    case "Delivered":
      return "Order Delivered!";
    case "Cancelled":
      return "Order Cancelled";
    case "Failed":
      return "Payment Failed";
    default:
      return "Order Pending";
  }
}

function getHeaderSubtitle() {
  if (!order.value) return "";
  switch (order.value.status) {
    case "Paid":
      return "Waiting for admin confirmation";
    case "Confirmed":
      return "Your order is being prepared";
    case "In Delivery":
      return "Your order is on the way";
    case "Delivered":
      return "Your order has been delivered";
    case "Cancelled":
      return "This order has been cancelled";
    case "Failed":
      return "Payment was not successful";
    default:
      return "Processing your order";
  }
}

function formatDate(dateString?: string) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Badge variant per order status (Vuetify colors: success/info/purple/teal/
// warning/error/primary → the closest UiBadge variants).
function getStatusVariant(
  status?: string
): "success" | "info" | "warning" | "destructive" | "default" {
  switch (status?.toLowerCase()) {
    case "paid":
      return "success";
    case "confirmed":
      return "info";
    case "pending":
      return "warning";
    case "failed":
    case "cancelled":
      return "destructive";
    default:
      return "default";
  }
}

// Extra classes for the statuses whose original colors (purple/teal) have no
// badge variant equivalent.
function getStatusClass(status?: string) {
  switch (status?.toLowerCase()) {
    case "in delivery":
      return "bg-purple-600 text-white";
    case "delivered":
      return "bg-teal-600 text-white";
    default:
      return "";
  }
}

function getItemPrice(item: OrderItem) {
  if (item.productType === "ebook") {
    return (item.bookId?.price || 0) * 0.7;
  }
  return item.bookId?.price || 0;
}

function calculateSubtotal(orderData: Order) {
  // Calculate subtotal by adding back discount to total
  if (orderData.voucher && orderData.voucher.discountAmount) {
    return orderData.total + orderData.voucher.discountAmount;
  }
  return orderData.total;
}

function handleCancelOrder() {
  cancelDialog.value = true;
}

async function confirmCancelOrder() {
  cancelling.value = true;
  try {
    await orderApi.cancelOrder(order.value!._id);
    showSnackbar("Order cancelled successfully", "success");
    cancelDialog.value = false;
    // Refresh order data
    await getOrder();
  } catch (error: any) {
    console.error("Error cancelling order:", error);
    showSnackbar(error.response?.data?.msg || "Failed to cancel order", "error");
  } finally {
    cancelling.value = false;
  }
}

function showSnackbar(text: string, color = "success") {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
}

function goToHome() {
  router.push("/");
}

function goToOrders() {
  router.push("/profiles?tab=orders");
}

onMounted(async () => {
  await getOrder();
});
</script>

<style scoped>
/* Header gradients + pulse keyframes (not expressible as Tailwind utilities) */
.success-gradient {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
}

.warning-gradient {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
}

.summary-gradient {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
}

@keyframes pulse-scale {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.pulse-animation {
  animation: pulse-scale 2s ease-in-out infinite;
}
</style>
