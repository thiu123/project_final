<template>
  <UiDialog v-model:open="open">
    <UiDialogContent hide-close class="gap-0 overflow-hidden p-0 sm:max-w-4xl">
      <div
        class="flex items-start justify-between gap-4 border-b border-border px-6 py-4"
      >
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2.5">
            <UiDialogTitle class="font-mono text-lg font-semibold text-foreground">
              {{ order?.orderId }}
            </UiDialogTitle>
            <AdminPill v-if="order" :status="order.status">{{ order.status }}</AdminPill>
          </div>
          <UiDialogDescription class="mt-0.5 text-sm text-muted-foreground">
            Placed {{ formatDateTime(order?.createdAt) }} via {{ order?.paymentMethod }}
          </UiDialogDescription>
        </div>
        <button
          type="button"
          class="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close"
          @click="open = false"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <div v-if="order" class="max-h-[72vh] overflow-y-auto">
        <div class="grid grid-cols-1 lg:grid-cols-[1fr_300px]">
          <div class="min-w-0 border-border p-6 lg:border-r">
            <h3 class="text-sm font-semibold text-foreground">
              Items
              <span class="font-normal text-muted-foreground">
                ({{ order.items.length }})
              </span>
            </h3>

            <ul class="mt-3 divide-y divide-border rounded-lg border border-border">
              <li
                v-for="(item, index) in order.items"
                :key="item._id ?? index"
                class="flex items-center gap-3 px-4 py-3"
              >
                <div
                  class="flex h-14 w-10 shrink-0 items-center justify-center overflow-hidden rounded bg-muted ring-1 ring-inset ring-border"
                >
                  <img
                    v-if="item.bookId?.cover_url"
                    :src="item.bookId.cover_url"
                    :alt="item.bookId?.title || 'Book cover'"
                    class="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <BookOpen v-else class="h-4 w-4 text-muted-foreground" />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="line-clamp-1 text-sm font-medium text-foreground">
                    {{ item.bookId?.title || "Unavailable book" }}
                  </div>
                  <div class="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                    <span>{{ item.bookId?.authors?.[0] || "Unknown author" }}</span>
                    <span class="inline-flex items-center gap-1">
                      <component
                        :is="item.productType === 'ebook' ? Tablet : BookCopy"
                        class="h-3 w-3"
                      />
                      {{ item.productType === "ebook" ? "Ebook" : "Hardcover" }}
                    </span>
                  </div>
                </div>
                <div class="shrink-0 text-right text-sm tabular-nums">
                  <div class="font-medium text-foreground">
                    {{ formatUsd(lineTotal(item)) }}
                  </div>
                  <div class="text-xs text-muted-foreground">Qty {{ item.quantity }}</div>
                </div>
              </li>
            </ul>

            <dl class="mt-4 space-y-2 text-sm tabular-nums">
              <div class="flex justify-between">
                <dt class="text-muted-foreground">Subtotal</dt>
                <dd class="text-foreground">{{ formatVnd(orderSubtotalVnd(order)) }}</dd>
              </div>
              <div v-if="order.voucher" class="flex justify-between">
                <dt class="text-muted-foreground">
                  Discount
                  <span
                    v-if="order.voucher.code"
                    class="ml-1 rounded border border-dashed border-border px-1.5 py-0.5 font-mono text-[11px] text-foreground"
                  >
                    {{ order.voucher.code }}
                  </span>
                </dt>
                <dd class="text-success">-{{ formatVnd(order.voucher.discountAmount) }}</dd>
              </div>
              <div class="flex justify-between border-t border-border pt-2 text-base font-semibold">
                <dt class="text-foreground">Total</dt>
                <dd class="text-foreground">{{ formatVnd(order.total) }}</dd>
              </div>
            </dl>

            <div class="mt-6">
              <AdminOrdersOrderTimeline :order="order" />
            </div>
          </div>

          <aside class="space-y-6 border-t border-border bg-muted/20 p-6 lg:border-t-0">
            <section>
              <h3 class="text-sm font-semibold text-foreground">Customer</h3>
              <div class="mt-3 flex items-center gap-3">
                <UserAvatar
                  :src="orderUser(order)?.avatar_url"
                  :name="orderUser(order)?.username"
                  class="size-9 shrink-0"
                />
                <div class="min-w-0 text-sm">
                  <div class="truncate font-medium text-foreground">
                    {{ orderUser(order)?.username || "Guest" }}
                  </div>
                  <a
                    v-if="orderUser(order)?.email"
                    :href="`mailto:${orderUser(order)?.email}`"
                    class="block truncate text-primary hover:underline"
                  >
                    {{ orderUser(order)?.email }}
                  </a>
                </div>
              </div>
            </section>

            <section v-if="order.shipping">
              <h3 class="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Truck class="h-4 w-4 text-muted-foreground" />
                Delivery
              </h3>
              <address class="mt-3 space-y-1 text-sm not-italic text-muted-foreground">
                <div class="font-medium text-foreground">{{ order.shipping.fullName }}</div>
                <div>{{ order.shipping.address }}</div>
                <a
                  :href="`tel:${order.shipping.phone}`"
                  class="inline-block font-medium text-primary hover:underline"
                >
                  {{ order.shipping.phone }}
                </a>
              </address>
              <p
                v-if="order.shipping.note"
                class="mt-3 rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground"
              >
                {{ order.shipping.note }}
              </p>
            </section>

            <section>
              <h3 class="flex items-center gap-2 text-sm font-semibold text-foreground">
                <component
                  :is="paymentMethodIcon(order.paymentMethod)"
                  class="h-4 w-4 text-muted-foreground"
                />
                Payment
              </h3>
              <dl class="mt-3 space-y-1.5 text-sm">
                <div class="flex justify-between gap-3">
                  <dt class="text-muted-foreground">Method</dt>
                  <dd class="text-foreground">{{ order.paymentMethod }}</dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt class="text-muted-foreground">Settled</dt>
                  <dd class="text-foreground">{{ isPaidFor(order) ? "Yes" : "Not yet" }}</dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>
      </div>

      <div class="flex justify-end border-t border-border bg-muted/30 px-6 py-3">
        <UiButton variant="outline" @click="open = false">Close</UiButton>
      </div>
    </UiDialogContent>
  </UiDialog>
</template>

<script setup lang="ts">
import { BookCopy, BookOpen, Tablet, Truck, X } from "lucide-vue-next";
import { isPaidFor, paymentMethodIcon } from "@/utils/orderStatus";
import { formatDateTime, formatVnd, orderUser } from "@/utils/orders";
import { formatUsd, lineTotal, orderSubtotalVnd } from "@/utils/pricing";
import type { Order } from "@/types";

defineProps<{ order: Order | null }>();

const open = defineModel<boolean>("open", { default: false });
</script>
