<template>
  <div class="py-10 md:py-16">
    <p class="font-serif text-3xl italic leading-tight tracking-[-0.02em] md:text-[2.75rem]">{{ title }}</p>
    <p class="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-muted-foreground">
      <slot />
    </p>
    <UiButton tag="NuxtLink" :to="to" variant="ink" size="cta" class="mt-8 shadow-none">
      {{ actionLabel }}
    </UiButton>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    actionLabel: string;
    to?: string;
  }>(),
  { to: "/" }
);
</script>
