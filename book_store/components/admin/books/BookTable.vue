<template>
  <div class="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
    <UiProgress v-if="loading" indeterminate class="h-1 rounded-none" />

    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-muted/60 text-left">
          <tr>
            <th
              v-for="column in COLUMNS"
              :key="column.label"
              class="px-4 py-3 font-medium text-muted-foreground"
              :class="[column.width, column.center && 'text-center']"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-border">
          <tr v-for="book in books" :key="book._id" class="hover:bg-muted/40">
            <td class="px-4 py-3">
              <UiBadge
                class="border-transparent bg-waterblue/15 font-mono text-waterblue"
              >
                {{ book._id?.slice(-8) || "N/A" }}
              </UiBadge>
            </td>

            <td class="px-4 py-3">
              <div class="flex items-center">
                <div
                  class="mr-3 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted"
                >
                  <img
                    v-if="book.cover_url"
                    :src="book.cover_url"
                    :alt="book.title"
                    class="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <BookOpen v-else class="h-5 w-5 text-muted-foreground" />
                </div>

                <div>
                  <div class="font-medium">{{ book.title }}</div>
                  <div class="text-xs text-muted-foreground">
                    {{ book.authors?.join(", ") || "Unknown Author" }}
                  </div>
                </div>
              </div>
            </td>

            <td class="px-4 py-3 text-center">
              <UiBadge :variant="yearVariant(book.first_publish_year)">
                {{ book.first_publish_year || "N/A" }}
              </UiBadge>
            </td>

            <td class="px-4 py-3">
              <div class="flex flex-wrap gap-1">
                <UiBadge
                  v-for="subject in (book.subjects || []).slice(0, VISIBLE_SUBJECTS)"
                  :key="subject"
                  class="border-transparent bg-darkgreen/15 capitalize text-darkgreen dark:bg-darkgreen/50 dark:text-whitesmoke"
                >
                  {{ subject }}
                </UiBadge>
                <UiBadge
                  v-if="(book.subjects || []).length > VISIBLE_SUBJECTS"
                  variant="muted"
                >
                  +{{ book.subjects.length - VISIBLE_SUBJECTS }}
                </UiBadge>
              </div>
            </td>

            <td class="px-4 py-3 text-center">
              <div class="text-lg font-bold text-success">
                {{ formatUsd(book.price ?? 0) }}
              </div>
            </td>

            <td class="px-4 py-3 text-center">
              <UiBadge :variant="stockVariant(book.stock)" class="font-bold">
                {{ book.stock || 0 }}
              </UiBadge>
            </td>

            <td class="px-4 py-3 text-center">
              <UiBadge variant="success" class="font-bold">
                <Flame class="h-3 w-3" />
                {{ book.sold || 0 }}
              </UiBadge>
            </td>

            <td class="px-4 py-3">
              <UiTooltipProvider :delay-duration="200">
                <UiTooltip>
                  <UiTooltipTrigger as-child>
                    <div class="max-w-[200px] truncate">
                      {{ book.description || "No description" }}
                    </div>
                  </UiTooltipTrigger>
                  <UiTooltipContent side="top" class="max-w-sm">
                    {{ book.description || "No description" }}
                  </UiTooltipContent>
                </UiTooltip>
              </UiTooltipProvider>
            </td>

            <td class="px-4 py-3">
              <div class="flex items-center justify-center gap-1">
                <UiButton
                  variant="ghost"
                  size="iconSm"
                  class="text-info hover:text-info"
                  aria-label="View book"
                  @click="emit('view', book)"
                >
                  <Eye class="h-4 w-4" />
                </UiButton>

                <UiButton
                  variant="ghost"
                  size="iconSm"
                  class="text-primary hover:text-primary"
                  aria-label="Edit book"
                  @click="emit('edit', book)"
                >
                  <Pencil class="h-4 w-4" />
                </UiButton>

                <UiButton
                  variant="ghost"
                  size="iconSm"
                  class="text-destructive hover:text-destructive"
                  aria-label="Delete book"
                  @click="emit('delete', book)"
                >
                  <Trash2 class="h-4 w-4" />
                </UiButton>
              </div>
            </td>
          </tr>

          <tr v-if="!books.length">
            <td :colspan="COLUMNS.length" class="px-4 py-8 text-center text-muted-foreground">
              {{ loading ? "Loading books..." : "No data available" }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      class="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4"
    >
      <div class="text-sm text-muted-foreground">
        Showing {{ books.length }} of {{ pagination.total }} books
      </div>

      <UiPagination
        v-slot="{ page: currentPage }"
        v-model:page="page"
        :total="pagination.total"
        :items-per-page="pagination.limit"
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
import { BookOpen, Eye, Flame, Pencil, Trash2 } from "lucide-vue-next";
import { formatUsd } from "@/utils/pricing";
import type { BadgeVariant } from "@/utils/orderStatus";
import type { Book, PaginationMeta } from "@/types";

const VISIBLE_SUBJECTS = 2;

interface Column {
  label: string;
  width: string;
  center?: boolean;
}

const COLUMNS: Column[] = [
  { label: "Book ID", width: "w-[120px]" },
  { label: "Book Title", width: "w-[300px]" },
  { label: "Publication Year", width: "w-[140px]", center: true },
  { label: "Categories", width: "w-[180px]" },
  { label: "Price", width: "w-[100px]", center: true },
  { label: "Stock", width: "w-[100px]", center: true },
  { label: "Sold", width: "w-[100px]", center: true },
  { label: "Description", width: "w-[250px]" },
  { label: "Actions", width: "w-[120px]", center: true },
];

defineProps<{
  books: Book[];
  pagination: PaginationMeta;
  loading: boolean;
}>();

const emit = defineEmits<{
  view: [book: Book];
  edit: [book: Book];
  delete: [book: Book];
}>();

const page = defineModel<number>("page", { required: true });

/** Older books fade from green through amber to red. */
function yearVariant(year?: number): BadgeVariant {
  if (!year) return "muted";
  const currentYear = new Date().getFullYear();
  if (year >= currentYear - 5) return "success";
  if (year >= currentYear - 20) return "warning";
  return "destructive";
}

function stockVariant(stock?: number): BadgeVariant {
  if (!stock) return "destructive";
  if (stock <= 10) return "warning";
  if (stock <= 50) return "info";
  return "success";
}
</script>
