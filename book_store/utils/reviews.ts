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
