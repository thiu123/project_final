import { BOOK_SUBJECTS } from '../../constants/book-subjects';

/**
 * Subject values are stored in MongoDB already lower-cased and stripped of
 * punctuation, e.g. the taxonomy entry "Biology & Life Sciences" is persisted
 * as "biology life sciences". These helpers bridge the three representations
 * we deal with: taxonomy label, URL slug, and the value stored in the database.
 */

/** Taxonomy label or URL slug -> the value stored in `Book.subjects`. */
export function normalizeSubject(value: string): string {
  return value
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Taxonomy label -> URL-safe slug, e.g. "Biology & Life Sciences" -> "biology-life-sciences". */
export function slugifySubject(value: string): string {
  return normalizeSubject(value).replace(/\s+/g, '-');
}

/** Human-readable label for a stored subject, e.g. "literary fiction" -> "Literary Fiction". */
export function humanizeSubject(value: string): string {
  return normalizeSubject(value).replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Expands a requested subject into every stored value that should match it.
 *
 * A top-level category also matches all of its subcategories, so asking for
 * "fiction" returns literary / historical / contemporary fiction too. A
 * subcategory or an unknown free-form value matches only itself.
 * Both the normalized and the original-cased form are returned so the filter
 * keeps working if a book is ever saved with title-cased subjects.
 */
export function expandSubject(input: string): string[] {
  const wanted = normalizeSubject(input);
  if (!wanted) return [];

  const matches = new Set<string>();

  for (const entry of BOOK_SUBJECTS) {
    const category = normalizeSubject(entry.category);
    const subcategories = (entry.subcategories ?? []).map(normalizeSubject);

    if (category === wanted) {
      matches.add(category);
      subcategories.forEach((sub) => matches.add(sub));
      break;
    }

    const subcategory = subcategories.find((sub) => sub === wanted);
    if (subcategory) {
      matches.add(subcategory);
      break;
    }
  }

  // Unknown subject: match it verbatim so free-form values still work.
  if (matches.size === 0) matches.add(wanted);

  // Tolerate title-cased data without needing a case-insensitive index scan.
  for (const value of [...matches]) {
    matches.add(humanizeSubject(value));
  }

  return [...matches];
}
