<template>
  <UiDialog v-model:open="open">
    <UiDialogContent
      hide-close
      class="gap-0 p-0 sm:max-w-lg"
      @pointer-down-outside.prevent
      @escape-key-down.prevent
    >
      <div class="px-6 pb-8 pt-8 text-center">
        <div
          class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive"
        >
          <Trash2 class="h-10 w-10 text-white" />
        </div>

        <UiDialogTitle class="mb-4 text-2xl font-bold text-foreground">
          Confirm Deletion
        </UiDialogTitle>

        <UiDialogDescription class="mb-3 text-base text-foreground">
          {{ question }}
        </UiDialogDescription>

        <UiAlert v-if="subject" variant="warning" class="text-left">
          <div class="font-medium">{{ subject }}</div>
          <div class="text-xs opacity-80">This action cannot be undone.</div>
        </UiAlert>

        <div class="mt-6 flex justify-center gap-3">
          <UiButton
            variant="outline"
            size="lg"
            class="min-w-[100px]"
            @click="open = false"
          >
            Cancel
          </UiButton>
          <UiButton
            variant="destructive"
            size="lg"
            class="min-w-[100px]"
            :loading="loading"
            @click="emit('confirm')"
          >
            <Trash2 v-if="!loading" class="h-4 w-4" />
            Delete
          </UiButton>
        </div>
      </div>
    </UiDialogContent>
  </UiDialog>
</template>

<script setup lang="ts">
import { Trash2 } from "lucide-vue-next";

withDefaults(
  defineProps<{
    question: string;
    /** Name of the thing being deleted, shown in the warning box. */
    subject?: string;
    loading?: boolean;
  }>(),
  { subject: "", loading: false }
);

const emit = defineEmits<{ confirm: [] }>();

const open = defineModel<boolean>("open", { default: false });
</script>
