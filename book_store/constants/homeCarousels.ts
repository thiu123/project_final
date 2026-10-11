/**
 * The home page's subject carousels.
 *
 * These used to be three separate components (`BookFiction`, `BookManga`,
 * `BookRomance`) that differed only in the values below — the ~290 lines of
 * markup around them were copy-pasted three times. Adding a fourth carousel is
 * now one entry here.
 */
export interface HomeCarousel {
  /** Key into `bookStore.homeSubjects`, and the `?subject=` value for "View All". */
  subject: string;
  title: string;
  subtitle: string;
}

export const HOME_CAROUSELS: HomeCarousel[] = [
  {
    subject: "literary fiction",
    title: "Literary Fiction",
    subtitle: "Novels that stay with you long after the last page.",
  },
  {
    subject: "manga",
    title: "Manga",
    subtitle: "Serialised worlds, from first volume to final arc.",
  },
  {
    subject: "contemporary romance",
    title: "Romance",
    subtitle: "Slow burns, second chances and happy endings.",
  },
];
