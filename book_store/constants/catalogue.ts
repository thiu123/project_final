import type { BookSort } from "@/types";

/** Slug that means "every category" — the catalogue page's unfiltered view. */
export const ALL_SUBJECTS_SLUG = "all";

export const SORT_OPTIONS: { label: string; value: BookSort }[] = [
  { label: "Newest", value: "newest" },
  { label: "From A to Z", value: "title_asc" },
  { label: "From Z to A", value: "title_desc" },
  { label: "Price: low to high", value: "price_asc" },
  { label: "Price: high to low", value: "price_desc" },
  { label: "Top rated", value: "rating" },
  { label: "Best selling", value: "bestselling" },
];

/** Each range maps straight onto the API's minPrice / maxPrice filters. */
export const PRICE_RANGES: {
  label: string;
  minPrice?: number;
  maxPrice?: number;
}[] = [
  { label: "Under $10", maxPrice: 10 },
  { label: "$10 - $20", minPrice: 10, maxPrice: 20 },
  { label: "$20 - $30", minPrice: 20, maxPrice: 30 },
  { label: "Above $50", minPrice: 50 },
];

export const CATALOGUE_PAGE_SIZE = 12;
