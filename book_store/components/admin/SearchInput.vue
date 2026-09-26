<template>
  <UiInput
    v-model="query"
    type="search"
    :placeholder="placeholder"
    :aria-label="placeholder"
    wrapper-class="md:max-w-sm"
    class="bg-background [&::-webkit-search-cancel-button]:hidden"
  >
    <template #prepend>
      <Search class="h-4 w-4" />
    </template>
    <template #append>
      <button
        v-if="query"
        type="button"
        class="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Clear search"
        @click="query = ''"
      >
        <X class="h-4 w-4" />
      </button>
    </template>
  </UiInput>
</template>

<script setup lang="ts">
import { Search, X } from "lucide-vue-next";

defineProps<{ placeholder: string }>();

const query = defineModel<string>({ required: true });
</script>
