<template>
  <UiDropdownMenu v-model:open="open">
    <UiDropdownMenuTrigger as-child>
      <button
        type="button"
        class="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Order notifications"
      >
        <Bell class="h-5 w-5" />
        <span
          v-if="unreadCount"
          class="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground"
        >
          {{ unreadCount > 9 ? "9+" : unreadCount }}
        </span>
      </button>
    </UiDropdownMenuTrigger>

    <UiDropdownMenuContent align="end" class="w-80">
      <UiDropdownMenuLabel class="flex items-center justify-between">
        <span class="text-sm font-semibold">New Orders</span>
        <span class="flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
          <span
            class="h-2 w-2 rounded-full"
            :class="connected ? 'bg-success' : 'bg-muted-foreground'"
          />
          {{ connected ? "Live" : "Offline" }}
        </span>
      </UiDropdownMenuLabel>
      <UiDropdownMenuSeparator />

      <div v-if="!items.length" class="px-3 py-6 text-center text-sm text-muted-foreground">
        No new orders yet
      </div>

      <div v-else class="max-h-80 overflow-y-auto">
        <UiDropdownMenuItem
          v-for="item in items"
          :key="item.id"
          class="flex cursor-pointer flex-col items-start gap-1 py-2.5"
          @select="goToOrders"
        >
          <div class="flex w-full items-center justify-between gap-2">
            <span class="truncate text-sm font-semibold text-foreground">
              {{ item.customer }}
            </span>
            <span class="shrink-0 text-sm font-bold text-lightgreen dark:text-customyellow">
              {{ formatVndAsUsd(item.total) }}
            </span>
          </div>
          <div class="flex w-full items-center justify-between gap-2 text-xs text-muted-foreground">
            <span class="truncate">{{ item.orderId }} · {{ item.paymentMethod }}</span>
            <span class="shrink-0">{{ timeAgo(item.createdAt) }}</span>
          </div>
        </UiDropdownMenuItem>
      </div>

      <template v-if="items.length">
        <UiDropdownMenuSeparator />
        <UiDropdownMenuItem class="cursor-pointer justify-center text-xs" @select="clear">
          Clear all
        </UiDropdownMenuItem>
      </template>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { Bell } from "lucide-vue-next";
import { useNotificationStore } from "@/stores/notification";
import { formatVndAsUsd } from "@/utils/pricing";

const router = useRouter();
const notificationStore = useNotificationStore();
const { items, unreadCount, connected } = storeToRefs(notificationStore);
const { markAllRead, clear } = notificationStore;

const open = ref(false);

watch(open, (isOpen) => {
  if (isOpen) markAllRead();
});

function goToOrders() {
  router.push("/admin?tab=order-management");
}

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
</script>
