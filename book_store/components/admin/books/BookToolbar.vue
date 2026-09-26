<template>
  <AdminSearchInput v-model="search" placeholder="Search by title or author" />

  <div class="flex items-center gap-2 md:ml-auto">
    <div class="flex w-full items-center gap-1 md:w-52">
      <UiSelect
        :model-value="subject"
        @update:model-value="subject = ($event as string) || undefined"
      >
        <UiSelectTrigger class="w-full bg-background capitalize">
          <UiSelectValue placeholder="All categories" />
        </UiSelectTrigger>
        <UiSelectContent>
          <UiSelectItem
            v-for="option in subjectOptions"
            :key="option"
            :value="option"
            class="capitalize"
          >
            {{ option }}
          </UiSelectItem>
        </UiSelectContent>
      </UiSelect>
      <UiButton
        v-if="subject"
        variant="ghost"
        size="iconSm"
        aria-label="Clear category filter"
        @click="subject = undefined"
      >
        <X class="h-4 w-4" />
      </UiButton>
    </div>

    <UiSelect
      :model-value="sort"
      @update:model-value="sort = $event as BookSort"
    >
      <UiSelectTrigger class="w-full bg-background md:w-48" aria-label="Sort books">
        <UiSelectValue placeholder="Sort by" />
      </UiSelectTrigger>
      <UiSelectContent>
        <UiSelectItem
          v-for="option in SORT_OPTIONS"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </UiSelectItem>
      </UiSelectContent>
    </UiSelect>
  </div>
</template>

<script setup lang="ts">
import { X } from "lucide-vue-next";
import type { BookSort } from "@/types";

const SORT_OPTIONS: { label: string; value: BookSort }[] = [
  { label: "Recently added", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Title A-Z", value: "title_asc" },
  { label: "Title Z-A", value: "title_desc" },
  { label: "Price: low to high", value: "price_asc" },
  { label: "Price: high to low", value: "price_desc" },
  { label: "Best selling", value: "bestselling" },
];

defineProps<{
  subjectOptions: string[];
}>();

const search = defineModel<string>("search", { required: true });
const subject = defineModel<string | undefined>("subject", { required: true });
const sort = defineModel<BookSort>("sort", { required: true });
</script>
