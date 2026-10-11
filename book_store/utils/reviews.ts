import type { Review, ReviewReply, User } from "@/types";

/**
 * `userId` / `adminId` come back either populated or as a bare id, depending on
 * the endpoint. These read whichever shape arrived without spreading `any`
 * casts through the templates.
 */
function populatedUser(value: unknown): User | null {
  return typeof value === "object" && value !== null ? (value as User) : null;
}

function idOf(value: unknown): string | null {
  if (typeof value === "string") return value;
  return populatedUser(value)?._id ?? null;
}

export function reviewUsername(review: Review): string {
  return populatedUser(review.userId)?.username || "Anonymous";
}

export function reviewAvatar(review: Review): string | null {
  return populatedUser(review.userId)?.avatar_url || null;
}

export function replyAdminName(reply: ReviewReply): string {
  return populatedUser(reply.adminId)?.username || "Admin";
}

/** Whether the signed-in user wrote this review. */
export function isOwnReview(review: Review, currentUser: User | null): boolean {
  return !!currentUser && idOf(review.userId) === currentUser._id;
}

/** Whether the signed-in admin wrote this reply. */
export function isOwnReply(
  reply: ReviewReply,
  currentUser: User | null
): boolean {
  return !!currentUser && idOf(reply.adminId) === currentUser._id;
}

export function formatReviewDate(dateString?: string): string {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ratingBreakdown(reviews: Review[]) {
  const counts = [0, 0, 0, 0, 0];
  for (const review of reviews) {
    if (review.rating >= 1 && review.rating <= 5) counts[5 - review.rating]++;
  }
  return counts.map((count, index) => ({
    stars: 5 - index,
    count,
    percentage: reviews.length > 0 ? (count / reviews.length) * 100 : 0,
  }));
}

export type RatingBreakdown = ReturnType<typeof ratingBreakdown>;

const AVATAR_TONES = [
  "bg-accent text-accent-foreground",
  "bg-primary/20 text-primary",
  "bg-success/15 text-success",
  "bg-warning/15 text-warning",
];

export function avatarTone(seed: string): string {
  let sum = 0;
  for (const char of seed) sum += char.charCodeAt(0);
  return AVATAR_TONES[sum % AVATAR_TONES.length];
}
