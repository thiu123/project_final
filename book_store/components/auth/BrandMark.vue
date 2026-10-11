<template>
  <StoreWordmark :size="size" />
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: "sm" | "md" | "lg" }>(), { size: "md" });
</script>
