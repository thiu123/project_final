<template>
  <UiDialog v-model:open="open">
    <UiDialogContent
      hide-close
      class="w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-lg sm:rounded-3xl"
      @pointer-down-outside.prevent
      @escape-key-down.prevent
    >
      <div class="relative isolate overflow-hidden bg-muted/70 px-6 pb-6 pt-8 text-center">
        <div
          aria-hidden="true"
          class="absolute -right-10 -top-10 -z-10 size-32 rounded-full bg-accent dark:bg-accent/80"
        ></div>
        <div
          aria-hidden="true"
          class="absolute -bottom-6 -left-4 -z-10 size-16 rotate-12 rounded-2xl bg-primary/25"
        ></div>

        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {{ review ? "Edit your review" : "Write a review" }}
        </p>
        <UiDialogTitle class="mt-2 text-2xl font-bold tracking-tight">
          How did you find it?
        </UiDialogTitle>

        <div class="mt-5 flex justify-center">
          <UiRating v-model="rating" :length="5" :size="40" />
        </div>
        <p class="mt-2 h-5 text-sm font-semibold" aria-live="polite">
          {{ RATING_LABELS[rating] }}
        </p>
      </div>

      <div class="p-6">
        <label for="review-comment" class="mb-2 block text-sm font-semibold">
          Your thoughts
        </label>
        <textarea
          id="review-comment"
          v-model="comment"
          rows="5"
          placeholder="What stayed with you? Who would you hand this book to?"
          class="w-full resize-none rounded-2xl border bg-background p-4 text-sm leading-relaxed placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          :class="commentError ? 'border-destructive' : 'border-input'"
          @blur="validate"
        ></textarea>
        <p v-if="commentError" class="mt-1.5 text-xs text-destructive">{{ commentError }}</p>
      </div>

      <div class="flex items-center justify-end gap-2 px-6 pb-6">
        <UiButton variant="ghost" class="rounded-full" @click="open = false">
          Cancel
        </UiButton>
        <UiButton
          variant="ink"
          class="rounded-full px-5 shadow-none"
          :disabled="!rating || !comment.trim()"
          :loading="saving"
          @click="submit"
        >
          <Send />
          {{ submitLabel }}
        </UiButton>
      </div>
    </UiDialogContent>
  </UiDialog>
</template>

<script setup lang="ts">
import { Send } from "lucide-vue-next";
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
