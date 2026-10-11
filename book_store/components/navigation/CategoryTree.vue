<template>
  <ul class="border-l border-border pl-4">
    <li v-for="category in categories" :key="category.slug">
      <template v-if="category.subcategories.length">
        <button
          type="button"
          class="flex w-full items-center justify-between py-2.5 text-left text-[15px]"
          :aria-expanded="isOpen(category.slug)"
          @click="toggle(category.slug)"
        >
          {{ category.name }}
          <Plus
            class="size-4 text-muted-foreground transition-transform duration-300"
            :class="{ 'rotate-45': isOpen(category.slug) }"
          />
        </button>
        <ul v-if="isOpen(category.slug)" class="mb-2 space-y-0.5 pl-3">
          <li>
            <button
              type="button"
              class="w-full py-1.5 text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
              @click="emit('select', category.slug)"
            >
              All {{ category.name }}
            </button>
          </li>
          <li v-for="subcategory in category.subcategories" :key="subcategory.slug">
            <button
              type="button"
              class="w-full py-1.5 text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
              @click="emit('select', subcategory.slug)"
            >
              {{ subcategory.name }}
            </button>
          </li>
        </ul>
      </template>

      <button
        v-else
        type="button"
        class="w-full py-2.5 text-left text-[15px]"
        @click="emit('select', category.slug)"
      >
        {{ category.name }}
      </button>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { Plus } from "lucide-vue-next";
import type { CategoryNode } from "@/types";

defineProps<{
  categories: CategoryNode[];
}>();

const emit = defineEmits<{ select: [slug: string] }>();

const openGroups = ref<Set<string>>(new Set());

function isOpen(slug: string) {
  return openGroups.value.has(slug);
}

function toggle(slug: string) {
  const next = new Set(openGroups.value);
  next.has(slug) ? next.delete(slug) : next.add(slug);
  openGroups.value = next;
}
</script>
