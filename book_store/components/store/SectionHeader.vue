<template>
  <div
    class="mb-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-border pb-6 md:mb-12"
  >
    <div class="min-w-0">
      <p v-if="eyebrow || number" class="eyebrow mb-4">
        <span v-if="number" class="tabular-nums text-foreground">{{ number }}</span>
        <span v-if="number && eyebrow" class="mx-2">&mdash;</span>
        {{ eyebrow }}
      </p>
      <h2 class="font-serif text-[2rem] font-normal leading-[1.05] tracking-[-0.02em] md:text-[2.75rem]">
        <slot>{{ title }}</slot>
      </h2>
      <p v-if="description" class="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-muted-foreground">
        {{ description }}
      </p>
    </div>

    <slot name="action">
      <NuxtLink
        v-if="to"
        :to="to"
        class="group inline-flex shrink-0 items-center gap-2 pb-1 text-[13px] font-medium uppercase tracking-[0.14em]"
      >
        <span class="ed-link">{{ linkLabel }}</span>
        <ArrowRight class="size-4 transition-transform duration-300 group-hover:translate-x-1" />
      </NuxtLink>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight } from "lucide-vue-next";

withDefaults(
  defineProps<{
    title?: string;
    eyebrow?: string;
    number?: string;
    description?: string;
    to?: string;
    linkLabel?: string;
  }>(),
  { linkLabel: "View all" }
);
</script>
