<template>
  <tr v-for="row in rows" :key="row" class="hover:bg-transparent">
    <td v-for="col in columns" :key="col">
      <div v-if="col === 1" class="flex items-center gap-3">
        <UiSkeleton v-if="media" class="h-10 w-10 shrink-0 rounded-md bg-muted" />
        <div class="space-y-1.5">
          <UiSkeleton class="h-3.5 w-40 bg-muted" />
          <UiSkeleton class="h-3 w-24 bg-muted" />
        </div>
      </div>
      <UiSkeleton v-else class="h-3.5 bg-muted" :class="col % 2 ? 'w-14' : 'w-20'" />
    </td>
  </tr>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    columns: number;
    rows?: number;
    media?: boolean;
  }>(),
  { rows: 6, media: false }
);
</script>
