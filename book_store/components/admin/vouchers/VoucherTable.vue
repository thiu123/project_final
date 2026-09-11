<template>
  <div class="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
    <UiProgress v-if="loading" indeterminate class="h-1 rounded-none" />

    <div class="overflow-x-auto">
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
          <tr v-for="voucher in vouchers" :key="voucher._id" class="hover:bg-muted/40">
            <td class="px-4 py-3">
              <UiBadge
                class="border-transparent bg-foreground font-bold text-background"
              >
                {{ voucher.code }}
              </UiBadge>
            </td>

            <td class="px-4 py-3">
              <UiBadge
                class="border-transparent"
                :class="
                  voucher.discountType === 'percentage'
                    ? 'bg-purple-500/15 text-purple-600 dark:text-purple-300'
                    : 'bg-orange-500/15 text-orange-600 dark:text-orange-300'
                "
              >
                {{
                  voucher.discountType === "percentage"
                    ? "Percentage"
                    : "Fixed Amount"
                }}
              </UiBadge>
            </td>

            <td class="px-4 py-3">
              <span class="text-lg font-bold">{{ formatDiscount(voucher) }}</span>
            </td>

            <td class="px-4 py-3">
              <span class="text-sm">${{ voucher.minOrderAmount }}</span>
            </td>

            <td class="px-4 py-3">
              <span class="text-sm">
                {{ voucher.maxDiscount ? `$${voucher.maxDiscount}` : "No limit" }}
              </span>
            </td>

            <td class="px-4 py-3">
              <UiBadge class="border-transparent" :class="usageClass(voucher)">
                {{ voucher.usedCount ?? 0 }} / {{ voucher.usageLimit || "∞" }}
              </UiBadge>
            </td>

            <td class="px-4 py-3">
              <div class="text-sm">{{ formatVoucherDate(voucher.expiryDate) }}</div>
              <UiBadge
                v-if="isExpired(voucher.expiryDate)"
                class="mt-1 border-transparent bg-destructive/15 text-destructive"
              >
                Expired
              </UiBadge>
              <UiBadge
                v-else-if="isExpiringSoon(voucher.expiryDate)"
                class="mt-1 border-transparent bg-warning/15 text-warning"
              >
                Expiring Soon
              </UiBadge>
            </td>

            <td class="px-4 py-3">
              <UiSwitch
                :model-value="voucher.isActive"
                @update:model-value="emit('toggle-active', voucher, $event)"
              />
            </td>

            <td class="px-4 py-3">
              <UiTooltipProvider :delay-duration="200">
                <div class="flex justify-center gap-2">
                  <UiTooltip>
                    <UiTooltipTrigger as-child>
                      <UiButton
                        variant="ghost"
                        size="iconSm"
                        class="text-primary hover:text-primary"
                        aria-label="Edit voucher"
                        @click="emit('edit', voucher)"
                      >
                        <Pencil class="h-4 w-4" />
                      </UiButton>
                    </UiTooltipTrigger>
                    <UiTooltipContent>Edit</UiTooltipContent>
                  </UiTooltip>

                  <UiTooltip>
                    <UiTooltipTrigger as-child>
                      <UiButton
                        variant="ghost"
                        size="iconSm"
                        class="text-destructive hover:text-destructive"
                        aria-label="Delete voucher"
                        @click="emit('delete', voucher)"
                      >
                        <Trash2 class="h-4 w-4" />
                      </UiButton>
                    </UiTooltipTrigger>
                    <UiTooltipContent>Delete</UiTooltipContent>
                  </UiTooltip>
                </div>
              </UiTooltipProvider>
            </td>
          </tr>

          <tr v-if="!vouchers.length">
            <td
              :colspan="COLUMNS.length"
              class="px-4 py-8 text-center text-muted-foreground"
            >
              {{ loading ? "Loading vouchers..." : "No data available" }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      class="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4"
    >
      <div class="text-sm text-muted-foreground">
        Showing {{ vouchers.length }} of {{ total }} vouchers
      </div>

      <UiPagination
        v-slot="{ page: currentPage }"
        v-model:page="page"
        :total="total"
        :items-per-page="itemsPerPage"
        :sibling-count="1"
        show-edges
        class="mx-0 w-auto justify-end"
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
  </div>
</template>

<script setup lang="ts">
import { Pencil, Trash2 } from "lucide-vue-next";
import {
  formatDiscount,
  formatVoucherDate,
  isExpired,
  isExpiringSoon,
  usageClass,
} from "@/utils/vouchers";
import type { Voucher } from "@/types";

const COLUMNS = [
  "Code",
  "Type",
  "Value",
  "Min Order",
  "Max Discount",
  "Usage",
  "Expiry Date",
  "Active",
  "Actions",
];

defineProps<{
  vouchers: Voucher[];
  loading: boolean;
  /** Row count across all pages, for the pager. */
  total: number;
  itemsPerPage: number;
}>();

const emit = defineEmits<{
  edit: [voucher: Voucher];
  delete: [voucher: Voucher];
  "toggle-active": [voucher: Voucher, active: boolean];
}>();

const page = defineModel<number>("page", { required: true });
</script>
