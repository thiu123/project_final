<template>
  <div class="overflow-x-auto">
    <table class="admin-table">
      <thead>
        <tr>
          <th class="min-w-[280px]">Book</th>
          <th>Categories</th>
          <th class="!text-right">Price</th>
          <th>Inventory</th>
          <th class="!text-right">Sold</th>
          <th class="w-px"><span class="sr-only">Actions</span></th>
        </tr>
      </thead>

      <tbody>
        <AdminTableSkeleton v-if="loading && !books.length" :columns="6" media />

        <template v-else>
          <tr v-for="book in books" :key="book._id" class="group">
            <td>
              <div class="flex items-center gap-3">
                <div
                  class="flex h-14 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted ring-1 ring-inset ring-border"
                >
                  <img
                    v-if="book.cover_url"
                    :src="book.cover_url"
                    :alt="book.title"
                    class="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <BookOpen v-else class="h-4 w-4 text-muted-foreground" />
                </div>

                <div class="min-w-0">
                  <button
                    type="button"
                    class="line-clamp-1 text-left font-medium text-foreground hover:underline"
                    @click="emit('view', book)"
                  >
                    {{ book.title }}
                  </button>
                  <div class="line-clamp-1 text-xs text-muted-foreground">
                    {{ book.authors?.join(", ") || "Unknown author" }}
                    <template v-if="book.first_publish_year">
                      · {{ book.first_publish_year }}
                    </template>
                  </div>
                  <div class="mt-0.5 font-mono text-[11px] text-muted-foreground/80">
                    #{{ book._id?.slice(-8) }}
                  </div>
                </div>
              </div>
            </td>

            <td>
              <div class="flex max-w-[220px] flex-wrap gap-1">
                <span
                  v-for="subject in (book.subjects || []).slice(0, VISIBLE_SUBJECTS)"
                  :key="subject"
                  class="rounded-md bg-muted px-1.5 py-0.5 text-xs capitalize text-muted-foreground"
                >
                  {{ subject }}
                </span>
                <span
                  v-if="(book.subjects || []).length > VISIBLE_SUBJECTS"
                  class="rounded-md px-1 py-0.5 text-xs text-muted-foreground"
                >
                  +{{ book.subjects.length - VISIBLE_SUBJECTS }}
                </span>
                <span
                  v-if="!book.subjects?.length"
                  class="text-xs text-muted-foreground"
                >
                  None
                </span>
              </div>
            </td>

            <td class="whitespace-nowrap text-right font-medium">
              {{ formatUsd(book.price ?? 0) }}
            </td>

            <td class="whitespace-nowrap">
              <AdminPill v-if="!book.stock" tone="destructive">
                Out of stock
              </AdminPill>
              <span v-else class="inline-flex items-center gap-2">
                <span class="tabular-nums text-foreground">
                  {{ book.stock }} in stock
                </span>
                <AdminPill v-if="book.stock <= LOW_STOCK" tone="warning">
                  Low
                </AdminPill>
              </span>
            </td>

            <td class="whitespace-nowrap text-right tabular-nums text-muted-foreground">
              {{ book.sold || 0 }}
            </td>

            <td>
              <div class="flex items-center justify-end gap-0.5">
                <UiButton
                  variant="ghost"
                  size="iconSm"
                  class="text-muted-foreground hover:text-foreground"
                  aria-label="View book"
                  title="View"
                  @click="emit('view', book)"
                >
                  <Eye class="h-4 w-4" />
                </UiButton>
                <UiButton
                  variant="ghost"
                  size="iconSm"
                  class="text-muted-foreground hover:text-foreground"
                  aria-label="Edit book"
                  title="Edit"
                  @click="emit('edit', book)"
                >
                  <Pencil class="h-4 w-4" />
                </UiButton>
                <UiButton
                  variant="ghost"
                  size="iconSm"
                  class="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Delete book"
                  title="Delete"
                  @click="emit('delete', book)"
                >
                  <Trash2 class="h-4 w-4" />
                </UiButton>
              </div>
            </td>
          </tr>

          <tr v-if="!books.length" class="hover:bg-transparent">
            <td colspan="6">
              <AdminEmptyState
                :icon="BookOpen"
                title="No books found"
                description="Try a different search or clear the category filter."
              />
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { BookOpen, Eye, Pencil, Trash2 } from "lucide-vue-next";
import { formatUsd } from "@/utils/pricing";
import type { Book } from "@/types";

const VISIBLE_SUBJECTS = 2;
const LOW_STOCK = 10;

defineProps<{
  books: Book[];
  loading: boolean;
}>();

const emit = defineEmits<{
  view: [book: Book];
  edit: [book: Book];
  delete: [book: Book];
}>();
</script>
