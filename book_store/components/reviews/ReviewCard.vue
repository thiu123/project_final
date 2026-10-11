<template>
  <article
    class="rounded-2xl bg-card p-5 transition-shadow duration-300 hover:shadow-[0_16px_40px_-24px_hsl(var(--foreground)/0.4)] md:p-6"
    :class="own ? 'ring-2 ring-accent' : 'ring-1 ring-border'"
  >
    <header class="flex items-start gap-3">
      <UserAvatar
        :src="reviewAvatar(review)"
        :name="username"
        class="size-11 text-sm font-bold"
        :class="avatarTone(username)"
      >
        <User class="size-5" />
      </UserAvatar>

      <div class="min-w-0 grow">
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p class="truncate font-semibold">{{ username }}</p>
          <span
            v-if="own"
            class="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground"
          >
            You
          </span>
        </div>
        <div class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <UiRating :model-value="review.rating" :size="14" readonly />
          <span class="text-xs text-muted-foreground">
            {{ formatReviewDate(review.createdAt) }}
          </span>
        </div>
      </div>

      <div v-if="own" class="flex shrink-0 gap-1">
        <button
          type="button"
          class="flex size-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground active:scale-90"
          aria-label="Edit review"
          title="Edit review"
          @click="emit('edit', review)"
        >
          <Pencil class="size-4" />
        </button>
        <button
          type="button"
          class="flex size-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive active:scale-90"
          aria-label="Delete my review"
          title="Delete my review"
          @click="emit('delete', review)"
        >
          <Trash2 class="size-4" />
        </button>
      </div>
    </header>

    <p class="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-foreground/90">
      {{ review.comment }}
    </p>

    <div
      v-for="(reply, index) in review.replies"
      :key="reply._id ?? index"
      class="mt-4 rounded-2xl rounded-tl-sm bg-muted/70 p-4 md:ml-14"
    >
      <div class="flex flex-wrap items-center gap-2">
        <span
          class="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-background"
        >
          <ShieldCheck class="size-3.5" />
        </span>
        <span class="text-sm font-semibold">{{ replyAdminName(reply) }}</span>
        <span
          class="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary"
        >
          Store team
        </span>
        <span class="text-xs text-muted-foreground">
          {{ formatReviewDate(reply.createdAt) }}
        </span>

        <div v-if="isAdmin && isOwnReply(reply, currentUser)" class="ml-auto flex gap-1">
          <button
            type="button"
            class="flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-background hover:text-foreground active:scale-90"
            aria-label="Edit reply"
            title="Edit reply"
            @click="emit('edit-reply', review, reply)"
          >
            <Pencil class="size-3.5" />
          </button>
          <button
            type="button"
            class="flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive active:scale-90"
            aria-label="Delete reply"
            title="Delete reply"
            @click="emit('delete-reply', review, reply)"
          >
            <Trash2 class="size-3.5" />
          </button>
        </div>
      </div>
      <p class="mt-2 whitespace-pre-line text-sm leading-relaxed">{{ reply.content }}</p>
    </div>

    <div v-if="isAdmin" class="mt-4 md:ml-14">
      <button
        v-if="!replying"
        type="button"
        class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        @click="replying = true"
      >
        <Reply class="size-4" />
        Reply as store
      </button>

      <div
        v-else
        class="rounded-2xl border border-border bg-background p-3 focus-within:ring-2 focus-within:ring-ring"
      >
        <textarea
          v-model="draftReply"
          rows="3"
          aria-label="Store reply"
          placeholder="Write a reply from the store..."
          class="w-full resize-none bg-transparent px-1 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none"
        ></textarea>
        <div class="mt-2 flex justify-end gap-2">
          <UiButton
            variant="ghost"
            size="sm"
            class="rounded-full"
            :disabled="posting"
            @click="cancelReply"
          >
            Cancel
          </UiButton>
          <UiButton
            variant="ink"
            size="sm"
            class="rounded-full px-4 shadow-none"
            :disabled="!draftReply.trim()"
            :loading="posting"
            @click="postReply"
          >
            <Send />
            Post reply
          </UiButton>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { Pencil, Reply, Send, ShieldCheck, Trash2, User } from "lucide-vue-next";
import { createReply } from "@/api/reviewApi";
import {
  avatarTone,
  formatReviewDate,
  isOwnReply,
  isOwnReview,
  replyAdminName,
  reviewAvatar,
  reviewUsername,
} from "@/utils/reviews";
import type { Review, ReviewReply, User as UserType } from "@/types";

const props = defineProps<{
  review: Review;
  currentUser: UserType | null;
  isAdmin: boolean;
}>();

const emit = defineEmits<{
  edit: [review: Review];
  delete: [review: Review];
  "edit-reply": [review: Review, reply: ReviewReply];
  "delete-reply": [review: Review, reply: ReviewReply];
  /** A reply was posted; the page reloads the thread. */
  replied: [];
  error: [message: string];
}>();

const username = computed(() => reviewUsername(props.review));
const own = computed(() => isOwnReview(props.review, props.currentUser));

// The draft lives with the card rather than in a keyed map on the page, so it
// is disposed of along with the row it belongs to.
const draftReply = ref("");
const posting = ref(false);
const replying = ref(false);

function cancelReply() {
  draftReply.value = "";
  replying.value = false;
}

async function postReply() {
  const content = draftReply.value.trim();
  if (!content) return;

  posting.value = true;
  try {
    await createReply(props.review._id, content);
    draftReply.value = "";
    replying.value = false;
    emit("replied");
  } catch (error) {
    console.error("Error adding reply:", error);
    emit("error", "Failed to add reply. Please try again.");
  } finally {
    posting.value = false;
  }
}
</script>
