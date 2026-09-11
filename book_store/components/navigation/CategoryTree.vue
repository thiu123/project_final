<template>
  <template v-for="(category, index) in categories" :key="category.slug">
    <!-- Expandable group -->
    <template v-if="category.subcategories.length">
      <button
        type="button"
        :class="groupClass"
        @click="toggle(category.slug)"
      >
        <span :class="labelClass">{{ category.name }}</span>
        <ChevronDown
          class="ml-auto h-4 w-4 text-muted-foreground transition-transform duration-200"
          :class="{ 'rotate-180': isOpen(category.slug) }"
        />
      </button>

      <template v-if="isOpen(category.slug)">
        <template
          v-for="(subcategory, subIndex) in category.subcategories"
          :key="subcategory.slug"
        >
          <button type="button" :class="subClass" @click="emit('select', subcategory.slug)">
            <ChevronRight v-if="variant === 'desktop'" class="mr-2 h-4 w-4" />
            {{ subcategory.name }}
          </button>
          <div
            v-if="variant === 'desktop' && subIndex < category.subcategories.length - 1"
            class="mx-4 h-px bg-border/60"
          />
        </template>
      </template>
    </template>

    <!-- Leaf category -->
    <button
      v-else
      type="button"
      :class="leafClass"
      @click="emit('select', category.slug)"
    >
      {{ category.name }}
    </button>

    <div
      v-if="variant === 'desktop' && index < categories.length - 1"
      class="mx-4 h-px bg-border/60"
    />
  </template>
</template>

<script setup lang="ts">
import { ChevronDown, ChevronRight } from "lucide-vue-next";
import type { CategoryNode } from "@/types";

/**
 * The desktop dropdown and the mobile drawer render the same category tree with
 * the same expand/collapse behaviour — only the padding and type scale differ,
 * which is what `variant` selects. Keeping one component means a change to the
 * tree's behaviour cannot land in one place and not the other.
 */
const props = defineProps<{
  categories: CategoryNode[];
  variant: "desktop" | "mobile";
}>();

const emit = defineEmits<{ select: [slug: string] }>();

const openGroups = ref<Set<string>>(new Set());

const isDesktop = computed(() => props.variant === "desktop");

const groupClass = computed(() =>
  isDesktop.value
    ? "flex w-full items-center justify-between px-4 py-3 text-left transition-all duration-200 hover:translate-x-1 hover:bg-customyellow/15"
    : "flex w-full items-center rounded-lg py-2 pl-8 pr-3 text-sm transition-colors hover:bg-muted"
);

const labelClass = computed(() =>
  isDesktop.value ? "text-base font-bold text-foreground" : ""
);

const subClass = computed(() =>
  isDesktop.value
    ? "flex w-full items-center py-2 pl-8 pr-4 text-left text-sm font-medium text-foreground/90 transition-all duration-200 hover:translate-x-1 hover:bg-customyellow/10"
    : "flex w-full items-center rounded-lg py-2 pl-12 pr-3 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
);

const leafClass = computed(() =>
  isDesktop.value
    ? "flex w-full items-center px-4 py-3 text-left text-base font-bold text-foreground transition-all duration-200 hover:translate-x-1 hover:bg-customyellow/15"
    : "flex w-full items-center rounded-lg py-2 pl-8 pr-3 text-sm transition-colors hover:bg-muted"
);

function isOpen(slug: string) {
  return openGroups.value.has(slug);
}

function toggle(slug: string) {
  const next = new Set(openGroups.value);
  next.has(slug) ? next.delete(slug) : next.add(slug);
  openGroups.value = next;
}
</script>
