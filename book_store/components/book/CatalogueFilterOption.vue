<template>
  <button
    type="button"
    class="group flex min-h-9 w-full items-center gap-4 py-1 text-left"
    :aria-current="active ? 'true' : undefined"
    @click="emit('select')"
  >
    <span class="flex min-w-0 grow items-center">
      <span
        class="h-px shrink-0 bg-foreground transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        :class="active ? 'mr-2.5 w-3' : 'mr-0 w-0'"
      />
      <span
        class="truncate transition-colors"
        :class="
          active
            ? 'font-serif text-[17px] italic leading-6 text-foreground'
            : [
                'text-[14px] leading-6 group-hover:text-foreground',
                prominent ? 'text-foreground/80' : 'text-muted-foreground',
              ]
        "
      >
        {{ label }}
      </span>
    </span>
    <span
      v-if="count !== undefined"
      class="shrink-0 text-[12px] tabular-nums transition-colors"
      :class="active ? 'text-foreground' : 'text-muted-foreground'"
    >
      {{ count }}
    </span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  count?: number;
  active: boolean;
  prominent?: boolean;
}>();

const emit = defineEmits<{ select: [] }>();
</script>
