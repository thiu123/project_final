<template>
  <div class="container mx-auto max-w-7xl px-4 pt-10 md:pt-16">
    <header v-if="order" class="hero-rise border-b border-border pb-10 md:pb-14">
      <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <p class="eyebrow">
          Order <span class="ml-1 tabular-nums text-foreground">{{ order.orderId }}</span>
        </p>
        <span
          class="inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em]"
        >
          <span class="size-1.5 rounded-full" :class="STATUS_DOTS[order.status] ?? 'bg-muted-foreground'" />
          {{ order.status }}
        </span>
      </div>
      <h1
        class="mt-6 max-w-[22ch] font-serif text-4xl font-normal leading-[1.02] tracking-[-0.025em] md:mt-8 md:text-6xl"
      >
        {{ header.lead }} <span class="italic">{{ header.emphasis }}</span>.
      </h1>
      <p
        v-if="!isEbookOnly && header.subtitle"
        class="mt-5 max-w-[52ch] text-[15px] leading-relaxed text-muted-foreground"
      >
        {{ header.subtitle }}
      </p>
    </header>

    <header v-else-if="!loaded" class="border-b border-border pb-10 md:pb-14">
      <UiSkeleton class="h-3 w-48 rounded-none" />
      <UiSkeleton class="mt-8 h-12 w-full max-w-xl rounded-none md:h-16" />
      <UiSkeleton class="mt-5 h-4 w-72 rounded-none" />
    </header>

    <header v-else class="hero-rise border-b border-border pb-10 md:pb-14">
      <p class="eyebrow">Order</p>
      <h1
        class="mt-6 font-serif text-4xl font-normal leading-[1.02] tracking-[-0.025em] md:text-6xl"
      >
        We couldn&rsquo;t find <span class="italic">this order</span>.
      </h1>
      <p class="mt-5 max-w-[52ch] text-[15px] leading-relaxed text-muted-foreground">
        It may belong to another account, or the link may be incomplete. Your
        orders are all listed in your profile.
      </p>
      <UiButton variant="ink" size="cta" class="mt-8 shadow-none" @click="router.push('/profiles?tab=orders')">
        View my orders
      </UiButton>
    </header>

    <div
      v-if="order"
      class="mt-10 grid grid-cols-1 gap-14 md:mt-14 lg:grid-cols-12 lg:gap-16"
    >
      <div class="space-y-14 lg:col-span-4">
        <OrderInfoCard :order="order" />

        <section aria-labelledby="order-progress-title">
          <h2
            id="order-progress-title"
            class="border-b border-foreground pb-4 font-serif text-2xl font-normal leading-snug md:text-[1.75rem]"
          >
            Progress
          </h2>

          <ol class="pt-6">
            <li
              v-for="(step, index) in timeline"
              :key="step.key"
              class="relative flex gap-4 pb-7 last:pb-0"
              :aria-current="index === currentStepIndex ? 'step' : undefined"
            >
              <span
                v-if="index < timeline.length - 1"
                class="absolute -bottom-[5px] left-[4px] top-[14px] w-px"
                :class="timeline[index + 1].state === 'pending' ? 'bg-border' : 'bg-foreground/50'"
                aria-hidden="true"
              />
              <span
                class="relative mt-[5px] size-[9px] shrink-0 rounded-full"
                :class="[
                  TIMELINE_DOTS[step.state],
                  index === currentStepIndex && step.state === 'done' && 'ring-4 ring-foreground/10',
                ]"
                aria-hidden="true"
              />
              <div class="min-w-0">
                <p
                  class="text-[12px] font-medium uppercase tracking-[0.14em]"
                  :class="TIMELINE_LABELS[step.state]"
                >
                  {{ step.label }}
                </p>
                <p class="mt-1 text-[13px] tabular-nums text-muted-foreground">
                  {{ step.at ? formatDateTime(step.at) : step.state === "pending" ? "To come" : "Date not recorded" }}
                </p>
              </div>
            </li>
          </ol>
        </section>
      </div>

      <div class="lg:col-span-8">
        <OrderItemsCard :items="order.items" />
        <OrderSummaryCard :order="order" />

        <div class="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
          <UiButton variant="ink" size="cta" class="shadow-none" @click="router.push('/')">
            Continue shopping
          </UiButton>
          <UiButton
            variant="outline"
            size="cta"
            class="bg-transparent shadow-none"
            @click="router.push('/profiles?tab=orders')"
          >
            View my orders
          </UiButton>
          <button
            v-if="canCancelOrder"
            type="button"
            class="mt-3 text-[12px] font-medium uppercase tracking-[0.14em] text-destructive transition-opacity hover:opacity-80 disabled:opacity-50 sm:ml-auto sm:mt-0"
            :disabled="cancelling"
            @click="cancelDialog = true"
          >
            <span class="ed-link">Cancel order</span>
          </button>
        </div>
        <p v-if="canCancelOrder" class="mt-3 text-[13px] text-muted-foreground sm:text-right">
          You can cancel this order until our team confirms it.
        </p>
      </div>
    </div>

    <section
      v-if="order && !STOPPED_STATUSES.includes(order.status)"
      class="mt-24 md:mt-32"
      aria-label="What happens next"
    >
      <StoreSectionHeader eyebrow="After you order" title="What happens next" />
      <ol class="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        <li v-for="(step, index) in NEXT_STEPS" :key="step" v-reveal="index * 70">
          <span class="font-serif text-3xl leading-none tabular-nums text-muted-foreground">
            {{ String(index + 1).padStart(2, "0") }}
          </span>
          <p class="mt-5 max-w-[30ch] text-[15px] leading-relaxed text-foreground/85">
            {{ step }}
          </p>
        </li>
      </ol>
    </section>

    <UiDialog v-model:open="cancelDialog">
      <UiDialogContent class="rounded-none shadow-none sm:max-w-md sm:rounded-none">
        <UiDialogHeader>
          <p class="eyebrow">Order {{ order?.orderId }}</p>
          <UiDialogTitle class="pt-2 font-serif text-2xl font-normal leading-snug">
            Cancel this order?
          </UiDialogTitle>
        </UiDialogHeader>

        <p class="text-[15px] leading-relaxed text-foreground/85">
          Are you sure you want to cancel this order?
        </p>
        <p class="border-l border-foreground pl-4 text-[13px] leading-relaxed text-muted-foreground">
          This action cannot be undone. Your payment will be refunded within
          5-7 business days.
        </p>

        <UiDialogFooter class="gap-2">
          <UiButton
            variant="ghost"
            class="text-[12px] font-medium uppercase tracking-[0.14em] shadow-none"
            :disabled="cancelling"
            @click="cancelDialog = false"
          >
            Keep order
          </UiButton>
          <UiButton
            variant="destructive"
            class="text-[12px] font-medium uppercase tracking-[0.14em] shadow-none"
            :loading="cancelling"
            @click="confirmCancelOrder"
          >
            Yes, cancel order
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
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import orderApi from "~/api/orderApi";
import { useOrderStore } from "@/stores/order";
import { useSnackbar } from "@/composables/useSnackbar";
import { buildOrderTimeline, formatDateTime } from "@/utils/orders";
import type { OrderStatus } from "@/types";

