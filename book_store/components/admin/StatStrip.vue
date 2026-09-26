<template>
  <div
    class="mb-6 grid gap-px overflow-hidden rounded-xl border border-border bg-border shadow-sm"
    :class="columns"
  >
    <AdminStatCard
      v-for="item in items"
      :key="item.label"
      v-bind="item"
      :loading="loading"
    />
  </div>
</template>

<script setup lang="ts">
import type { AdminStat } from "@/types/admin";

const props = defineProps<{
  items: AdminStat[];
  loading?: boolean;
}>();

const columns = computed(() => {
  if (props.items.length === 3) return "grid-cols-1 sm:grid-cols-3";
  if (props.items.length === 2) return "grid-cols-2";
  return "grid-cols-2 lg:grid-cols-4";
});
</script>
