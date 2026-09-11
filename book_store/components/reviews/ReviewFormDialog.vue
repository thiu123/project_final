<template>
  <UiDialog v-model:open="open">
    <UiDialogContent
      hide-close
      class="gap-0 overflow-hidden p-0 sm:max-w-xl"
      @pointer-down-outside.prevent
      @escape-key-down.prevent
    >
      <UiDialogTitle class="sr-only">{{ title }}</UiDialogTitle>

      <div
        class="flex items-center justify-center bg-primary p-6 pb-4 text-lg font-semibold text-primary-foreground"
      >
        <Pencil class="mr-2 h-5 w-5" />
        {{ title.toUpperCase() }}
      </div>

      <div class="p-6">
        <div class="mb-6 text-center">
          <div class="mb-3 text-base text-muted-foreground">Rate this book:</div>
          <UiRating v-model="rating" :length="5" :size="40" class="mb-2" />
          <div class="text-xs text-muted-foreground">
            {{ rating > 0 ? `${rating} star${rating > 1 ? "s" : ""}` : "Select rating" }}
          </div>
        </div>

        <UiTextarea
          v-model="comment"
          label="Share your thoughts about this book..."
          :rows="4"
          :error-message="commentError"
          @blur="validate"
        />
      </div>

      <div class="flex items-center justify-end p-6 pt-0">
        <UiButton variant="ghost" class="mr-3" @click="open = false">
          Cancel
        </UiButton>
        <UiButton
          :disabled="!rating || !comment.trim()"
          :loading="saving"
          @click="submit"
        >
          <Send class="h-4 w-4" />
          {{ submitLabel }}
        </UiButton>
      </div>
    </UiDialogContent>
  </UiDialog>
</template>

<script setup lang="ts">
import { Pencil, Send } from "lucide-vue-next";
import type { Review } from "@/types";

/**
 * Writing a review and editing one differ only in their labels and what they
 * POST, so they share this dialog rather than two near-identical ones.
 */
const props = defineProps<{
  /** The review being edited, or `null` to write a new one. */
  review: Review | null;
  saving: boolean;
}>();

const emit = defineEmits<{
  submit: [rating: number, comment: string];
}>();

const open = defineModel<boolean>("open", { default: false });

const rating = ref(0);
const comment = ref("");
const commentError = ref("");

const title = computed(() =>
  props.review ? "Edit Review" : "Write a Book Review"
);

const submitLabel = computed(() => (props.review ? "Save" : "Submit Review"));

watch(open, (isOpen) => {
  if (!isOpen) return;
  rating.value = props.review?.rating ?? 0;
  comment.value = props.review?.comment ?? "";
  commentError.value = "";
});

function validate() {
  commentError.value = comment.value.trim() ? "" : "Review comment is required";
}

function submit() {
  validate();
  if (!rating.value || commentError.value) return;
  emit("submit", rating.value, comment.value.trim());
}
</script>
