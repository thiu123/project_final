<template>
  <div class="overflow-x-auto">
    <table class="admin-table">
      <thead>
        <tr>
          <th class="w-44">When</th>
          <th v-if="showBook" class="min-w-[220px]">Book</th>
          <th>Movement</th>
          <th class="!text-right">Change</th>
          <th class="!text-right">Balance</th>
          <th class="min-w-[180px]">Details</th>
        </tr>
      </thead>

      <tbody>
        <AdminTableSkeleton v-if="loading && !movements.length" :columns="columns" :rows="5" />

        <template v-else>
          <tr v-for="movement in movements" :key="movement._id">
            <td class="whitespace-nowrap">
              <div class="text-foreground">{{ formatDateTime(movement.createdAt) }}</div>
              <div class="text-xs text-muted-foreground">
                {{ formatRelativeTime(movement.createdAt) }}
              </div>
            </td>

            <td v-if="showBook">
              <div class="flex items-center gap-2.5">
                <div
                  class="flex h-10 w-7 shrink-0 items-center justify-center overflow-hidden rounded bg-muted ring-1 ring-inset ring-border"
                >
                  <img
                    v-if="movementBook(movement)?.cover_url"
                    :src="movementBook(movement)?.cover_url"
                    :alt="movementBook(movement)?.title"
                    class="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <BookOpen v-else class="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <span class="line-clamp-2 text-sm text-foreground">
                  {{ movementBook(movement)?.title ?? "Deleted book" }}
                </span>
              </div>
            </td>

            <td class="whitespace-nowrap">
              <AdminPill
                :tone="MOVEMENT_REASONS[movement.reason].tone"
                :icon="MOVEMENT_REASONS[movement.reason].icon"
              >
                {{ MOVEMENT_REASONS[movement.reason].label }}
              </AdminPill>
            </td>

            <td
              class="whitespace-nowrap text-right font-semibold tabular-nums"
              :class="deltaClass(movement.delta)"
            >
              {{ formatDelta(movement.delta) }}
            </td>

            <td
              class="whitespace-nowrap text-right tabular-nums"
              :class="movement.balanceAfter < 0 ? 'text-destructive' : 'text-foreground'"
            >
              {{ movement.balanceAfter }}
            </td>

            <td>
              <div v-if="movement.orderCode" class="font-mono text-xs text-foreground">
                {{ movement.orderCode }}
              </div>
              <div class="text-xs text-muted-foreground">by {{ actorName(movement) }}</div>
              <div v-if="movement.note" class="mt-0.5 text-xs italic text-muted-foreground">
                {{ movement.note }}
              </div>
            </td>
          </tr>

          <tr v-if="opening != null" class="bg-muted/30 hover:bg-muted/30">
            <td class="whitespace-nowrap text-muted-foreground">Before tracking</td>
            <td v-if="showBook" />
            <td class="whitespace-nowrap">
              <AdminPill tone="outline" :icon="Archive">Opening balance</AdminPill>
            </td>
            <td />
            <td class="whitespace-nowrap text-right tabular-nums text-foreground">
              {{ opening }}
            </td>
            <td class="text-xs text-muted-foreground">
              Stock on hand before the ledger started
            </td>
          </tr>

          <tr v-if="!movements.length && opening == null" class="hover:bg-transparent">
            <td :colspan="columns">
              <AdminEmptyState
                :icon="History"
                title="No stock movements yet"
                description="Sales, cancellations and adjustments will show up here."
              />
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { Archive, BookOpen, History } from "lucide-vue-next";
import {
  MOVEMENT_REASONS,
  deltaClass,
  formatDelta,
  movementActor,
  movementBook,
} from "@/utils/inventory";
import { formatDateTime, formatRelativeTime } from "@/utils/orders";
import type { StockMovement } from "@/types";

const props = withDefaults(
  defineProps<{
    movements: StockMovement[];
    loading: boolean;
    showBook?: boolean;
    opening?: number | null;
  }>(),
  { showBook: false, opening: null }
);

const columns = computed(() => (props.showBook ? 6 : 5));

function actorName(movement: StockMovement): string {
  const actor = movementActor(movement);
  return actor?.username || actor?.email || "System";
}
</script>
