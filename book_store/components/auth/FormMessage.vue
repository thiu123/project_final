<template>
  <p
    :role="tone === 'error' ? 'alert' : 'status'"
    :class="[
      'flex items-start gap-2.5 rounded-md border px-3 py-2.5 text-sm leading-snug text-foreground',
      TONES[tone].box,
    ]"
  >
    <component :is="TONES[tone].icon" :class="['mt-px h-4 w-4 shrink-0', TONES[tone].iconClass]" />
    <span><slot /></span>
  </p>
</template>

<script setup lang="ts">
import type { Component } from "vue";
import { CircleAlert, CircleCheck, Info } from "lucide-vue-next";

type Tone = "info" | "error" | "success";

withDefaults(defineProps<{ tone?: Tone }>(), { tone: "info" });

const TONES: Record<Tone, { box: string; icon: Component; iconClass: string }> = {
  info: { box: "border-primary/25 bg-primary/10", icon: Info, iconClass: "text-primary" },
  error: {
    box: "border-destructive/30 bg-destructive/10",
    icon: CircleAlert,
    iconClass: "text-destructive",
  },
  success: {
    box: "border-success/30 bg-success/10",
    icon: CircleCheck,
    iconClass: "text-success",
  },
};
</script>
