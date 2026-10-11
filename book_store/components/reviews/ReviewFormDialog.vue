<template>
  <UiDialog v-model:open="open">
    <UiDialogContent
      hide-close
      class="w-[calc(100%-2rem)] gap-0 p-0 shadow-none sm:max-w-lg"
      @pointer-down-outside.prevent
      @escape-key-down.prevent
    >
      <div class="px-6 pb-2 pt-8 sm:px-8">
        <p class="eyebrow">{{ review ? "Edit your review" : "Write a review" }}</p>
        <UiDialogTitle class="mt-4 font-serif text-3xl font-normal leading-tight tracking-[-0.02em]">
          How did you <span class="italic">find it?</span>
        </UiDialogTitle>

        <div class="mt-6 flex items-center gap-4">
          <UiRating v-model="rating" :length="5" :size="28" />
          <span class="text-sm text-muted-foreground" aria-live="polite">{{ RATING_LABELS[rating] }}</span>
        </div>
      </div>

      <div class="px-6 pt-6 sm:px-8">
        <label for="review-comment" class="eyebrow block">Your thoughts</label>
        <textarea
          id="review-comment"
          v-model="comment"
          rows="5"
          placeholder="What stayed with you? Who would you hand this book to?"
          class="mt-3 w-full resize-none border bg-transparent p-4 font-serif text-lg leading-relaxed placeholder:font-sans placeholder:text-sm placeholder:text-muted-foreground/70 focus:border-foreground focus:outline-none"
          :class="commentError ? 'border-destructive' : 'border-input'"
          @blur="validate"
        ></textarea>
        <p v-if="commentError" class="mt-2 text-xs text-destructive">{{ commentError }}</p>
      </div>

      <div class="mt-6 flex items-center justify-end gap-2 border-t border-border px-6 py-4 sm:px-8">
        <UiButton variant="ghost" class="uppercase tracking-[0.14em]" @click="open = false">
          Cancel
        </UiButton>
        <UiButton
          variant="ink"
          size="cta"
          class="h-10 px-6 shadow-none"
          :disabled="!rating || !comment.trim()"
          :loading="saving"
          @click="submit"
        >
          {{ submitLabel }}
        </UiButton>
      </div>
    </UiDialogContent>
  </UiDialog>
</template>

<script setup lang="ts">
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

const RATING_LABELS = [
  "Tap a star to rate",
  "Not for me",
  "It was okay",
  "Liked it",
  "Really liked it",
  "Loved it",
];

const rating = ref(0);
const comment = ref("");
const commentError = ref("");

const submitLabel = computed(() => (props.review ? "Save changes" : "Post review"));

watch(open, (isOpen) => {
  if (!isOpen) return;
  rating.value = props.review?.rating ?? 0;
  comment.value = props.review?.comment ?? "";
  commentError.value = "";
});

function validate() {
  commentError.value = comment.value.trim() ? "" : "Tell other readers a little about it.";
}

function submit() {
  validate();
  if (!rating.value || commentError.value) return;
  emit("submit", rating.value, comment.value.trim());
}
</script>
