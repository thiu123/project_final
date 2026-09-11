<template>
  <div>
    <UiLabel class="mb-1.5 block">{{ label }}</UiLabel>
    <div
      class="flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-sm shadow-sm transition-colors focus-within:ring-2 focus-within:ring-ring"
      :class="[
        errorMessage ? 'border-destructive' : 'border-input',
        capitalize && 'capitalize',
      ]"
    >
      <component :is="icon" class="h-4 w-4 shrink-0 text-muted-foreground" />

      <UiBadge
        v-for="(tag, index) in tags"
        :key="tag"
        variant="secondary"
        class="gap-1"
        :class="capitalize && 'capitalize'"
      >
        {{ tag }}
        <button type="button" :aria-label="`Remove ${tag}`" @click="remove(index)">
          <X class="h-3 w-3" />
        </button>
      </UiBadge>

      <input
        v-model="draft"
        type="text"
        :list="suggestions.length ? listId : undefined"
        class="min-w-[100px] flex-1 bg-transparent py-0.5 outline-none placeholder:text-muted-foreground"
        :placeholder="placeholder"
        @keydown.enter.prevent="commit"
        @blur="commit"
      />

      <datalist v-if="suggestions.length" :id="listId">
        <option v-for="suggestion in suggestions" :key="suggestion" :value="suggestion" />
      </datalist>
    </div>

    <p v-if="errorMessage" class="mt-1 text-xs text-destructive">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Component } from "vue";
import { X } from "lucide-vue-next";

/**
 * The authors and categories fields were two copies of the same
 * chips-plus-text-input; this is the one implementation behind both.
 */
withDefaults(
  defineProps<{
    label: string;
    placeholder: string;
    icon: Component;
    suggestions?: string[];
    capitalize?: boolean;
    errorMessage?: string;
  }>(),
  { suggestions: () => [], capitalize: false, errorMessage: "" }
);

const tags = defineModel<string[]>({ required: true });

const listId = useId();
const draft = ref("");

function commit() {
  const value = draft.value.trim();
  draft.value = "";
  if (value && !tags.value.includes(value)) {
    tags.value = [...tags.value, value];
  }
}

function remove(index: number) {
  tags.value = tags.value.filter((_, i) => i !== index);
}
</script>
