<template>
  <div class="rounded-xl border border-border bg-card shadow">
    <!-- Categories -->
    <div class="flex items-center p-6 pb-4">
      <List class="mr-3 h-6 w-6 text-primary" />
      <span class="text-lg font-bold">Categories</span>
    </div>

    <div class="pb-2">
      <template v-for="(category, index) in categories" :key="category.slug">
        <!-- With subcategories -->
        <div v-if="category.subcategories.length" class="mb-2">
          <button
            type="button"
            class="mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
            :class="{ 'text-primary': containsActive(category) }"
            @click="toggleCategory(category)"
          >
            <BookIcon class="h-5 w-5 shrink-0 text-muted-foreground" />
            <span class="grow text-base font-medium">{{ category.name }}</span>
            <span class="shrink-0 text-xs text-muted-foreground">
              {{ category.count }}
            </span>
            <ChevronDown
              class="h-4 w-4 shrink-0 text-muted-foreground transition-transform"
              :class="{ 'rotate-180': isOpen(category) }"
            />
          </button>

          <template v-if="isOpen(category)">
            <!-- The category itself, which matches every subcategory below it -->
            <BookCatalogueFilterOption
              :label="`All ${category.name}`"
              :count="category.count"
              :active="activeSlug === category.slug"
              @select="emit('select', category.slug)"
            />

            <template
              v-for="(subcategory, subIndex) in category.subcategories"
              :key="subcategory.slug"
            >
              <BookCatalogueFilterOption
                :label="subcategory.name"
                :count="subcategory.count"
                :active="activeSlug === subcategory.slug"
                @select="emit('select', subcategory.slug)"
              />
              <div
                v-if="subIndex < category.subcategories.length - 1"
                class="mx-4 h-px bg-border opacity-25"
              />
            </template>
          </template>
        </div>

        <!-- Leaf category -->
        <button
          v-else
          type="button"
          class="mx-2 mb-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-lg px-3 py-2 text-left transition-all hover:translate-x-1 hover:bg-primary/10"
          :class="{ 'bg-primary/10 text-primary': activeSlug === category.slug }"
          @click="emit('select', category.slug)"
        >
          <BookIcon class="h-5 w-5 shrink-0 text-muted-foreground" />
          <span class="grow text-base font-medium">{{ category.name }}</span>
          <span class="text-xs text-muted-foreground">{{ category.count }}</span>
        </button>

        <div
          v-if="index < categories.length - 1"
          class="mx-4 my-2 h-px bg-border opacity-25"
        />
      </template>
    </div>

    <div class="mx-4 my-4 h-px bg-border" />

    <!-- Price -->
    <div class="flex items-center p-6 pb-4">
      <DollarSign class="mr-3 h-6 w-6 text-primary" />
      <span class="text-lg font-bold">Price Range</span>
    </div>

    <div class="p-6 pt-0">
      <UiCheckbox
        v-for="range in PRICE_RANGES"
        :key="range.label"
        :label="range.label"
        class="mb-3"
        :model-value="selectedPrice === range.label"
        @update:model-value="emit('update:selectedPrice', $event ? range.label : '')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Book as BookIcon,
  ChevronDown,
  DollarSign,
  List,
} from "lucide-vue-next";
import { PRICE_RANGES } from "@/constants/catalogue";
import type { CategoryNode } from "@/types";

const props = defineProps<{
  categories: CategoryNode[];
  activeSlug: string;
  selectedPrice: string;
}>();

const emit = defineEmits<{
  select: [slug: string];
  "update:selectedPrice": [label: string];
}>();

/** Explicit expand/collapse, keyed by slug; unset means "follow the active slug". */
const opened = ref<Record<string, boolean>>({});

function containsActive(category: CategoryNode) {
  return (
    props.activeSlug === category.slug ||
    category.subcategories.some((sub) => sub.slug === props.activeSlug)
  );
}

function isOpen(category: CategoryNode) {
  return opened.value[category.slug] ?? containsActive(category);
}

function toggleCategory(category: CategoryNode) {
  opened.value[category.slug] = !isOpen(category);
}
</script>
