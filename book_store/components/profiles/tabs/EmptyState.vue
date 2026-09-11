<template>
  <div class="p-12 text-center">
    <component :is="icon" class="mx-auto mb-6 h-20 w-20 text-muted-foreground/40" />
    <h3 class="mb-3 text-2xl font-bold text-foreground">{{ title }}</h3>
    <p class="mx-auto mb-6 max-w-[400px] text-base text-muted-foreground">
      <slot />
    </p>
    <UiButton
      tag="NuxtLink"
      to="/"
      size="lg"
      class="rounded-lg bg-waterblue font-bold text-white shadow hover:bg-waterblue/90"
    >
      <component :is="actionIcon" class="mr-2 h-5 w-5" />
      {{ actionLabel }}
    </UiButton>
  </div>
</template>

<script setup lang="ts">
import type { Component } from "vue";

defineProps<{
  icon: Component;
  title: string;
  actionIcon: Component;
  actionLabel: string;
}>();
</script>
