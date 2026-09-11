<template>
  <div class="mb-6 flex items-center">
    <component :is="icon" class="mr-3 h-8 w-8 text-waterblue" />
    <h2 class="text-3xl font-bold text-foreground">{{ title }}</h2>
  </div>
</template>

<script setup lang="ts">
import type { Component } from "vue";

defineProps<{
  icon: Component;
  title: string;
}>();
</script>
