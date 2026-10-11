<template>
  <p
    :role="tone === 'error' ? 'alert' : 'status'"
    class="flex items-start gap-3 bg-muted px-4 py-3 text-[14px] leading-relaxed text-foreground"
  >
    <span class="mt-[0.6em] size-1.5 shrink-0 rounded-full" :class="DOTS[tone]" aria-hidden="true" />
    <span><slot /></span>
  </p>
</template>

<script setup lang="ts">
type Tone = "info" | "error" | "success";

withDefaults(defineProps<{ tone?: Tone }>(), { tone: "info" });

const DOTS: Record<Tone, string> = {
  info: "bg-foreground",
  error: "bg-destructive",
  success: "bg-success",
};
</script>
