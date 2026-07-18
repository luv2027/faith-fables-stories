import "server-only";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";

export interface StoryFilter {
  category?: string; // category slug
  q?: string; // free-text search
}

/**
 * List stories, optionally filtered by category slug and/or a free-text query
 * (matched against title + excerpt). Newest first.
 */
export async function getStories(filter: StoryFilter = {}) {
  const { category, q } = filter;

  let categoryId: string | undefined;
  if (category) {
    const cat = await db.query.categories.findFirst({
      where: eq(categories.slug, category),
    });
    if (!cat) return [];
    categoryId = cat.id;
  }

  const trimmed = q?.trim();

  return db.query.stories.findMany({
    where: (s) => {
      const conds = [];
      if (categoryId) conds.push(eq(s.categoryId, categoryId));
      if (trimmed) {
        const pattern = `%${trimmed}%`;
        conds.push(or(ilike(s.title, pattern), ilike(s.excerpt, pattern)));
      }
      return conds.length ? and(...conds) : undefined;
    },
    with: { author: true, category: true },
    orderBy: (s) => desc(s.publishedAt),
  });
}

export async function searchStories(q: string) {
  return getStories({ q });
}

export async function getStoriesByCategory(category: string) {
  return getStories({ category });
}

export async function getFeaturedStories(limit = 3) {
  return db.query.stories.findMany({
    where: (s) => eq(s.featured, true),
    with: { author: true, category: true },
    orderBy: (s) => desc(s.publishedAt),
    limit,
  });
}

export async function getStoryBySlug(slug: string) {
  return db.query.stories.findFirst({
    where: (s) => eq(s.slug, slug),
    with: {
      author: true,
      category: true,
      relatedBooks: { with: { book: true } },
    },
  });
}

/** Admin: every story (newest created first) with author + category. */
export async function getAllStories() {
  return db.query.stories.findMany({
    with: { author: true, category: true },
    orderBy: (s) => desc(s.createdAt),
  });
}

export async function getStoryById(id: string) {
  return db.query.stories.findFirst({
    where: (s) => eq(s.id, id),
    with: { author: true, category: true },
  });
}

export type StoryListItem = Awaited<ReturnType<typeof getStories>>[number];
export type StoryDetail = NonNullable<
  Awaited<ReturnType<typeof getStoryBySlug>>
>;
