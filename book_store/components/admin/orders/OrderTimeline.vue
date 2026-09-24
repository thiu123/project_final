<template>
  <div class="rounded-lg border border-border">
    <div class="flex flex-wrap items-center justify-between gap-2 px-4 pt-4">
      <div class="flex items-center gap-2 text-base font-bold">
        <History class="h-5 w-5" />
        Status Timeline
      </div>
      <span v-if="totalElapsed" class="text-xs text-muted-foreground">
        {{ totalElapsed }} since the order was placed
      </span>
    </div>

    <ol class="p-4">
      <li
        v-for="(entry, index) in entries"
        :key="`${entry.status}-${entry.at ?? index}`"
        class="relative flex gap-3 pb-6 last:pb-0"
      >
        <span
          v-if="index < entries.length - 1"
          class="absolute left-4 top-9 -ml-px h-[calc(100%-2.25rem)] w-px bg-border"
          aria-hidden="true"
        />

        <span
          class="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          :class="[
            orderStatusDotClass(entry.status),
            entry.recorded ? '' : 'opacity-60',
            index === entries.length - 1 ? 'ring-4 ring-primary/20' : '',
          ]"
        >
          <component :is="orderStatusIcon(entry.status)" class="h-4 w-4" />
        </span>

        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-semibold">{{ entry.status }}</span>

            <UiBadge
              v-if="index === entries.length - 1"
              variant="outline"
              class="px-1.5 py-0 text-[10px] uppercase tracking-wide"
            >
              Current
            </UiBadge>

            <UiTooltipProvider v-if="!entry.recorded" :delay-duration="200">
              <UiTooltip>
                <UiTooltipTrigger as-child>
                  <UiBadge
                    variant="muted"
                    class="cursor-help px-1.5 py-0 text-[10px] uppercase tracking-wide"
                  >
                    Inferred
                  </UiBadge>
                </UiTooltipTrigger>
                <UiTooltipContent side="top" class="max-w-64">
                  Reconstructed from the order dates, not from a logged event.
                </UiTooltipContent>
              </UiTooltip>
            </UiTooltipProvider>

            <span
              v-if="entry.sincePrevMs"
              class="inline-flex items-center gap-1 text-xs text-muted-foreground"
            >
              <Clock3 class="h-3 w-3" />
              +{{ formatDuration(entry.sincePrevMs) }}
            </span>
          </div>

          <p class="text-xs text-muted-foreground">
            {{ formatDateTime(entry.at) || "Unknown date" }}
            <template v-if="entry.at"> · {{ formatRelativeTime(entry.at) }}</template>
          </p>

          <p class="mt-1 flex items-center gap-1.5 text-sm">
            <component
              :is="ACTOR_ICONS[entry.actor]"
              class="h-3.5 w-3.5 shrink-0 text-muted-foreground"
            />
            <span class="truncate">{{ entry.by }}</span>
          </p>

          <p v-if="entry.note" class="text-sm italic text-muted-foreground">
            {{ entry.note }}
          </p>
        </div>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import type { Component } from "vue";
import { Clock3, Cog, CreditCard, History, User, UserCog } from "lucide-vue-next";
import { orderStatusDotClass, orderStatusIcon } from "@/utils/orderStatus";
import {
  buildOrderTimeline,
  formatDateTime,
  formatDuration,
  formatRelativeTime,
} from "@/utils/orders";
import type { Order, StatusActor } from "@/types";

const props = defineProps<{ order: Order }>();

const ACTOR_ICONS: Record<StatusActor, Component> = {
  system: Cog,
  customer: User,
  admin: UserCog,
  gateway: CreditCard,
};

const entries = computed(() => buildOrderTimeline(props.order));

const totalElapsed = computed(() => {
  const first = entries.value[0]?.at;
  const last = entries.value[entries.value.length - 1]?.at;
  if (!first || !last || first === last) return "";

  const span = new Date(last).getTime() - new Date(first).getTime();
  return span > 0 ? formatDuration(span) : "";
});
</script>
