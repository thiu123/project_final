<template>
  <NuxtLink v-if="to" :to="to" :class="[BASE_CLASS, TONES[tone]]">
    <ArrowLeft v-if="back" class="size-4 transition-transform duration-300 group-hover:-translate-x-1" :stroke-width="1.5" />
    <span class="ed-link"><slot /></span>
  </NuxtLink>
  <button v-else type="button" :class="[BASE_CLASS, TONES[tone]]">
    <ArrowLeft v-if="back" class="size-4 transition-transform duration-300 group-hover:-translate-x-1" :stroke-width="1.5" />
    <span class="ed-link"><slot /></span>
  </button>
</template>

<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";

type Tone = "default" | "muted";

withDefaults(defineProps<{ to?: string; back?: boolean; tone?: Tone }>(), {
  to: undefined,
  back: false,
  tone: "default",
});

const BASE_CLASS =
  "group inline-flex items-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

const TONES: Record<Tone, string> = {
  default: "text-foreground",
  muted: "text-muted-foreground hover:text-foreground",
};
</script>
