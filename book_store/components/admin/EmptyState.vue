<template>
  <div class="flex flex-col items-center px-6 py-14 text-center">
    <span
      class="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground"
    >
      <component :is="icon" class="h-5 w-5" />
    </span>
    <h3 class="mt-4 text-sm font-semibold text-foreground">{{ title }}</h3>
    <p
      v-if="description"
      class="mt-1 max-w-sm text-sm text-muted-foreground"
    >
      {{ description }}
    </p>
    <div v-if="$slots.default" class="mt-4">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from "vue";

defineProps<{
  icon: Component;
  title: string;
  description?: string;
}>();
</script>
