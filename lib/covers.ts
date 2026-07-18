/** Built-in generated cover options (see scripts/gen-covers.mjs). */
export const COVER_OPTIONS: string[] = Array.from(
  { length: 16 },
  (_, i) => `/covers/c${String(i + 1).padStart(2, "0")}.svg`,
);
