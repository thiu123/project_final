<template>
  <UiCard class="mb-6 overflow-hidden rounded-lg shadow">
    <div class="flex items-center bg-muted/60 p-5">
      <BookCopy class="mr-3 h-7 w-7 text-secondary" />
      <span class="text-2xl font-bold">Items Purchased</span>
      <UiBadge variant="secondary" class="ml-3">
        {{ items.length }} {{ items.length === 1 ? "item" : "items" }}
      </UiBadge>
    </div>

    <UiSeparator />

    <template v-for="(item, index) in items" :key="item._id ?? index">
      <div
        class="flex items-start px-6 py-5 transition-colors duration-200 hover:bg-muted/30"
      >
        <div class="mr-5 shrink-0 overflow-hidden rounded-lg shadow-md">
          <img
            v-if="item.bookId?.cover_url"
            :src="item.bookId.cover_url"
            :alt="item.bookId.title"
            class="h-[140px] w-[100px] rounded-lg bg-muted object-cover"
            loading="lazy"
          />
          <div
            v-else
            class="flex h-[140px] w-[100px] items-center justify-center rounded-lg bg-muted"
          >
            <Book class="h-12 w-12 text-muted-foreground/40" />
          </div>
        </div>

        <div class="min-w-0 grow">
          <div class="mb-2 text-lg font-bold">{{ item.bookId?.title }}</div>

          <div class="mb-2 flex items-center text-sm text-muted-foreground">
            <User class="mr-1 h-4 w-4" />
            {{ item.bookId?.authors?.join(", ") || "Unknown Author" }}
          </div>

          <div class="mb-3 flex items-center text-sm text-muted-foreground">
            <Calendar class="mr-1 h-4 w-4" />
            Published {{ item.bookId?.first_publish_year || "N/A" }}
          </div>

          <div class="mb-3 flex items-center">
            <UiRating :model-value="item.bookId?.rating || 0" :size="16" readonly />
            <span class="ml-2 text-sm font-medium">{{ item.bookId?.rating }}</span>
          </div>

          <div class="mb-3 flex flex-wrap gap-2">
            <UiBadge
              v-for="subject in visibleSubjects(item)"
              :key="subject"
              class="border-transparent bg-primary/10 text-primary"
            >
              {{ subject }}
            </UiBadge>
            <UiBadge
              v-if="hiddenSubjectCount(item) > 0"
              variant="outline"
              class="border-transparent text-primary"
            >
              +{{ hiddenSubjectCount(item) }} more
            </UiBadge>
          </div>

          <details v-if="item.bookId?.description" class="mt-3 rounded-lg bg-muted">
            <summary
              class="cursor-pointer select-none rounded-lg px-4 py-3 text-sm font-medium"
            >
              View Description
            </summary>
            <div class="px-4 pb-3 text-sm text-foreground">
              {{ item.bookId.description }}
            </div>
          </details>
        </div>

        <div class="ml-4 shrink-0 text-right">
          <UiBadge class="mb-2 border-transparent bg-primary/10 text-primary">
            Qty: {{ item.quantity }}
          </UiBadge>
          <div class="text-lg font-bold text-primary">
            {{ formatUsd(unitPrice(item.bookId?.price ?? 0, item.productType)) }}
          </div>
          <div class="text-xs text-muted-foreground">per item</div>
        </div>
      </div>

      <div v-if="index < items.length - 1" class="px-6">
        <UiSeparator />
      </div>
    </template>
  </UiCard>
</template>

<script setup lang="ts">
import { Book, BookCopy, Calendar, User } from "lucide-vue-next";
import { formatUsd, unitPrice } from "@/utils/pricing";
import type { OrderItem } from "@/types";

const VISIBLE_SUBJECTS = 3;

defineProps<{ items: OrderItem[] }>();

function visibleSubjects(item: OrderItem) {
  return (item.bookId?.subjects ?? []).slice(0, VISIBLE_SUBJECTS);
}

function hiddenSubjectCount(item: OrderItem) {
  return Math.max(0, (item.bookId?.subjects?.length ?? 0) - VISIBLE_SUBJECTS);
}
</script>
