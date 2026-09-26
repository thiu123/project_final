<template>
  <span
    class="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset"
    :class="toneClass"
  >
    <component :is="resolvedIcon" v-if="resolvedIcon" class="h-3 w-3 shrink-0" />
    <slot />
  </span>
</template>

<script setup lang="ts">
import type { Component } from "vue";
import {
  orderStatusIcon,
  orderStatusSoftClass,
  softToneClass,
  type BadgeVariant,
} from "@/utils/orderStatus";

const props = withDefaults(
  defineProps<{
    tone?: BadgeVariant;
    status?: string;
    icon?: Component;
  }>(),
  { tone: "muted", status: undefined, icon: undefined }
);

const toneClass = computed(() =>
  props.status ? orderStatusSoftClass(props.status) : softToneClass(props.tone)
);

const resolvedIcon = computed(
  () => props.icon ?? (props.status ? orderStatusIcon(props.status) : undefined)
);
</script>
