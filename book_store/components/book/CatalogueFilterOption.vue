<template>
  <button
    type="button"
    class="mx-2 flex w-[calc(100%-1rem)] items-center justify-between rounded-lg px-3 py-2 pl-11 text-left text-sm font-medium transition-all hover:translate-x-1 hover:bg-primary/10"
    :class="{ 'bg-primary/10 text-primary': active }"
    @click="emit('select')"
  >
    <span>{{ label }}</span>
    <span class="text-xs text-muted-foreground">{{ count }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  count: number;
  active: boolean;
}>();

const emit = defineEmits<{ select: [] }>();
</script>
