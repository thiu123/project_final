<template>
  <span
    class="whitespace-nowrap font-serif font-medium leading-none tracking-[-0.02em] text-foreground"
    :class="size === 'lg' ? 'text-[2rem]' : size === 'sm' ? 'text-xl' : 'text-[1.65rem]'"
  >
    TH<span class="font-normal italic">Book</span>Store
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: "sm" | "md" | "lg" }>(), { size: "md" });
</script>
