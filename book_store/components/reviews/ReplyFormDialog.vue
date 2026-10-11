<template>
  <UiDialog v-model:open="open">
    <UiDialogContent
      hide-close
      class="w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-lg sm:rounded-3xl"
      @pointer-down-outside.prevent
      @escape-key-down.prevent
    >
      <div class="flex items-center gap-3 px-6 pt-6">
        <span
          class="flex size-10 -rotate-6 items-center justify-center rounded-xl bg-foreground text-background"
        >
          <ShieldCheck class="size-5" />
        </span>
        <div>
          <UiDialogTitle class="text-lg font-bold tracking-tight">Edit store reply</UiDialogTitle>
          <p class="text-sm text-muted-foreground">Readers see this under their review.</p>
        </div>
      </div>

      <div class="p-6">
        <textarea
          v-model="content"
          rows="4"
          aria-label="Reply content"
          class="w-full resize-none rounded-2xl border bg-background p-4 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          :class="error ? 'border-destructive' : 'border-input'"
          @blur="validate"
        ></textarea>
        <p v-if="error" class="mt-1.5 text-xs text-destructive">{{ error }}</p>
      </div>

      <div class="flex items-center justify-end gap-2 px-6 pb-6">
        <UiButton variant="ghost" class="rounded-full" @click="open = false">
          Cancel
        </UiButton>
        <UiButton
          variant="ink"
          class="rounded-full px-5 shadow-none"
          :disabled="!content.trim()"
          :loading="saving"
          @click="submit"
        >
          <Check />
          Update reply
        </UiButton>
      </div>
    </UiDialogContent>
  </UiDialog>
</template>

<script setup lang="ts">
import { Check, ShieldCheck } from "lucide-vue-next";

const props = defineProps<{
  /** Text the reply currently holds, loaded when the dialog opens. */
  initialContent: string;
  saving: boolean;
}>();

const emit = defineEmits<{
  submit: [content: string];
}>();

const open = defineModel<boolean>("open", { default: false });

const content = ref("");
const error = ref("");

watch(open, (isOpen) => {
  if (!isOpen) return;
  content.value = props.initialContent;
  error.value = "";
});

function validate() {
  error.value = content.value.trim() ? "" : "Reply content is required";
}

function submit() {
  validate();
  if (error.value) return;
  emit("submit", content.value.trim());
}
</script>
