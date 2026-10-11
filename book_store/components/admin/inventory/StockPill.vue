<template>
  <AdminPill :tone="state.tone">{{ state.label }}</AdminPill>
</template>

<script setup lang="ts">
import { stockState } from "@/utils/inventory";

const props = defineProps<{
  stock: number;
  lowThreshold?: number;
}>();

const state = computed(() => stockState(props.stock, props.lowThreshold));
</script>
