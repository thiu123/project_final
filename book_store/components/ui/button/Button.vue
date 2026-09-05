<script setup lang="ts">
import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import type { ButtonVariants } from '.'
import { computed } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import { Primitive } from 'reka-ui'
import { cn } from '@/lib/utils'
import { buttonVariants } from '.'

interface Props extends PrimitiveProps {
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  class?: HTMLAttributes['class']
  /** Show a spinner and block interaction. */
  loading?: boolean
  /** Stretch to the full width of the container. */
  block?: boolean
  disabled?: boolean
  /** Alias for `as`, kept for existing call sites. */
  tag?: PrimitiveProps['as']
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
  loading: false,
  block: false,
})

const resolvedAs = computed(() => props.tag ?? props.as)
</script>

<template>
  <Primitive
    :as="resolvedAs"
    :as-child="asChild"
    :disabled="disabled || loading || undefined"
    :class="cn(buttonVariants({ variant, size }), block && 'w-full', props.class)"
  >
    <Loader2 v-if="loading" class="size-4 animate-spin" />
    <slot />
  </Primitive>
</template>
