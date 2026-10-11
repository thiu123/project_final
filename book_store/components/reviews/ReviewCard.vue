<template>
  <article class="py-8">
    <header class="flex items-start justify-between gap-4">
      <div class="flex min-w-0 items-center gap-3">
        <UserAvatar
          :src="reviewAvatar(review)"
          :name="username"
          class="size-9 bg-muted text-xs font-semibold text-foreground"
        >
          <User class="size-4" :stroke-width="1.5" />
        </UserAvatar>
        <div class="min-w-0">
          <p class="flex items-center gap-2 truncate text-sm font-medium">
            {{ username }}
            <span v-if="own" class="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">You</span>
          </p>
          <p class="text-xs text-muted-foreground">{{ formatReviewDate(review.createdAt) }}</p>
        </div>
      </div>
      <UiRating :model-value="review.rating" :size="12" readonly class="shrink-0 pt-1" />
    </header>

    <p class="mt-5 whitespace-pre-line font-serif text-xl leading-relaxed text-foreground/90">
      {{ review.comment }}
    </p>

    <div v-if="own" class="mt-5 flex gap-5 text-[11px] font-medium uppercase tracking-[0.16em]">
      <button type="button" class="ed-link" @click="emit('edit', review)">Edit</button>
      <button type="button" class="ed-link text-destructive" @click="emit('delete', review)">Delete</button>
    </div>

    <div
      v-for="(reply, index) in review.replies"
      :key="reply._id ?? index"
      class="mt-6 border-l border-foreground pl-5"
    >
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
        <p class="eyebrow leading-normal">
          <span class="text-foreground">From the store</span>
          <span class="mx-2">&middot;</span>{{ replyAdminName(reply) }}
          <span class="mx-2">&middot;</span>{{ formatReviewDate(reply.createdAt) }}
        </p>
        <div
          v-if="isAdmin && isOwnReply(reply, currentUser)"
          class="ml-auto flex gap-4 text-[11px] font-medium uppercase tracking-[0.16em]"
        >
          <button type="button" class="ed-link" @click="emit('edit-reply', review, reply)">Edit</button>
          <button type="button" class="ed-link text-destructive" @click="emit('delete-reply', review, reply)">
            Delete
          </button>
        </div>
      </div>
      <p class="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-foreground/85">{{ reply.content }}</p>
    </div>

    <div v-if="isAdmin" class="mt-6">
      <button
        v-if="!replying"
        type="button"
        class="group inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
        @click="replying = true"
      >
        <Reply class="size-3.5" :stroke-width="1.5" />
        <span class="ed-link">Reply as store</span>
      </button>

      <div v-else class="border-l border-border pl-5">
        <textarea
          v-model="draftReply"
          rows="3"
          aria-label="Store reply"
          placeholder="Write a reply from the store..."
          class="w-full resize-none border-0 border-b border-input bg-transparent py-2 text-[15px] leading-relaxed placeholder:text-muted-foreground/70 focus:border-foreground focus:outline-none"
        ></textarea>
        <div class="mt-3 flex justify-end gap-2">
          <UiButton variant="ghost" size="sm" class="uppercase tracking-[0.14em]" :disabled="posting" @click="cancelReply">
            Cancel
          </UiButton>
          <UiButton
            variant="ink"
            size="sm"
            class="px-4 uppercase tracking-[0.14em] shadow-none"
            :disabled="!draftReply.trim()"
            :loading="posting"
            @click="postReply"
          >
            Post reply
          </UiButton>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { Reply, User } from "lucide-vue-next";
import { createReply } from "@/api/reviewApi";
import {
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
