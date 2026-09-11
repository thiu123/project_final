<template>
  <div class="container mx-auto p-4 md:p-8">
    <div class="mx-auto w-full md:w-10/12 lg:w-8/12">
      <!-- Status header -->
      <div class="mb-8 overflow-hidden rounded-xl">
        <div
          :class="isSettled ? 'success-gradient' : 'warning-gradient'"
          class="p-8 text-center md:p-12"
        >
          <component
            :is="header.icon"
            class="pulse-animation mx-auto mb-4 h-[100px] w-[100px] text-white"
          />
          <h1 class="mb-3 text-4xl font-bold text-white md:text-5xl">
            {{ header.title }}
          </h1>
          <p v-if="!isEbookOnly" class="text-lg text-white/90">
            {{ header.subtitle }}
          </p>
        </div>
      </div>

      <template v-if="order">
        <OrderInfoCard :order="order" />
        <OrderItemsCard :items="order.items" />
        <OrderSummaryCard :order="order" />
      </template>

      <!-- Actions -->
      <div class="mb-6 grid grid-cols-12 gap-2">
        <div v-if="canCancelOrder" class="col-span-12 sm:col-span-6 md:col-span-4">
          <UiButton
            variant="destructive"
            size="lg"
            block
            class="h-12 rounded-lg font-bold shadow"
            :loading="cancelling"
            @click="cancelDialog = true"
          >
            <Ban class="mr-2 h-5 w-5" />
            Cancel Order
          </UiButton>
        </div>

        <div class="col-span-12" :class="actionColumnClass">
          <UiButton
            size="lg"
            block
            class="h-12 rounded-lg font-bold shadow"
            @click="router.push('/')"
          >
            <Home class="mr-2 h-5 w-5" />
            Continue Shopping
          </UiButton>
        </div>

        <div class="col-span-12" :class="actionColumnClass">
          <UiButton
            variant="secondary"
            size="lg"
            block
            class="h-12 rounded-lg font-bold shadow"
            @click="router.push('/profiles?tab=orders')"
          >
            <Package class="mr-2 h-5 w-5" />
            View My Orders
          </UiButton>
        </div>
      </div>

      <!-- What's next -->
      <div class="mb-4 rounded-lg bg-blue-50 p-5 dark:bg-blue-950/40">
        <div class="flex items-start">
          <span
            class="mr-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-info"
          >
            <Info class="h-7 w-7 text-white" />
          </span>
          <div>
            <div class="mb-3 text-lg font-bold text-blue-800 dark:text-blue-200">
              What's Next?
            </div>
            <div class="text-sm text-blue-700 dark:text-blue-300">
              <div
                v-for="step in NEXT_STEPS"
                :key="step.text"
                class="mb-2 flex items-start"
              >
                <component
                  :is="step.icon"
                  class="mr-2 mt-1 h-[18px] w-[18px] shrink-0 text-info"
                />
                <span>{{ step.text }}</span>
              </div>

              <div v-if="canCancelOrder" class="mt-3 flex items-start">
                <AlertCircle
                  class="mr-2 mt-1 h-[18px] w-[18px] shrink-0 text-warning"
                />
                <span class="text-warning">
                  You can cancel this order before admin confirmation
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cancel confirmation -->
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

          <p class="mb-3 text-base">
            Are you sure you want to cancel this order?
          </p>
          <UiAlert variant="warning">
            This action cannot be undone. Your payment will be refunded within
            5-7 business days.
          </UiAlert>

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

      <SnackbarAlert
        v-model="snackbar.show"
        :text="snackbar.message"
        :color="snackbar.color"
        :timeout="3000"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { Component } from "vue";
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  Clock,
  Home,
  Info,
  MailCheck,
  Package,
  Route,
  ShieldCheck,
  TriangleAlert,
  XCircle,
} from "lucide-vue-next";
import orderApi from "~/api/orderApi";
import { useOrderStore } from "@/stores/order";
import { useSnackbar } from "@/composables/useSnackbar";
import type { OrderStatus } from "@/types";

/**
 * Headline for each status, in one table rather than three parallel `switch`
 * statements that had to be kept in step by hand.
 */
const STATUS_HEADERS: Record<
  OrderStatus,
  { icon: Component; title: string; subtitle: string }
> = {
  Pending: {
    icon: Clock,
    title: "Order Pending",
    subtitle: "Processing your order",
  },
  Paid: {
    icon: CheckCircle2,
    title: "Payment Successful!",
    subtitle: "Waiting for admin confirmation",
  },
  Confirmed: {
    icon: CheckCircle2,
    title: "Order Confirmed!",
    subtitle: "Your order is being prepared",
  },
  "In Delivery": {
    icon: CheckCircle2,
    title: "Out for Delivery!",
    subtitle: "Your order is on the way",
  },
  Delivered: {
    icon: CheckCircle2,
    title: "Order Delivered!",
    subtitle: "Your order has been delivered",
  },
  Cancelled: {
    icon: Ban,
    title: "Order Cancelled",
    subtitle: "This order has been cancelled",
  },
  Failed: {
    icon: XCircle,
    title: "Payment Failed",
    subtitle: "Payment was not successful",
  },
};

const FALLBACK_HEADER = { icon: Info, title: "Order Details", subtitle: "" };

/** Statuses where the money is in and fulfilment is under way. */
const SETTLED_STATUSES: OrderStatus[] = [
  "Paid",
  "Confirmed",
  "In Delivery",
  "Delivered",
];

const NEXT_STEPS = [
  { icon: MailCheck, text: "You will receive an email confirmation shortly" },
  { icon: ShieldCheck, text: "Admin will review and confirm your order" },
  { icon: Clock, text: "Your order will be processed after admin confirmation" },
  { icon: Route, text: 'Track your order status in "My Orders" section' },
];

const route = useRoute();
const router = useRouter();

const orderStore = useOrderStore();
const { order } = storeToRefs(orderStore);

const { snackbar, notify, notifyError } = useSnackbar();

const cancelDialog = ref(false);
const cancelling = ref(false);

const header = computed(
  () => (order.value && STATUS_HEADERS[order.value.status]) || FALLBACK_HEADER
);

const isSettled = computed(() =>
  SETTLED_STATUSES.includes(order.value?.status as OrderStatus)
);

const isEbookOnly = computed(
  () =>
    !!order.value?.items?.length &&
    order.value.items.every((item) => item.productType === "ebook")
);

const canCancelOrder = computed(() => {
  if (!order.value) return false;
  // A paid ebook has already been handed over, so there is nothing to cancel.
  if (isEbookOnly.value && order.value.status === "Paid") return false;
  return ["Pending", "Paid"].includes(order.value.status);
});

/** The three action buttons share the row differently once Cancel appears. */
const actionColumnClass = computed(() =>
  canCancelOrder.value ? "sm:col-span-6 md:col-span-4" : "sm:col-span-6"
);

onMounted(getOrder);

async function getOrder() {
  try {
    await orderStore.fetchOrderById(route.params.id as string);
  } catch (error) {
    console.error("Error fetching order:", error);
  }
}

async function confirmCancelOrder() {
  cancelling.value = true;
  try {
    await orderApi.cancelOrder(order.value!._id);
    notify("Order cancelled successfully");
    cancelDialog.value = false;
    await getOrder();
  } catch (error: any) {
    console.error("Error cancelling order:", error);
    notifyError(error.response?.data?.msg || "Failed to cancel order");
  } finally {
    cancelling.value = false;
  }
}
</script>

<style scoped>
/* Header gradients + pulse keyframes (not expressible as Tailwind utilities) */
.success-gradient {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
}

.warning-gradient {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
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
