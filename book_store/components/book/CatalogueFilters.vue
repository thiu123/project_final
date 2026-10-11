<template>
  <div class="divide-y divide-border">
    <section class="pb-9">
      <h2 class="eyebrow">Category</h2>

      <ul class="mt-5">
        <li>
          <BookCatalogueFilterOption
            label="All books"
            prominent
            :active="showingAll"
            @select="emit('select', ALL_SUBJECTS_SLUG)"
          />
        </li>

        <li v-for="category in categories" :key="category.slug">
          <template v-if="category.subcategories.length">
            <button
              type="button"
              class="group flex min-h-9 w-full items-center gap-4 py-1 text-left"
              :aria-expanded="isOpen(category)"
              @click="toggleCategory(category)"
            >
              <span class="flex min-w-0 grow items-center gap-2">
                <span
                  class="truncate text-[14px] leading-6 transition-colors group-hover:text-foreground"
                  :class="containsActive(category) ? 'font-medium text-foreground' : 'text-foreground/80'"
                >
                  {{ category.name }}
                </span>
                <Plus
                  class="size-3.5 shrink-0 text-muted-foreground transition-transform duration-300"
                  :class="{ 'rotate-45': isOpen(category) }"
                  :stroke-width="1.5"
                />
              </span>
              <span class="shrink-0 text-[12px] tabular-nums text-muted-foreground">
                {{ category.count }}
              </span>
            </button>

            <div v-if="isOpen(category)" class="mb-3 ml-[3px] mt-1 border-l border-border pl-4">
              <BookCatalogueFilterOption
                :label="`All ${category.name}`"
                :count="category.count"
                :active="activeSlug === category.slug"
                @select="emit('select', category.slug)"
              />
              <BookCatalogueFilterOption
                v-for="subcategory in category.subcategories"
                :key="subcategory.slug"
                :label="subcategory.name"
                :count="subcategory.count"
                :active="activeSlug === subcategory.slug"
                @select="emit('select', subcategory.slug)"
              />
            </div>
          </template>

          <BookCatalogueFilterOption
            v-else
            :label="category.name"
            :count="category.count"
            prominent
            :active="activeSlug === category.slug"
            @select="emit('select', category.slug)"
          />
        </li>
      </ul>
    </section>

    <section class="pt-9">
      <div class="flex items-center justify-between gap-4">
        <h2 class="eyebrow">Price</h2>
        <button
          v-if="selectedPrice"
          type="button"
          class="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
          @click="emit('update:selectedPrice', '')"
        >
          <span class="ed-link">Clear</span>
        </button>
      </div>

      <ul class="mt-5">
        <li v-for="range in PRICE_RANGES" :key="range.label">
          <button
            type="button"
            role="checkbox"
            class="group flex min-h-9 w-full items-center gap-3 py-1 text-left"
            :aria-checked="selectedPrice === range.label"
            @click="emit('update:selectedPrice', selectedPrice === range.label ? '' : range.label)"
          >
            <span
              class="flex size-4 shrink-0 items-center justify-center border transition-colors"
              :class="selectedPrice === range.label ? 'border-foreground' : 'border-input group-hover:border-foreground/60'"
            >
              <span
                class="size-2 bg-foreground transition-transform duration-300"
                :class="selectedPrice === range.label ? 'scale-100' : 'scale-0'"
              />
            </span>
            <span
              class="text-[14px] leading-6 tabular-nums transition-colors group-hover:text-foreground"
              :class="selectedPrice === range.label ? 'text-foreground' : 'text-muted-foreground'"
            >
              {{ range.label }}
            </span>
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Plus } from "lucide-vue-next";
import { ALL_SUBJECTS_SLUG, PRICE_RANGES } from "@/constants/catalogue";
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

const showingAll = computed(
  () => !props.activeSlug || props.activeSlug === ALL_SUBJECTS_SLUG
);

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
