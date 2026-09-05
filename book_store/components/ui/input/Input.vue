<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed, useAttrs } from 'vue'
import { useVModel } from '@vueuse/core'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number | null
  class?: HTMLAttributes['class']
  /** Optional field label rendered above the control. */
  label?: string
  /** Helper text shown when there is no error. */
  hint?: string
  /** Error text; also switches the border to destructive. */
  errorMessage?: string
  /** Class applied to the outer wrapper. */
  wrapperClass?: HTMLAttributes['class']
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
})

const attrs = useAttrs()
const inputAttrs = computed(() => {
  const { class: _cls, ...rest } = attrs
  return rest
})
</script>

<template>
  <div :class="cn('w-full', props.wrapperClass)">
    <Label v-if="label" :for="($attrs.id as string) || undefined" class="mb-1.5 block">
      {{ label }}
    </Label>

    <div class="relative">
      <span
        v-if="$slots.prepend"
        class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground"
      >
        <slot name="prepend" />
      </span>

      <input
        v-model="modelValue"
        v-bind="inputAttrs"
        :class="cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          $slots.prepend && 'pl-10',
          $slots.append && 'pr-10',
          errorMessage && 'border-destructive focus-visible:ring-destructive',
          props.class,
        )"
      >

      <span
        v-if="$slots.append"
        class="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
      >
        <slot name="append" />
      </span>
    </div>

    <p v-if="errorMessage" class="mt-1 text-xs text-destructive">
      {{ errorMessage }}
    </p>
    <p v-else-if="hint" class="mt-1 text-xs text-muted-foreground">
      {{ hint }}
    </p>
  </div>
</template>
