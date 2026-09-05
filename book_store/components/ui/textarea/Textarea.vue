<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed, useAttrs } from 'vue'
import { useVModel } from '@vueuse/core'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  class?: HTMLAttributes['class']
  defaultValue?: string | number
  modelValue?: string | number | null
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
const textareaAttrs = computed(() => {
  const { class: _cls, ...rest } = attrs
  return rest
})
</script>

<template>
  <div :class="cn('w-full', props.wrapperClass)">
    <Label v-if="label" :for="($attrs.id as string) || undefined" class="mb-1.5 block">
      {{ label }}
    </Label>

    <textarea
      v-model="modelValue"
      v-bind="textareaAttrs"
      :class="cn(
        'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        errorMessage && 'border-destructive focus-visible:ring-destructive',
        props.class,
      )"
    />

    <p v-if="errorMessage" class="mt-1 text-xs text-destructive">
      {{ errorMessage }}
    </p>
    <p v-else-if="hint" class="mt-1 text-xs text-muted-foreground">
      {{ hint }}
    </p>
  </div>
</template>
