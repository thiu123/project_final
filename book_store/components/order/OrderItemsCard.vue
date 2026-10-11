<template>
  <section aria-labelledby="order-items-title">
    <div class="flex items-baseline justify-between gap-4 border-b border-foreground pb-4">
      <h2
        id="order-items-title"
        class="font-serif text-2xl font-normal leading-snug md:text-[1.75rem]"
      >
        Items
      </h2>
      <span class="eyebrow tabular-nums">
        {{ items.length }} {{ items.length === 1 ? "title" : "titles" }}
      </span>
    </div>

    <ul class="divide-y divide-border">
      <li
        v-for="(item, index) in items"
        :key="item._id ?? index"
        class="flex gap-5 py-6 md:gap-6"
      >
        <NuxtLink
          v-if="item.bookId?._id"
          :to="`/details/${item.bookId._id}`"
          class="ed-cover aspect-[2/3] w-16 shrink-0 self-start overflow-hidden bg-muted md:w-20"
          :aria-label="item.bookId.title"
        >
          <img
            v-if="item.bookId.cover_url"
            :src="item.bookId.cover_url"
            :alt="item.bookId.title"
            class="h-full w-full object-cover"
            loading="lazy"
          />
        </NuxtLink>
        <div v-else class="ed-cover aspect-[2/3] w-16 shrink-0 self-start bg-muted md:w-20" />

        <div class="min-w-0 flex-1">
          <p class="eyebrow truncate leading-normal">
            {{ item.bookId?.authors?.join(", ") || "Unknown author" }}
          </p>
          <NuxtLink
            v-if="item.bookId?._id"
            :to="`/details/${item.bookId._id}`"
            class="mt-1.5 line-clamp-2 font-serif text-lg leading-snug text-foreground transition-colors hover:text-primary md:text-xl"
          >
            {{ item.bookId.title }}
          </NuxtLink>
          <p v-else class="mt-1.5 font-serif text-lg leading-snug text-muted-foreground md:text-xl">
            This book is no longer available
          </p>

          <p
            class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
          >
            <span class="text-foreground">
              {{ item.productType === "ebook" ? "Ebook" : "Hardback" }}
            </span>
            <span class="text-border" aria-hidden="true">/</span>
            <span class="tabular-nums">
              Published {{ item.bookId?.first_publish_year || "N/A" }}
            </span>
            <template v-if="item.bookId?.rating">
              <span class="text-border" aria-hidden="true">/</span>
              <span class="inline-flex items-center gap-1 tabular-nums">
                <Star class="size-3 fill-current" :stroke-width="1.5" />
                {{ item.bookId.rating }}
              </span>
            </template>
          </p>

          <p
            v-if="visibleSubjects(item).length"
            class="mt-2 text-[13px] capitalize text-muted-foreground"
          >
            {{ visibleSubjects(item).join(", ") }}
            <template v-if="hiddenSubjectCount(item) > 0">
              <span class="normal-case">and {{ hiddenSubjectCount(item) }} more</span>
            </template>
          </p>

          <details v-if="item.bookId?.description" class="group mt-3">
            <summary
              class="inline-flex cursor-pointer list-none items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-foreground [&::-webkit-details-marker]:hidden"
            >
              <span class="ed-link">About this book</span>
              <ChevronDown
                class="size-3.5 transition-transform duration-300 group-open:rotate-180"
                :stroke-width="1.5"
              />
            </summary>
            <p class="mt-3 max-w-[60ch] text-[14px] leading-relaxed text-foreground/85">
              {{ item.bookId.description }}
            </p>
          </details>
        </div>

        <div class="shrink-0 text-right">
          <p class="text-[15px] tabular-nums text-foreground">
            {{ formatUsd(itemUnitPrice(item) * item.quantity) }}
          </p>
          <p class="mt-1 text-[12px] tabular-nums text-muted-foreground">
            {{ item.quantity }} &times; {{ formatUsd(itemUnitPrice(item)) }}
          </p>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { ChevronDown, Star } from "lucide-vue-next";
import { formatUsd, unitPrice } from "@/utils/pricing";
import type { OrderItem } from "@/types";

const VISIBLE_SUBJECTS = 3;

defineProps<{ items: OrderItem[] }>();

function itemUnitPrice(item: OrderItem) {
  return unitPrice(item.bookId?.price ?? 0, item.productType);
}

function visibleSubjects(item: OrderItem) {
  return (item.bookId?.subjects ?? []).slice(0, VISIBLE_SUBJECTS);
}

function hiddenSubjectCount(item: OrderItem) {
  return Math.max(0, (item.bookId?.subjects?.length ?? 0) - VISIBLE_SUBJECTS);
}
</script>
