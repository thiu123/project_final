<template>
  <UiDialog v-model:open="open">
    <UiDialogContent
      hide-close
      class="gap-0 overflow-hidden p-0 sm:max-w-xl"
      @pointer-down-outside.prevent
      @escape-key-down.prevent
    >
      <UiDialogTitle class="sr-only">Edit Admin Reply</UiDialogTitle>

      <div
        class="flex items-center justify-center bg-primary p-6 pb-4 text-lg font-semibold text-primary-foreground"
      >
        <Pencil class="mr-2 h-5 w-5" />
        EDIT ADMIN REPLY
      </div>

      <div class="p-6">
        <UiTextarea
          v-model="content"
          label="Reply content"
          :rows="4"
          :error-message="error"
          @blur="validate"
        />
      </div>

      <div class="flex items-center justify-end p-6 pt-0">
        <UiButton variant="ghost" class="mr-3" @click="open = false">
          Cancel
        </UiButton>
        <UiButton :disabled="!content.trim()" :loading="saving" @click="submit">
          <Check class="h-4 w-4" />
          Update Reply
        </UiButton>
      </div>
    </UiDialogContent>
  </UiDialog>
</template>

<script setup lang="ts">
import { Check, Pencil } from "lucide-vue-next";

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
