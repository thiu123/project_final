<template>
  <div class="h-full rounded-lg p-4" :class="TONES[tone].box">
    <div class="mb-1 text-xs font-medium" :class="TONES[tone].label">
      {{ label }}
    </div>
    <div class="text-base font-bold" :class="TONES[tone].value">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * The tinted fact boxes on the order status page. The palette lives here as
 * whole class strings because Tailwind only keeps classes it can see written
 * out — an interpolated `bg-${tone}-50` would be purged from the build.
 */
const TONES = {
  blue: {
    box: "bg-blue-50 dark:bg-blue-950/40",
    label: "text-blue-700 dark:text-blue-300",
    value: "text-blue-900 dark:text-blue-100",
  },
  purple: {
    box: "bg-purple-50 dark:bg-purple-950/40",
    label: "text-purple-700 dark:text-purple-300",
    value: "text-purple-900 dark:text-purple-100",
  },
  orange: {
    box: "bg-orange-50 dark:bg-orange-950/40",
    label: "text-orange-700 dark:text-orange-300",
    value: "text-orange-900 dark:text-orange-100",
  },
  green: {
    box: "bg-green-50 dark:bg-green-950/40",
    label: "text-green-700 dark:text-green-300",
    value: "text-green-900 dark:text-green-100",
  },
  sky: {
    box: "bg-sky-50 dark:bg-sky-950/40",
    label: "text-sky-700 dark:text-sky-300",
    value: "text-sky-900 dark:text-sky-100",
  },
} as const;

defineProps<{
  label: string;
  tone: keyof typeof TONES;
}>();
</script>
