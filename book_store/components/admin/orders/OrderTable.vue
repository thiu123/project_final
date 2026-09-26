<template>
  <div class="overflow-x-auto">
    <table class="admin-table">
      <thead>
        <tr>
          <th>Order</th>
          <th>Customer</th>
          <th>Payment</th>
          <th>Status</th>
          <th class="!text-right">Total</th>
          <th class="!text-right">Update status</th>
          <th class="w-px"><span class="sr-only">Actions</span></th>
        </tr>
      </thead>

      <tbody>
        <AdminTableSkeleton v-if="loading" :columns="7" />

        <template v-else>
          <tr v-for="order in orders" :key="order._id">
            <td class="whitespace-nowrap">
              <button
                type="button"
                class="font-mono text-[13px] font-medium text-foreground hover:underline"
                @click="emit('view', order)"
              >
                {{ order.orderId }}
              </button>
              <div class="text-xs text-muted-foreground">
                {{ formatDateTime(order.createdAt) }}
              </div>
            </td>

            <td>
              <div class="max-w-[220px] truncate font-medium">
                {{ orderUser(order)?.username || "Guest" }}
              </div>
              <div class="max-w-[220px] truncate text-xs text-muted-foreground">
                {{ orderUser(order)?.email || "No email" }}
              </div>
            </td>

            <td class="whitespace-nowrap">
              <span class="inline-flex items-center gap-1.5 text-sm text-foreground">
                <component
                  :is="paymentMethodIcon(order.paymentMethod)"
                  class="h-4 w-4 text-muted-foreground"
                />
                {{ order.paymentMethod }}
              </span>
            </td>

            <td>
              <AdminPill :status="order.status">{{ order.status }}</AdminPill>
            </td>

            <td class="whitespace-nowrap text-right">
              <div class="font-medium">{{ formatVnd(order.total) }}</div>
              <div class="text-xs text-muted-foreground">
                {{ order.items.length }}
                {{ order.items.length === 1 ? "item" : "items" }}
              </div>
            </td>

            <td class="text-right">
              <UiSelect
                :model-value="order.status"
                :disabled="!transitionsFor(order).length"
                @update:model-value="
                  (status) => emit('update-status', order, status as OrderStatus)
                "
              >
                <UiSelectTrigger
                  class="ml-auto h-8 w-36 bg-background text-xs"
                  :aria-label="`Update status of ${order.orderId}`"
                >
                  <!-- Label rendered here rather than resolved from the
                       item list: reka-ui records an item's value once, when
                       it mounts, so after a status change the trigger would
                       come up blank. -->
                  <UiSelectValue>
                    {{ transitionsFor(order).length ? "Move to..." : "Final" }}
                  </UiSelectValue>
                </UiSelectTrigger>
                <UiSelectContent>
                  <!-- The current status is listed so the menu shows where
                       the order stands; everything else is what it may
                       legally become next. Keyed on the status so a change
                       remounts the item instead of mutating its value in
                       place, which would leave a stale entry behind. -->
                  <UiSelectItem :key="order.status" :value="order.status" disabled>
                    {{ order.status }} (current)
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
            </td>

            <td>
              <UiButton
                variant="ghost"
                size="iconSm"
                class="text-muted-foreground hover:text-foreground"
                aria-label="View order details"
                title="View details"
                @click="emit('view', order)"
              >
                <Eye class="h-4 w-4" />
              </UiButton>
            </td>
          </tr>

          <tr v-if="!orders.length" class="hover:bg-transparent">
            <td colspan="7">
              <AdminEmptyState
                :icon="Package"
                title="No orders match"
                description="Try a different search or clear the status and payment filters."
              />
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { Eye, Package } from "lucide-vue-next";
import { allowedTransitions, paymentMethodIcon } from "@/utils/orderStatus";
import { formatDateTime, formatVnd, orderUser } from "@/utils/orders";
import type { Order, OrderStatus } from "@/types";

defineProps<{
  orders: Order[];
  loading: boolean;
}>();

const emit = defineEmits<{
  view: [order: Order];
  "update-status": [order: Order, status: OrderStatus];
}>();

function transitionsFor(order: Order) {
  return allowedTransitions(order.paymentMethod, order.status);
}
</script>
