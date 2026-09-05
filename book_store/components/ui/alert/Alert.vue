<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { AlertVariants } from '.'
import { computed } from 'vue'
import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
  X,
} from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { alertVariants } from '.'

const props = withDefaults(defineProps<{
  class?: HTMLAttributes['class']
  variant?: AlertVariants['variant']
  /** Optional heading rendered above the default slot. */
  title?: string
  /** Render a dismiss button that emits `close`. */
  closable?: boolean
  /** Auto status icon; set false for the plain shadcn layout. */
  icon?: boolean
}>(), {
  closable: false,
  icon: true,
})

defineEmits<{ close: [] }>()

const iconComponent = computed(() => {
  switch (props.variant) {
    case 'success':
      return CheckCircle2
    case 'warning':
      return TriangleAlert
    case 'error':
    case 'destructive':
      return AlertCircle
    default:
      return Info
  }
})
</script>

<template>
  <div :class="cn(alertVariants({ variant }), 'flex items-start gap-3', props.class)" role="alert">
    <component :is="iconComponent" v-if="icon" class="size-4 shrink-0 translate-y-0.5" />

    <div class="flex-1 [&_p]:leading-relaxed">
      <div v-if="title" class="mb-1 font-medium leading-none tracking-tight">
        {{ title }}
      </div>
      <slot />
    </div>

    <button
      v-if="closable"
      type="button"
      class="ml-2 shrink-0 rounded-md p-0.5 opacity-70 transition-opacity hover:opacity-100"
      aria-label="Close"
      @click="$emit('close')"
    >
      <X class="size-4" />
    </button>
  </div>
</template>
