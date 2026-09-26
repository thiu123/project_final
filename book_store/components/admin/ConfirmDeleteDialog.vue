<template>
  <UiDialog v-model:open="open">
    <UiDialogContent
      hide-close
      class="gap-0 p-0 sm:max-w-md"
      @pointer-down-outside.prevent
      @escape-key-down.prevent
    >
      <div class="flex gap-4 p-6">
        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive"
        >
          <TriangleAlert class="h-5 w-5" />
        </span>

        <div class="min-w-0 flex-1">
          <UiDialogTitle class="text-base font-semibold text-foreground">
            {{ title }}
          </UiDialogTitle>
          <UiDialogDescription class="mt-1.5 text-sm text-muted-foreground">
            {{ question }}
            This can't be undone.
          </UiDialogDescription>

          <div
            v-if="subject"
            class="mt-3 truncate rounded-md border border-border bg-muted/50 px-3 py-2 text-sm font-medium text-foreground"
          >
            {{ subject }}
          </div>
        </div>
      </div>

      <div
        class="flex flex-col-reverse gap-2 border-t border-border bg-muted/30 px-6 py-3 sm:flex-row sm:justify-end"
      >
        <UiButton variant="outline" :disabled="loading" @click="open = false">
          Cancel
        </UiButton>
        <UiButton
          variant="destructive"
          :loading="loading"
          @click="emit('confirm')"
        >
          Delete
        </UiButton>
      </div>
    </UiDialogContent>
  </UiDialog>
</template>

<script setup lang="ts">
import { TriangleAlert } from "lucide-vue-next";

withDefaults(
  defineProps<{
    question: string;
    title?: string;
    subject?: string;
    loading?: boolean;
  }>(),
  { title: "Delete permanently?", subject: "", loading: false }
);

const emit = defineEmits<{ confirm: [] }>();

const open = defineModel<boolean>("open", { default: false });
</script>
