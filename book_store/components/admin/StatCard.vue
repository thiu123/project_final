<template>
  <UiCard
    class="rounded-2xl transition duration-200 hover:-translate-y-1 hover:shadow-md"
  >
    <div class="flex items-center p-4">
      <span
        class="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        :class="accentClass"
      >
        <component :is="icon" class="h-6 w-6" :class="iconClass" />
      </span>
      <div>
        <p class="text-xs text-muted-foreground">{{ label }}</p>
        <p class="text-2xl font-semibold tabular-nums text-foreground">
          {{ value }}
        </p>
      </div>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
import type { Component } from "vue";

defineProps<{
  label: string;
  value: string | number;
  icon: Component;
  /** Background of the icon chip, e.g. `bg-success`. */
  accentClass: string;
  /** Foreground of the icon, e.g. `text-success-foreground`. */
  iconClass: string;
}>();
</script>
