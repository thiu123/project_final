<template>
  <div class="flex items-start gap-3">
    <component :is="icon" class="h-5 w-5 shrink-0 text-muted-foreground" />
    <div>
      <p class="text-sm font-medium">{{ label }}</p>
      <p class="text-sm text-muted-foreground">
        <slot />
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from "vue";

defineProps<{
  icon: Component;
  label: string;
}>();
</script>
