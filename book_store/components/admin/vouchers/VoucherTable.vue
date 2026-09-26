<template>
  <div class="overflow-x-auto">
    <table class="admin-table">
      <thead>
        <tr>
          <th>Code</th>
          <th>Discount</th>
          <th class="!text-right">Min. order</th>
          <th>Usage</th>
          <th>Expires</th>
          <th>Active</th>
          <th class="w-px"><span class="sr-only">Actions</span></th>
        </tr>
      </thead>

      <tbody>
        <AdminTableSkeleton v-if="loading" :columns="7" />

        <template v-else>
          <tr v-for="voucher in vouchers" :key="voucher._id">
            <td>
              <span
                class="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border bg-muted/50 px-2 py-1 font-mono text-[13px] font-semibold tracking-wide text-foreground"
              >
                <TicketPercent class="h-3.5 w-3.5 text-muted-foreground" />
                {{ voucher.code }}
              </span>
            </td>

            <td class="whitespace-nowrap">
              <div class="font-medium text-foreground">
                {{ formatDiscount(voucher) }} off
              </div>
              <div class="text-xs text-muted-foreground">
                <template v-if="voucher.discountType === 'percentage'">
                  Percentage{{ voucher.maxDiscount ? `, up to $${voucher.maxDiscount}` : "" }}
                </template>
                <template v-else>Fixed amount</template>
              </div>
            </td>

            <td class="whitespace-nowrap text-right tabular-nums text-muted-foreground">
              {{ voucher.minOrderAmount ? `$${voucher.minOrderAmount}` : "None" }}
            </td>

            <td class="whitespace-nowrap">
              <div class="tabular-nums text-foreground">
                {{ voucher.usedCount ?? 0 }}
                <span class="text-muted-foreground">
                  / {{ voucher.usageLimit || "unlimited" }}
                </span>
              </div>
              <div
                v-if="voucher.usageLimit"
                class="mt-1 h-1 w-24 overflow-hidden rounded-full bg-muted"
              >
                <div
                  class="h-full rounded-full"
                  :class="usageBarClass(voucher)"
                  :style="{ width: `${usagePercent(voucher)}%` }"
                />
              </div>
            </td>

            <td class="whitespace-nowrap">
              <div class="text-foreground">{{ formatVoucherDate(voucher.expiryDate) }}</div>
              <AdminPill v-if="isExpired(voucher.expiryDate)" tone="destructive" class="mt-1">
                Expired
              </AdminPill>
              <AdminPill
                v-else-if="isExpiringSoon(voucher.expiryDate)"
                tone="warning"
                class="mt-1"
              >
                Expires soon
              </AdminPill>
            </td>

            <td>
              <UiSwitch
                :model-value="voucher.isActive"
                :aria-label="`${voucher.isActive ? 'Deactivate' : 'Activate'} ${voucher.code}`"
                @update:model-value="emit('toggle-active', voucher, $event)"
              />
            </td>

            <td>
              <div class="flex items-center justify-end gap-0.5">
                <UiButton
                  variant="ghost"
                  size="iconSm"
                  class="text-muted-foreground hover:text-foreground"
                  aria-label="Edit voucher"
                  title="Edit"
                  @click="emit('edit', voucher)"
                >
                  <Pencil class="h-4 w-4" />
                </UiButton>
                <UiButton
                  variant="ghost"
                  size="iconSm"
                  class="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Delete voucher"
                  title="Delete"
                  @click="emit('delete', voucher)"
                >
                  <Trash2 class="h-4 w-4" />
                </UiButton>
              </div>
            </td>
          </tr>

          <tr v-if="!vouchers.length" class="hover:bg-transparent">
            <td colspan="7">
              <AdminEmptyState
                :icon="TicketPercent"
                title="No vouchers found"
                description="Create a voucher or clear the filters to see existing codes."
              />
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { Pencil, TicketPercent, Trash2 } from "lucide-vue-next";
import {
  formatDiscount,
  formatVoucherDate,
  isExpired,
  isExpiringSoon,
} from "@/utils/vouchers";
import type { Voucher } from "@/types";

defineProps<{
  vouchers: Voucher[];
  loading: boolean;
}>();

const emit = defineEmits<{
  edit: [voucher: Voucher];
  delete: [voucher: Voucher];
  "toggle-active": [voucher: Voucher, active: boolean];
}>();

function usagePercent(voucher: Voucher): number {
  if (!voucher.usageLimit) return 0;
  return Math.min(100, ((voucher.usedCount ?? 0) / voucher.usageLimit) * 100);
}

function usageBarClass(voucher: Voucher): string {
  const used = usagePercent(voucher);
  if (used >= 90) return "bg-destructive";
  if (used >= 70) return "bg-warning";
  return "bg-foreground/70";
}
</script>
