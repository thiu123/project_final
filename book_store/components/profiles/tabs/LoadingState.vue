<template>
  <div class="p-12 text-center">
    <UiSpinner size="xl" class="mx-auto text-waterblue" />
    <p class="mt-6 text-base text-muted-foreground">{{ label }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string }>();
</script>
