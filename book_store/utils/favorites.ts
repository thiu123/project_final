import type { Book, Favorite } from "@/types";

/**
 * `bookId` arrives either as a raw id or as a populated book document,
 * depending on which endpoint produced the row — six copies of this check had
 * grown across the app, half of them typed `any`.
 */
export function favoriteBookId(favorite: Favorite): string | undefined {
  const bookId = favorite?.bookId;
  if (!bookId) return undefined;
  return typeof bookId === "string" ? bookId : bookId._id;
}

export function isFavoriteBook(
  favorites: readonly Favorite[] | undefined,
  bookId: string | undefined
): boolean {
  if (!bookId || !favorites) return false;
  return favorites.some((favorite) => favoriteBookId(favorite) === bookId);
}

/** A favorite whose `bookId` the API populated. */
export type PopulatedFavorite = Favorite & { bookId: Book };

/** Drops rows whose book has since been deleted, which come back as `null`. */
export function populatedFavorites(
  favorites: readonly Favorite[] | undefined
): PopulatedFavorite[] {
  return (favorites ?? []).filter(
    (favorite): favorite is PopulatedFavorite =>
      !!favorite &&
      typeof favorite.bookId === "object" &&
      favorite.bookId !== null &&
      !!favorite.bookId._id
  );
}
