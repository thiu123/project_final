<template>
  <div class="flex items-center gap-1">
    <UiSelect
      :model-value="selected"
      @update:model-value="selected = ($event as string) || undefined"
    >
      <UiSelectTrigger class="w-full">
        <UiSelectValue :placeholder="placeholder" />
      </UiSelectTrigger>
      <UiSelectContent>
        <UiSelectItem
          v-for="option in options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </UiSelectItem>
      </UiSelectContent>
    </UiSelect>

    <UiButton
      v-if="selected"
      variant="ghost"
      size="iconSm"
      :aria-label="clearLabel"
      @click="selected = undefined"
    >
      <X class="h-4 w-4" />
    </UiButton>
  </div>
</template>

<script setup lang="ts">
import { X } from "lucide-vue-next";

/**
 * A select with a clear button. `UiSelect` has no built-in way to return to
 * "nothing selected", so the button beside it does that job.
 */
defineProps<{
  options: { label: string; value: string }[];
  placeholder: string;
  clearLabel: string;
}>();

const selected = defineModel<string | undefined>({ required: true });
</script>
