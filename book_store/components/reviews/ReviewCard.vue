<template>
  <div class="bg-card p-6 transition-colors hover:bg-muted/40">
    <!-- Reviewer -->
    <div class="mb-4 flex items-start justify-between gap-2">
      <div class="flex grow items-center">
        <UserAvatar
          :src="reviewAvatar(review)"
          :name="reviewUsername(review)"
          class="mr-3 size-10 bg-primary text-primary-foreground"
        >
          <User class="h-5 w-5" />
        </UserAvatar>

        <div class="grow">
          <h3 class="mb-1 text-lg font-bold text-primary">
            {{ reviewUsername(review) }}
          </h3>
          <div class="flex items-center">
            <UiRating :model-value="review.rating" :size="16" readonly class="mr-2" />
            <span class="text-xs text-muted-foreground">
              {{ formatReviewDate(review.createdAt) }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="isOwnReview(review, currentUser)" class="flex shrink-0">
        <UiTooltipProvider :delay-duration="200">
          <UiTooltip>
            <UiTooltipTrigger as-child>
              <UiButton
                variant="ghost"
                size="iconSm"
                class="mr-1 text-primary"
                aria-label="Edit review"
                @click="emit('edit', review)"
              >
                <Pencil class="h-4 w-4" />
              </UiButton>
            </UiTooltipTrigger>
            <UiTooltipContent side="top">Edit review</UiTooltipContent>
          </UiTooltip>

          <UiTooltip>
            <UiTooltipTrigger as-child>
              <UiButton
                variant="ghost"
                size="iconSm"
                class="text-destructive opacity-60 transition-all hover:scale-110 hover:opacity-100"
                aria-label="Delete my review"
                @click="emit('delete', review)"
              >
                <Trash2 class="h-4 w-4" />
              </UiButton>
            </UiTooltipTrigger>
            <UiTooltipContent side="top">Delete my review</UiTooltipContent>
          </UiTooltip>
        </UiTooltipProvider>
      </div>
    </div>

    <p class="text-base leading-relaxed text-foreground">{{ review.comment }}</p>

    <!-- Admin replies -->
    <div v-if="review.replies?.length" class="ml-8 mt-4">
      <div
        v-for="(reply, index) in review.replies"
        :key="reply._id ?? index"
        class="mb-3 rounded-lg border-l-[3px] border-l-primary bg-primary/5 p-4"
      >
        <div class="mb-2 flex items-center">
          <UiAvatar class="mr-2 size-8 bg-primary text-primary-foreground">
            <UiAvatarFallback class="flex h-full w-full items-center justify-center">
              <ShieldCheck class="h-4 w-4" />
            </UiAvatarFallback>
          </UiAvatar>

          <div class="grow">
            <span class="text-sm font-bold text-primary">
              {{ replyAdminName(reply) }}
            </span>
            <UiBadge class="ml-2 px-1.5 text-[10px]">Admin</UiBadge>
            <span class="ml-2 text-xs text-muted-foreground">
              · {{ formatReviewDate(reply.createdAt) }}
            </span>
          </div>

          <div v-if="isAdmin && isOwnReply(reply, currentUser)">
            <UiButton
              variant="ghost"
              size="iconSm"
              class="text-primary"
              aria-label="Edit reply"
              @click="emit('edit-reply', review, reply)"
            >
              <Pencil class="h-4 w-4" />
            </UiButton>
            <UiButton
              variant="ghost"
              size="iconSm"
              class="text-destructive"
              aria-label="Delete reply"
              @click="emit('delete-reply', review, reply)"
            >
              <Trash2 class="h-4 w-4" />
            </UiButton>
          </div>
        </div>

        <p class="ml-10 text-sm">{{ reply.content }}</p>
      </div>
    </div>

    <!-- Admin reply form -->
    <div v-if="isAdmin" class="ml-8 mt-3">
      <UiTextarea
        v-model="draftReply"
        label="Write admin reply..."
        :rows="2"
        wrapper-class="mb-2"
      />
      <UiButton
        size="sm"
        :disabled="!draftReply.trim()"
        :loading="posting"
        @click="postReply"
      >
        <Send class="h-3.5 w-3.5" />
        Post Reply
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Pencil, Send, ShieldCheck, Trash2, User } from "lucide-vue-next";
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

// The draft lives with the card rather than in a keyed map on the page, so it
// is disposed of along with the row it belongs to.
const draftReply = ref("");
const posting = ref(false);

async function postReply() {
  const content = draftReply.value.trim();
  if (!content) return;

  posting.value = true;
  try {
    await createReply(props.review._id, content);
    draftReply.value = "";
    emit("replied");
  } catch (error) {
    console.error("Error adding reply:", error);
    emit("error", "Failed to add reply. Please try again.");
  } finally {
    posting.value = false;
  }
}
</script>
