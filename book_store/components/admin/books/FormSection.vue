<template>
  <section class="mb-6">
    <h3 class="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
      <component :is="icon" class="h-4 w-4 text-muted-foreground" />
      {{ title }}
    </h3>
    <div class="grid grid-cols-12 gap-4">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Component } from "vue";

defineProps<{
  icon: Component;
  title: string;
}>();
</script>
