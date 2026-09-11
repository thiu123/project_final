<template>
  <div class="h-full rounded-lg border border-border">
    <div class="flex items-center gap-2 px-4 pt-4 text-base font-bold">
      <component :is="icon" class="h-5 w-5" />
      {{ title }}
    </div>
    <div class="space-y-3 p-4">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from "vue";

defineProps<{
  icon: Component;
  title: string;
}>();
</script>
