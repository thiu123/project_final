<template>
  <div class="mb-6 rounded-2xl border border-border bg-card shadow-sm">
    <div class="p-6">
      <div class="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 class="mb-2 text-3xl font-bold text-foreground">Book List</h2>
          <p class="text-base text-muted-foreground">
            Manage book information in the system
          </p>
        </div>

        <div class="flex items-center gap-3">
          <UiButton
            class="bg-customyellow text-customblack transition-transform hover:-translate-y-px hover:bg-customyellow/90"
            @click="emit('add')"
          >
            <Plus class="h-4 w-4" />
            Add Book
          </UiButton>

          <UiButton
            variant="outline"
            class="border-waterblue text-waterblue hover:bg-waterblue/10 hover:text-waterblue"
            :loading="loading"
            @click="emit('refresh')"
          >
            <RefreshCw v-if="!loading" class="h-4 w-4" />
            Refresh
          </UiButton>
        </div>
      </div>

      <div class="grid grid-cols-12 items-center gap-4">
        <div class="col-span-12 md:col-span-5">
          <UiInput v-model="search" placeholder="Search books...">
            <template #prepend>
              <Search class="h-4 w-4" />
            </template>
            <template #append>
              <button
                v-if="search"
                type="button"
                class="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Clear search"
                @click="search = ''"
              >
                <X class="h-4 w-4" />
              </button>
            </template>
          </UiInput>
        </div>

        <div class="col-span-12 md:col-span-4">
          <div class="flex items-center gap-1">
            <UiSelect
              :model-value="subject"
              @update:model-value="subject = ($event as string) || undefined"
            >
              <UiSelectTrigger class="w-full capitalize">
                <UiSelectValue placeholder="Filter by category" />
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
        </div>

        <div class="col-span-12 md:col-span-3">
          <UiSelect
            :model-value="sort"
            @update:model-value="sort = $event as BookSort"
          >
            <UiSelectTrigger class="w-full">
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, RefreshCw, Search, X } from "lucide-vue-next";
import type { BookSort } from "@/types";

/** Values map straight onto the API's `sort` parameter. */
const SORT_OPTIONS: { label: string; value: BookSort }[] = [
  { label: "Recently added", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Name A-Z", value: "title_asc" },
  { label: "Name Z-A", value: "title_desc" },
  { label: "Price Low to High", value: "price_asc" },
  { label: "Price High to Low", value: "price_desc" },
  { label: "Best selling", value: "bestselling" },
];

defineProps<{
  subjectOptions: string[];
  loading: boolean;
}>();

const emit = defineEmits<{
  add: [];
  refresh: [];
}>();

const search = defineModel<string>("search", { required: true });
const subject = defineModel<string | undefined>("subject", { required: true });
const sort = defineModel<BookSort>("sort", { required: true });
</script>
