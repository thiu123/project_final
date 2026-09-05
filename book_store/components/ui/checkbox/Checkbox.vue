<script setup lang="ts">
import type { CheckboxRootEmits, CheckboxRootProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { Check } from 'lucide-vue-next'
import { CheckboxIndicator, CheckboxRoot, useForwardPropsEmits } from 'reka-ui'
import { cn } from '@/lib/utils'

// Extended over the stock shadcn Checkbox: the default slot carries the LABEL
// text (not the indicator glyph), so the control ships with its own <label>.
const props = defineProps<CheckboxRootProps & {
  class?: HTMLAttributes['class']
  label?: string
  wrapperClass?: HTMLAttributes['class']
}>()

const emits = defineEmits<CheckboxRootEmits>()

const delegatedProps = reactiveOmit(props, 'class', 'label', 'wrapperClass')

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <label
    :class="cn(
      'flex cursor-pointer select-none items-center gap-2',
      props.disabled && 'cursor-not-allowed opacity-50',
      props.wrapperClass,
    )"
  >
    <CheckboxRoot
      v-bind="forwarded"
      :class="cn(
        'grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        props.class,
      )"
    >
      <CheckboxIndicator class="grid place-content-center text-current">
        <Check class="h-4 w-4" />
      </CheckboxIndicator>
    </CheckboxRoot>

    <span v-if="label || $slots.default" class="text-sm text-foreground">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>
