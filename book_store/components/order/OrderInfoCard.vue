<template>
  <UiCard class="mb-6 overflow-hidden rounded-lg shadow">
    <div class="flex items-center bg-muted/60 p-5">
      <ReceiptText class="mr-3 h-7 w-7 text-primary" />
      <span class="text-2xl font-bold">Order Details</span>
    </div>

    <UiSeparator />

    <div class="p-6">
      <div class="grid grid-cols-12 gap-2">
        <div class="col-span-12 sm:col-span-6 md:col-span-4">
          <OrderInfoTile label="Order ID" tone="blue">
            <span class="text-lg font-semibold">{{ order.orderId }}</span>
          </OrderInfoTile>
        </div>

        <div class="col-span-12 sm:col-span-6 md:col-span-4">
          <OrderInfoTile label="Order Date" tone="purple">
            {{ formatDate(order.createdAt) }}
          </OrderInfoTile>
        </div>

        <div class="col-span-12 sm:col-span-6 md:col-span-4">
          <OrderInfoTile label="Payment Method" tone="orange">
            {{ order.paymentMethod }}
          </OrderInfoTile>
        </div>

        <div class="col-span-12 sm:col-span-6 md:col-span-4">
          <OrderInfoTile label="Status" tone="green">
            <UiBadge
              :variant="orderStatusVariant(order.status)"
              :class="['mt-1 font-bold', orderStatusClass(order.status)]"
            >
              {{ order.status }}
            </UiBadge>
          </OrderInfoTile>
        </div>

        <div v-if="order.shipping" class="col-span-12">
          <OrderInfoTile label="Delivering To" tone="sky">
            <div class="text-base font-bold">
              {{ order.shipping.fullName }} · {{ order.shipping.phone }}
            </div>
            <div class="mt-1 text-sm opacity-80">
              {{ order.shipping.address }}
            </div>
            <div v-if="order.shipping.note" class="mt-1 text-sm italic opacity-70">
              Note: {{ order.shipping.note }}
            </div>
          </OrderInfoTile>
        </div>
      </div>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
import { ReceiptText } from "lucide-vue-next";
import { orderStatusClass, orderStatusVariant } from "@/utils/orderStatus";
import type { Order } from "@/types";

defineProps<{ order: Order }>();

function formatDate(dateString?: string) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>
