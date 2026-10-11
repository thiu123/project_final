<template>
  <UiDialog v-model:open="open">
    <UiDialogContent
      hide-close
      class="w-[calc(100%-2rem)] gap-0 p-0 shadow-none sm:max-w-lg"
      @pointer-down-outside.prevent
      @escape-key-down.prevent
    >
      <div class="px-6 pt-8 sm:px-8">
        <p class="eyebrow">From the store</p>
        <UiDialogTitle class="mt-4 font-serif text-3xl font-normal leading-tight tracking-[-0.02em]">
          Edit <span class="italic">reply</span>
        </UiDialogTitle>
        <p class="mt-2 text-sm text-muted-foreground">Readers see this under their review.</p>
      </div>

      <div class="px-6 pt-6 sm:px-8">
        <textarea
          v-model="content"
          rows="4"
          aria-label="Reply content"
          class="w-full resize-none border bg-transparent p-4 text-[15px] leading-relaxed focus:border-foreground focus:outline-none"
          :class="error ? 'border-destructive' : 'border-input'"
          @blur="validate"
        ></textarea>
        <p v-if="error" class="mt-2 text-xs text-destructive">{{ error }}</p>
      </div>

      <div class="mt-6 flex items-center justify-end gap-2 border-t border-border px-6 py-4 sm:px-8">
        <UiButton variant="ghost" class="uppercase tracking-[0.14em]" @click="open = false">
          Cancel
        </UiButton>
        <UiButton
          variant="ink"
          size="cta"
          class="h-10 px-6 shadow-none"
          :disabled="!content.trim()"
          :loading="saving"
          @click="submit"
        >
          Update reply
        </UiButton>
      </div>
    </UiDialogContent>
  </UiDialog>
</template>

<script setup lang="ts">
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
