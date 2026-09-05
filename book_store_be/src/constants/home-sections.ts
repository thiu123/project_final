/**
 * Subjects the home page renders as dedicated carousels. Values are the
 * normalized form stored in `Book.subjects`. Keeping the list here means the
 * home endpoint fetches only what the page actually shows instead of loading
 * the whole catalogue and grouping it in memory.
 */
export const HOME_SECTION_SUBJECTS = [
  'literary fiction',
  'historical fiction',
  'contemporary romance',
  'manga',
  'cooking',
  'marketing',
  'kids education',
] as const;

/** Books returned per home carousel and in the "latest" strip. */
export const HOME_SECTION_SIZE = 10;
