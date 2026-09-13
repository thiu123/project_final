import { BOOK_SUBJECTS } from '../../constants/book-subjects';

/**
 * Subjects live in three shapes: the taxonomy label ("Biology & Life Sciences"),
 * the URL slug ("biology-life-sciences") and the value stored in MongoDB
 * ("biology life sciences"). These helpers convert between them.
 */

export function normalizeSubject(value: string): string {
  return value
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function slugifySubject(value: string): string {
  return normalizeSubject(value).replace(/\s+/g, '-');
}

export function humanizeSubject(value: string): string {
  return normalizeSubject(value).replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Expands a requested subject into every stored value that should match it:
 * a top-level category also matches all of its subcategories, so "fiction"
 * returns literary / historical / contemporary fiction too.
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

    if (subcategories.includes(wanted)) {
      matches.add(wanted);
      break;
    }
  }

  // Unknown subject: match it verbatim so free-form values still work.
  if (matches.size === 0) matches.add(wanted);

  // Tolerate title-cased data without a case-insensitive index scan.
  for (const value of [...matches]) matches.add(humanizeSubject(value));

  return [...matches];
}
