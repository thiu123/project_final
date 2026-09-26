<template>
  <section
    class="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm"
  >
    <div v-if="loading" class="admin-loading-bar" role="progressbar" aria-label="Loading" />

    <header
      v-if="title || $slots.actions"
      class="flex items-center justify-between gap-3 px-5 pt-4"
      :class="$slots.toolbar ? 'pb-0' : 'pb-4'"
    >
      <div class="min-w-0">
        <h2 class="truncate text-sm font-semibold text-foreground">
          {{ title }}
        </h2>
        <p v-if="description" class="mt-0.5 text-xs text-muted-foreground">
          {{ description }}
        </p>
      </div>
      <div v-if="$slots.actions" class="flex shrink-0 items-center gap-2">
        <slot name="actions" />
      </div>
    </header>

    <div
      v-if="$slots.toolbar"
      class="flex flex-col gap-2 border-b border-border px-4 py-3 md:flex-row md:items-center"
    >
      <slot name="toolbar" />
    </div>

    <slot />

    <footer v-if="$slots.footer" class="border-t border-border px-4 py-3">
      <slot name="footer" />
    </footer>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
  description?: string;
  loading?: boolean;
}>();
</script>
