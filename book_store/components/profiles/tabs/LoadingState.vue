<template>
  <div role="status" :aria-label="label">
    <div v-if="variant === 'grid'" class="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
      <div v-for="n in 4" :key="n">
        <UiSkeleton class="aspect-[4/5] rounded-none bg-muted" />
        <UiSkeleton class="mt-4 h-2.5 w-1/3 rounded-none bg-accent" />
        <UiSkeleton class="mt-3 h-4 w-3/4 rounded-none bg-accent" />
      </div>
    </div>

    <ul v-else class="divide-y divide-border border-b border-border">
      <li v-for="n in 4" :key="n" class="flex items-center gap-6 py-6">
        <UiSkeleton class="aspect-[2/3] w-12 shrink-0 rounded-none bg-accent" />
        <div class="flex-1 space-y-3">
          <UiSkeleton class="h-4 w-2/5 rounded-none bg-accent" />
          <UiSkeleton class="h-3 w-1/4 rounded-none bg-accent" />
        </div>
        <UiSkeleton class="hidden h-4 w-20 rounded-none bg-accent sm:block" />
      </li>
    </ul>

    <span class="sr-only">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ label: string; variant?: "rows" | "grid" }>(), {
  variant: "rows",
});
</script>
