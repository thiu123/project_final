<template>
  <div class="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-5 py-4">
    <dt class="eyebrow pt-[5px] leading-snug">{{ label }}</dt>
    <dd class="min-w-0 text-[15px] leading-relaxed text-foreground">
      <slot />
    </dd>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
}>();
</script>