interface StatusHeader {
  lead: string;
  emphasis: string;
  subtitle: string;
}

type TimelineState = "done" | "pending" | "stopped";

interface TimelineStep {
  key: string;
  label: string;
  at?: string;
  state: TimelineState;
}

/**
 * Headline for each status, in one table rather than three parallel `switch`
 * statements that had to be kept in step by hand.
 */
const STATUS_HEADERS: Record<OrderStatus, StatusHeader> = {
  Pending: {
    lead: "Thank you, your order has been",
    emphasis: "placed",
    subtitle: "We are processing your order now.",
  },
  Paid: {
    lead: "Thank you, your payment",
    emphasis: "went through",
    subtitle: "Your order is waiting for our team to confirm it.",
  },
  Confirmed: {
    lead: "Thank you, your order is",
    emphasis: "confirmed",
    subtitle: "Your books are being prepared.",
  },
  "In Delivery": {
    lead: "Your order is",
    emphasis: "on its way",
    subtitle: "The courier has your parcel and it will be with you soon.",
  },
  Delivered: {
    lead: "Your order has been",
    emphasis: "delivered",
    subtitle: "We hope you enjoy your new books.",
  },
  Cancelled: {
    lead: "This order has been",
    emphasis: "cancelled",
    subtitle: "Nothing more will happen with it.",
  },
  Failed: {
    lead: "The payment",
    emphasis: "did not go through",
    subtitle: "Payment was not successful, so the order was not completed.",
  },
};

