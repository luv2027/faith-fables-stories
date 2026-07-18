export type ClassValue = string | number | null | false | undefined;

/** Minimal className joiner (no external deps). */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}

/** URL-safe slug from arbitrary text. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 190);
}
