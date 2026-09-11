<template>
  <div class="mb-6">
    <h3 class="mb-4 flex items-center text-lg font-medium" :class="accentClass">
      <component :is="icon" class="mr-2 h-5 w-5" />
      {{ title }}
    </h3>
    <div class="grid grid-cols-12 gap-4">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from "vue";

defineProps<{
  icon: Component;
  title: string;
  /** Heading colour, e.g. `text-primary`. Kept off the root so it does not
   *  cascade onto the fields in the slot. */
  accentClass: string;
}>();
</script>