const FAILED_DELIVERY_HEADER: StatusHeader = {
  lead: "The delivery",
  emphasis: "could not be completed",
  subtitle: "The courier was unable to hand over this order.",
};

const FALLBACK_HEADER: StatusHeader = {
  lead: "Order",
  emphasis: "details",
  subtitle: "",
};

const STATUS_DOTS: Record<OrderStatus, string> = {
  Pending: "bg-warning",
  Paid: "bg-success",
  Confirmed: "bg-info",
  "In Delivery": "bg-info",
  Delivered: "bg-success",
  Cancelled: "bg-destructive",
  Failed: "bg-destructive",
};

const STEP_LABELS: Record<OrderStatus, string> = {
  Pending: "Order placed",
  Paid: "Payment received",
  Confirmed: "Confirmed",
  "In Delivery": "Out for delivery",
  Delivered: "Delivered",
  Cancelled: "Cancelled",
  Failed: "Payment failed",
};

const ORDER_FLOWS: Record<"prepaid" | "cod" | "ebook", OrderStatus[]> = {
  prepaid: ["Pending", "Paid", "Confirmed", "In Delivery", "Delivered"],
  cod: ["Pending", "Confirmed", "In Delivery", "Delivered", "Paid"],
  ebook: ["Pending", "Paid"],
};

const STOPPED_STATUSES: OrderStatus[] = ["Cancelled", "Failed"];

const TIMELINE_DOTS: Record<TimelineState, string> = {
  done: "bg-foreground",
  pending: "border border-foreground/40 bg-background",
  stopped: "bg-destructive",
};

const TIMELINE_LABELS: Record<TimelineState, string> = {
  done: "text-foreground",
  pending: "text-muted-foreground",
  stopped: "text-destructive",
};

const NEXT_STEPS = [
  "You will receive an email confirmation shortly.",
  "Our team will review and confirm your order.",
  "Your order is processed once it has been confirmed.",
  "Follow its progress at any time under My orders in your profile.",
];

const route = useRoute();
const router = useRouter();

const orderStore = useOrderStore();
const { order } = storeToRefs(orderStore);

const { snackbar, notify, notifyError } = useSnackbar();

const cancelDialog = ref(false);
const cancelling = ref(false);
const loaded = ref(false);

const header = computed<StatusHeader>(() => {
  if (!order.value) return FALLBACK_HEADER;
  if (order.value.status === "Failed" && order.value.paymentMethod === "COD") {
    return FAILED_DELIVERY_HEADER;
  }
  return STATUS_HEADERS[order.value.status] ?? FALLBACK_HEADER;
});

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

const timeline = computed<TimelineStep[]>(() => {
  const current = order.value;
  if (!current) return [];

  const isCod = current.paymentMethod === "COD";
  const labelFor = (status: OrderStatus) =>
    status === "Failed" && isCod ? "Delivery failed" : STEP_LABELS[status] ?? status;

  const recorded: TimelineStep[] = buildOrderTimeline(current).map((entry, index) => ({
    key: `${entry.status}-${entry.at ?? index}`,
    label: labelFor(entry.status),
    at: entry.at,
    state: STOPPED_STATUSES.includes(entry.status) ? "stopped" : "done",
  }));

  if (STOPPED_STATUSES.includes(current.status)) return recorded;

  const flow = isEbookOnly.value ? ORDER_FLOWS.ebook : isCod ? ORDER_FLOWS.cod : ORDER_FLOWS.prepaid;
  const position = flow.indexOf(current.status);
  if (position === -1) return recorded;

  const reached = new Set(buildOrderTimeline(current).map((entry) => entry.status));
  const upcoming: TimelineStep[] = flow
    .slice(position + 1)
    .filter((status) => !reached.has(status))
    .map((status) => ({ key: `upcoming-${status}`, label: labelFor(status), state: "pending" }));

  return [...recorded, ...upcoming];
});

const currentStepIndex = computed(() => {
  const steps = timeline.value;
  for (let index = steps.length - 1; index >= 0; index--) {
    if (steps[index].state !== "pending") return index;
  }
  return -1;
});

onMounted(getOrder);

async function getOrder() {
  try {
    await orderStore.fetchOrderById(route.params.id as string);
  } catch (error) {
    console.error("Error fetching order:", error);
  } finally {
    loaded.value = true;
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
