<template>
  <div class="overflow-x-auto">
    <table class="admin-table">
      <thead>
        <tr>
          <th class="min-w-[260px]">Book</th>
          <th>Status</th>
          <th class="!text-right">On hand</th>
          <th class="!text-right">Sold</th>
          <th class="!text-right">Stock value</th>
          <th class="w-px"><span class="sr-only">Actions</span></th>
        </tr>
      </thead>

      <tbody>
        <AdminTableSkeleton v-if="loading && !items.length" :columns="6" media />

        <template v-else>
          <tr v-for="item in items" :key="item._id">
            <td>
              <div class="flex items-center gap-3">
                <div
                  class="flex h-12 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted ring-1 ring-inset ring-border"
                >
                  <img
                    v-if="item.cover_url"
                    :src="item.cover_url"
                    :alt="item.title"
                    class="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <BookOpen v-else class="h-4 w-4 text-muted-foreground" />
                </div>
                <div class="min-w-0">
                  <button
                    type="button"
                    class="line-clamp-1 text-left font-medium text-foreground hover:underline"
                    @click="emit('history', item)"
                  >
                    {{ item.title }}
                  </button>
                  <div class="line-clamp-1 text-xs text-muted-foreground">
                    {{ item.authors?.join(", ") || "Unknown author" }}
                    <template v-if="item.pdf_pages"> · Ebook available</template>
                  </div>
                </div>
              </div>
            </td>

            <td class="whitespace-nowrap">
              <AdminInventoryStockPill :stock="item.stock" :low-threshold="lowThreshold" />
            </td>

            <td
              class="whitespace-nowrap text-right text-base font-semibold tabular-nums"
              :class="item.stock < 0 ? 'text-destructive' : 'text-foreground'"
            >
              {{ item.stock }}
            </td>

            <td class="whitespace-nowrap text-right tabular-nums text-muted-foreground">
              {{ item.sold || 0 }}
            </td>

            <td class="whitespace-nowrap text-right tabular-nums text-muted-foreground">
              {{ formatUsd(Math.max(item.stock, 0) * (item.price ?? 0)) }}
            </td>

            <td>
              <div class="flex items-center justify-end gap-1">
                <UiButton variant="outline" size="sm" @click="emit('adjust', item)">
                  <SlidersHorizontal class="h-3.5 w-3.5" />
                  Adjust
                </UiButton>
                <UiButton
                  variant="ghost"
                  size="iconSm"
                  class="text-muted-foreground hover:text-foreground"
                  aria-label="Stock history"
                  title="Stock history"
                  @click="emit('history', item)"
                >
                  <History class="h-4 w-4" />
                </UiButton>
              </div>
            </td>
          </tr>

          <tr v-if="!items.length" class="hover:bg-transparent">
            <td colspan="6">
              <AdminEmptyState
                :icon="Boxes"
                title="No books match"
                description="Try a different search or clear the stock filter."
              />
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { BookOpen, Boxes, History, SlidersHorizontal } from "lucide-vue-next";
import { formatUsd } from "@/utils/pricing";
import type { StockLevel } from "@/types";

defineProps<{
  items: StockLevel[];
  loading: boolean;
  lowThreshold: number;
}>();

const emit = defineEmits<{
  adjust: [item: StockLevel];
  history: [item: StockLevel];
}>();
</script>
