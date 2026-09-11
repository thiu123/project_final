<template>
  <div class="min-h-[80vh]">
    <ProfilesTabsSectionHeading :icon="Package" title="Order History" />

    <ProfilesTabsLoadingState v-if="loading" label="Loading orders..." />

    <div v-else-if="placedOrders.length">
      <div
        v-for="order in placedOrders"
        :key="order._id"
        class="mb-6 overflow-hidden rounded-xl bg-gradient-to-br from-white to-[#f8f9fa] shadow transition-all duration-300 hover:shadow-lg dark:from-card dark:to-card"
      >
        <div class="p-8">
          <div class="mb-6 flex items-center justify-between">
            <div>
              <h3 class="mb-2 text-2xl font-bold text-foreground">
                Order #{{ order.orderId }}
              </h3>
              <p class="flex items-center text-sm text-muted-foreground">
                <Calendar class="mr-1 h-4 w-4" />
                {{ formatDate(order.createdAt) }}
              </p>
            </div>
            <UiBadge
              :variant="orderStatusVariant(order.status)"
              class="px-3 py-1 text-sm font-bold"
              :class="orderStatusClass(order.status)"
            >
              <component :is="orderStatusIcon(order.status)" class="mr-1 h-4 w-4" />
              {{ order.status }}
            </UiBadge>
          </div>

          <UiSeparator class="mb-6" />

          <div
            v-for="item in order.items"
            :key="item._id"
            class="mb-4 flex items-center rounded-lg bg-waterblue/5 p-4"
          >
            <img
              :src="item.bookId?.cover_url"
              :alt="item.bookId?.title || 'Book cover'"
              class="mr-4 h-20 w-[60px] shrink-0 rounded-lg bg-muted object-cover shadow"
              loading="lazy"
            />
            <div class="grow">
              <h4 class="mb-1 text-base font-bold text-foreground">
                {{ item.bookId?.title || "Unknown Book" }}
              </h4>
              <p class="text-sm text-muted-foreground">
                Quantity: {{ item.quantity }}
              </p>
            </div>
            <p class="text-lg font-bold text-waterblue">
              {{ formatUsd(lineTotal(item)) }}
            </p>
          </div>

          <UiSeparator class="my-6" />

          <div class="mb-4">
            <div class="mb-2 flex justify-between">
              <span class="text-sm text-muted-foreground">Subtotal</span>
              <span class="text-base font-medium">
                {{ formatVndAsUsd(orderSubtotalVnd(order)) }}
              </span>
            </div>

            <div
              v-if="order.voucher?.code"
              class="mb-2 flex items-center justify-between rounded bg-success/10 p-2"
            >
              <div class="flex items-center">
                <TicketPercent class="mr-2 h-4 w-4 shrink-0 text-success" />
                <span class="text-sm text-muted-foreground">Discount</span>
                <UiBadge variant="success" class="ml-2 px-1.5 py-0 text-[10px]">
                  {{ order.voucher.code }}
                </UiBadge>
              </div>
              <span class="text-base font-bold text-success">
                -{{ formatVndAsUsd(order.voucher.discountAmount) }}
              </span>
            </div>

            <UiSeparator class="my-2" />
            <div class="flex items-center justify-between">
              <span class="text-lg font-bold text-foreground">Total</span>
              <span class="text-2xl font-bold text-waterblue">
                {{ formatVndAsUsd(order.total) }}
              </span>
            </div>
          </div>

          <UiButton
            tag="NuxtLink"
            :to="`/order/status/${order.orderId}`"
            variant="outline"
            size="lg"
            class="rounded-lg border-waterblue font-bold text-waterblue hover:bg-waterblue/10 hover:text-waterblue"
          >
            <Eye class="mr-2 h-5 w-5" />
            View Details
          </UiButton>
        </div>
      </div>
    </div>

    <ProfilesTabsEmptyState
      v-else
      :icon="Package"
      title="No orders yet"
      :action-icon="ShoppingBag"
      action-label="Start Shopping"
    >
      You haven't placed any orders yet. Start shopping to see your order history
      here.
    </ProfilesTabsEmptyState>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import {
  Calendar,
  Eye,
  Package,
  ShoppingBag,
  TicketPercent,
} from "lucide-vue-next";
import { useOrderStore } from "@/stores/order";
import {
  orderStatusClass,
  orderStatusIcon,
  orderStatusVariant,
} from "@/utils/orderStatus";
import {
  formatUsd,
  formatVndAsUsd,
  lineTotal,
  orderSubtotalVnd,
} from "@/utils/pricing";

defineProps<{ loading: boolean }>();

const orderStore = useOrderStore();
const { userOrders } = storeToRefs(orderStore);

/** Pending orders have not been paid for, so they are not history yet. */
const placedOrders = computed(() =>
  userOrders.value.filter((order) => order.status !== "Pending")
);

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleDateString() : "";
}
</script>
