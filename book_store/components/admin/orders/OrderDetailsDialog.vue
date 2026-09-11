<template>
  <UiDialog v-model:open="open">
    <UiDialogContent class="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
      <UiDialogHeader>
        <UiDialogTitle class="flex items-center gap-2">
          <Package class="h-5 w-5 text-waterblue" />
          <span>Order Details - {{ order?.orderId }}</span>
        </UiDialogTitle>
      </UiDialogHeader>

      <div v-if="order" class="grid grid-cols-12 gap-4">
        <!-- Order information -->
        <div class="col-span-12 md:col-span-6">
          <AdminOrdersDetailPanel :icon="Info" title="Order Information">
            <AdminOrdersDetailRow :icon="Hash" label="Order ID">
              {{ order.orderId }}
            </AdminOrdersDetailRow>
            <AdminOrdersDetailRow :icon="Banknote" label="Payment Method">
              {{ order.paymentMethod }}
            </AdminOrdersDetailRow>
            <AdminOrdersDetailRow :icon="Tag" label="Status">
              <span
                class="mt-0.5 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                :class="orderStatusClass(order.status)"
              >
                {{ order.status }}
              </span>
            </AdminOrdersDetailRow>
            <AdminOrdersDetailRow :icon="Calendar" label="Order Date">
              {{ formatDateTime(order.createdAt) }}
            </AdminOrdersDetailRow>
          </AdminOrdersDetailPanel>
        </div>

        <!-- Customer -->
        <div class="col-span-12 md:col-span-6">
          <AdminOrdersDetailPanel :icon="UserIcon" title="Customer Information">
            <AdminOrdersDetailRow :icon="UserIcon" label="Username">
              {{ orderUser(order)?.username || "N/A" }}
            </AdminOrdersDetailRow>
            <AdminOrdersDetailRow :icon="Mail" label="Email">
              {{ orderUser(order)?.email || "N/A" }}
            </AdminOrdersDetailRow>
          </AdminOrdersDetailPanel>
        </div>

        <!-- Delivery details: what the courier needs. COD orders always carry
             this; prepaid ones predate the form. -->
        <div v-if="order.shipping" class="col-span-12">
          <div class="rounded-lg border border-primary/50 bg-primary/5">
            <div class="flex items-center gap-2 px-4 pt-4 text-base font-bold">
              <Truck class="h-5 w-5 text-primary" />
              Delivery Details
            </div>
            <div class="grid gap-3 p-4 sm:grid-cols-2">
              <div>
                <p class="text-sm font-medium">Recipient</p>
                <p class="text-sm text-muted-foreground">
                  {{ order.shipping.fullName }}
                </p>
              </div>
              <div>
                <p class="text-sm font-medium">Phone</p>
                <a
                  :href="`tel:${order.shipping.phone}`"
                  class="text-sm font-semibold text-primary hover:underline"
                >
                  {{ order.shipping.phone }}
                </a>
              </div>
              <div class="sm:col-span-2">
                <p class="text-sm font-medium">Address</p>
                <p class="text-sm text-muted-foreground">
                  {{ order.shipping.address }}
                </p>
              </div>
              <div v-if="order.shipping.note" class="sm:col-span-2">
                <p class="text-sm font-medium">Note</p>
                <p class="text-sm italic text-muted-foreground">
                  {{ order.shipping.note }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Voucher -->
        <div v-if="order.voucher?.code" class="col-span-12">
          <div class="rounded-lg border border-success/50 bg-success/5">
            <div class="flex items-center gap-2 px-4 pt-4 text-base font-bold">
              <TicketPercent class="h-5 w-5 text-success" />
              Voucher Applied
            </div>
            <div class="flex items-center justify-between p-4">
              <span
                class="inline-flex items-center rounded-full bg-success px-2.5 py-0.5 text-xs font-semibold text-success-foreground"
              >
                {{ order.voucher.code }}
              </span>
              <div class="text-lg font-semibold text-success">
                -{{ formatVnd(order.voucher.discountAmount) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Items -->
        <div class="col-span-12">
          <div class="rounded-lg border border-border">
            <div class="flex items-center gap-2 px-4 pt-4 text-base font-bold">
              <ShoppingCart class="h-5 w-5" />
              Order Items
            </div>
            <div class="overflow-x-auto pt-2">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-border text-left">
                    <th class="px-4 py-2 font-medium text-muted-foreground">Book</th>
                    <th class="px-4 py-2 font-medium text-muted-foreground">Type</th>
                    <th class="px-4 py-2 text-center font-medium text-muted-foreground">
                      Quantity
                    </th>
                    <th class="px-4 py-2 text-right font-medium text-muted-foreground">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border">
                  <tr v-for="(item, index) in order.items" :key="item._id ?? index">
                    <td class="px-4">
                      <div class="flex items-center py-2">
                        <img
                          :src="item.bookId?.cover_url"
                          :alt="item.bookId?.title || 'Book cover'"
                          class="mr-3 h-[60px] w-10 rounded bg-muted object-cover"
                          loading="lazy"
                        />
                        <div>
                          <div class="font-medium">
                            {{ item.bookId?.title || "N/A" }}
                          </div>
                          <div class="text-xs text-muted-foreground">
                            {{ item.bookId?.authors?.[0] || "Unknown" }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-2">
                      <span
                        class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        :class="
                          item.productType === 'ebook'
                            ? 'bg-success/15 text-success'
                            : 'bg-waterblue/15 text-waterblue'
                        "
                      >
                        {{ item.productType === "ebook" ? "📱 Ebook" : "📚 Hardbook" }}
                      </span>
                    </td>
                    <td class="px-4 py-2 text-center">{{ item.quantity }}</td>
                    <td class="px-4 py-2 text-right font-medium">
                      {{ formatUsd(lineTotal(item)) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="col-span-12">
          <div class="rounded-lg border border-waterblue/50 bg-waterblue/5 p-4">
            <div class="mb-2 flex items-center justify-between">
              <span class="text-base font-medium">Subtotal:</span>
              <span class="text-base font-medium">
                {{ formatVnd(orderSubtotalVnd(order)) }}
              </span>
            </div>
            <div
              v-if="order.voucher"
              class="mb-2 flex items-center justify-between"
            >
              <span class="text-base font-medium text-success">Discount:</span>
              <span class="text-base font-medium text-success">
                -{{ formatVnd(order.voucher.discountAmount) }}
              </span>
            </div>
            <UiSeparator class="my-2" />
            <div class="flex items-center justify-between">
              <span class="text-lg font-bold">Total:</span>
              <span class="text-lg font-bold text-waterblue">
                {{ formatVnd(order.total) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <UiDialogFooter>
        <UiButton
          variant="ghost"
          class="text-muted-foreground"
          @click="open = false"
        >
          Close
        </UiButton>
      </UiDialogFooter>
    </UiDialogContent>
  </UiDialog>
</template>

<script setup lang="ts">
import {
  Banknote,
  Calendar,
  Hash,
  Info,
  Mail,
  Package,
  ShoppingCart,
  Tag,
  TicketPercent,
  Truck,
  User as UserIcon,
} from "lucide-vue-next";
import { orderStatusClass } from "@/utils/orderStatus";
import { formatDateTime, formatVnd, orderUser } from "@/utils/orders";
import { formatUsd, lineTotal, orderSubtotalVnd } from "@/utils/pricing";
import type { Order } from "@/types";

defineProps<{ order: Order | null }>();

const open = defineModel<boolean>("open", { default: false });
</script>
