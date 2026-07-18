"use server";

import { getStories, type StoryListItem } from "@/lib/queries/stories";
import { getBooks, type BookListItem } from "@/lib/queries/books";

export interface ChatTurn {
  role: "user" | "assistant";
  text: string;
}

export interface RecResult {
  stories: StoryListItem[];
  books: BookListItem[];
}

/**
 * Resolve recommendation slugs (parsed from the streamed @@RECS line) into full
 * story/book objects, validated against the catalog so nothing invented renders.
 */
export async function resolveRecs(
  storySlugs: string[],
  bookSlugs: string[],
): Promise<RecResult> {
  const wantStories = Array.isArray(storySlugs) ? storySlugs : [];
  const wantBooks = Array.isArray(bookSlugs) ? bookSlugs : [];
  if (wantStories.length === 0 && wantBooks.length === 0) {
    return { stories: [], books: [] };
  }

  const [stories, books] = await Promise.all([getStories(), getBooks()]);
  return {
    stories: stories.filter((s) => wantStories.includes(s.slug)).slice(0, 3),
    books: books.filter((b) => wantBooks.includes(b.slug)).slice(0, 3),
  };
}
