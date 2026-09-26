<template>
  <div class="bg-card px-5 py-4">
    <div
      class="flex items-center gap-2 text-[13px] font-medium text-muted-foreground"
    >
      <component :is="icon" v-if="icon" class="h-4 w-4 shrink-0" />
      <span class="truncate">{{ label }}</span>
    </div>
    <UiSkeleton v-if="loading" class="mt-2.5 h-7 w-24 bg-muted" />
    <div
      v-else
      class="mt-1.5 truncate text-2xl font-semibold tracking-tight tabular-nums text-foreground"
    >
      {{ value }}
    </div>
    <p v-if="hint" class="mt-1 truncate text-xs text-muted-foreground">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Component } from "vue";

defineProps<{
  label: string;
  value: string | number;
  icon?: Component;
  hint?: string;
  loading?: boolean;
}>();
</script>
