<template>
  <NuxtLink v-if="to" :to="to" :class="CLASSES">
    <slot />
  </NuxtLink>
  <button v-else type="button" :class="CLASSES">
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{ to?: string }>();

const CLASSES =
  "inline-flex items-center gap-1.5 rounded-sm font-medium text-foreground underline decoration-primary decoration-2 underline-offset-4 transition-colors hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
</script>
