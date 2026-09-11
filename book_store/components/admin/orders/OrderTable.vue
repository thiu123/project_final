<template>
  <UiCard class="rounded-2xl">
    <div class="overflow-x-auto rounded-2xl">
      <table class="w-full text-sm">
        <thead class="bg-muted/60 text-left">
          <tr>
            <th
              v-for="column in COLUMNS"
              :key="column"
              class="px-4 py-3 font-medium text-muted-foreground"
              :class="column === 'Actions' && 'text-center'"
            >
              {{ column }}
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-border">
          <tr v-if="loading">
            <td :colspan="COLUMNS.length" class="px-4 py-8 text-center">
              <UiSpinner size="lg" class="mx-auto text-waterblue" />
            </td>
          </tr>

          <template v-else>
            <tr v-for="order in orders" :key="order._id" class="hover:bg-muted/40">
              <td class="px-4 py-3">
                <div class="flex items-center">
                  <Package class="mr-2 h-4 w-4 text-muted-foreground" />
                  <span class="font-medium">{{ order.orderId }}</span>
                </div>
              </td>

              <td class="px-4 py-3">
                <div class="font-medium">
                  {{ orderUser(order)?.username || "N/A" }}
                </div>
                <div class="text-xs text-muted-foreground">
                  {{ orderUser(order)?.email || "N/A" }}
                </div>
              </td>

              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center rounded-full bg-waterblue/15 px-2.5 py-0.5 text-xs font-semibold text-waterblue"
                >
                  {{ order.items.length }} item(s)
                </span>
              </td>

              <td class="px-4 py-3">
                <div class="font-bold">{{ formatVnd(order.total) }}</div>
              </td>

              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                  :class="paymentMethodClass(order.paymentMethod)"
                >
                  <component
                    :is="paymentMethodIcon(order.paymentMethod)"
                    class="h-3.5 w-3.5"
                  />
                  {{ order.paymentMethod }}
                </span>
              </td>

              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  :class="orderStatusClass(order.status)"
                >
                  <component :is="orderStatusIcon(order.status)" class="h-3.5 w-3.5" />
                  {{ order.status }}
                </span>
              </td>

              <td class="px-4 py-3">
                <div class="text-xs">{{ formatDateTime(order.createdAt) }}</div>
              </td>

              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-2">
                  <UiSelect
                    :model-value="order.status"
                    :disabled="!transitionsFor(order).length"
                    @update:model-value="
                      (status) => emit('update-status', order, status as OrderStatus)
                    "
                  >
                    <UiSelectTrigger class="w-36">
                      <UiSelectValue />
                    </UiSelectTrigger>
                    <UiSelectContent>
                      <!-- The current status is listed so the trigger has a
                           label; everything else is what this order may legally
                           become next. -->
                      <UiSelectItem :value="order.status" disabled>
                        {{ order.status }}
                      </UiSelectItem>
                      <UiSelectItem
                        v-for="option in transitionsFor(order)"
                        :key="option"
                        :value="option"
                      >
                        {{ option }}
                      </UiSelectItem>
                    </UiSelectContent>
                  </UiSelect>

                  <UiTooltipProvider :delay-duration="200">
                    <UiTooltip>
                      <UiTooltipTrigger as-child>
                        <UiButton
                          variant="ghost"
                          size="iconSm"
                          class="text-primary"
                          aria-label="View order details"
                          @click="emit('view', order)"
                        >
                          <Eye class="h-5 w-5" />
                        </UiButton>
                      </UiTooltipTrigger>
                      <UiTooltipContent side="top">View Details</UiTooltipContent>
                    </UiTooltip>
                  </UiTooltipProvider>
                </div>
              </td>
            </tr>

            <tr v-if="!orders.length">
              <td
                :colspan="COLUMNS.length"
                class="px-4 py-8 text-center text-muted-foreground"
              >
                No orders found
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div
      v-if="total > itemsPerPage"
      class="flex justify-center border-t border-border py-3"
    >
      <UiPagination
        v-slot="{ page: currentPage }"
        v-model:page="page"
        :total="total"
        :items-per-page="itemsPerPage"
        :sibling-count="1"
        show-edges
      >
        <UiPaginationContent v-slot="{ items }">
          <UiPaginationPrevious />
          <template v-for="(item, index) in items">
            <UiPaginationItem
              v-if="item.type === 'page'"
              :key="index"
              :value="item.value"
              :is-active="item.value === currentPage"
            >
              {{ item.value }}
            </UiPaginationItem>
            <UiPaginationEllipsis v-else :key="item.type" :index="index" />
          </template>
          <UiPaginationNext />
        </UiPaginationContent>
      </UiPagination>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
import { Eye, Package } from "lucide-vue-next";
import {
  allowedTransitions,
  orderStatusClass,
  orderStatusIcon,
  paymentMethodClass,
  paymentMethodIcon,
} from "@/utils/orderStatus";
import { formatDateTime, formatVnd, orderUser } from "@/utils/orders";
import type { Order, OrderStatus } from "@/types";

const COLUMNS = [
  "Order ID",
  "Customer",
  "Items",
  "Total",
  "Payment",
  "Status",
  "Date",
  "Actions",
];

defineProps<{
  orders: Order[];
  loading: boolean;
  /** Row count across all pages, for the pager. */
  total: number;
  itemsPerPage: number;
}>();

const emit = defineEmits<{
  view: [order: Order];
  "update-status": [order: Order, status: OrderStatus];
}>();

const page = defineModel<number>("page", { required: true });

function transitionsFor(order: Order) {
  return allowedTransitions(order.paymentMethod, order.status);
}
</script>
