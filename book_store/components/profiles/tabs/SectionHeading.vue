<template>
  <div class="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-border pb-6 md:mb-10">
    <div class="min-w-0">
      <p v-if="eyebrow" class="eyebrow mb-4">{{ eyebrow }}</p>
      <h2 class="font-serif text-[1.85rem] font-normal leading-[1.05] tracking-[-0.02em] md:text-[2.4rem]">
        <slot>{{ title }}</slot>
      </h2>
      <p v-if="description" class="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-muted-foreground">
        {{ description }}
      </p>
    </div>
    <slot name="action" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
  eyebrow?: string;
  description?: string;
}>();
</script>
