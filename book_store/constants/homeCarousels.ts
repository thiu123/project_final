import type { Component } from "vue";
import { BookOpen, BookOpenText, Heart } from "lucide-vue-next";

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
  icon: Component;
  /** Classes for the badge overlaid on each cover. */
  badgeClass: string;
  /** Label for that badge; defaults to `title`. */
  badgeLabel?: string;
}

export const HOME_CAROUSELS: HomeCarousel[] = [
  {
    subject: "literary fiction",
    title: "Literary Fiction",
    subtitle: "Discover compelling stories and thought-provoking narratives",
    icon: BookOpenText,
    badgeClass: "bg-customyellow text-customblack",
  },
  {
    subject: "manga",
    title: "Manga",
    subtitle: "Explore captivating visual stories and graphic novels",
    icon: BookOpen,
    badgeClass:
      "bg-gradient-to-br from-[#ffd700] to-[#ffed4e] text-[#2c3e50]",
  },
  {
    subject: "contemporary romance",
    title: "Romance",
    subtitle: "Fall in love with heartwarming stories and passionate tales",
    icon: Heart,
    badgeClass: "bg-gradient-to-br from-[#ff69b4] to-[#ff8da1] text-white",
    badgeLabel: "Romance",
  },
];
