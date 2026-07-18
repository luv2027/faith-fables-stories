import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";

export async function getBooks() {
  return db.query.books.findMany({
    orderBy: (b) => asc(b.title),
  });
}

/**
 * All book collections (Finding Purpose, Building Discipline, …) with their
 * books, both ordered by their curated sort order.
 */
export async function getBookCollections() {
  return db.query.bookCollections.findMany({
    orderBy: (c) => asc(c.sortOrder),
    with: {
      books: {
        orderBy: (bcb) => asc(bcb.sortOrder),
        with: { book: true },
      },
    },
  });
}

export async function getBookBySlug(slug: string) {
  return db.query.books.findFirst({
    where: (b) => eq(b.slug, slug),
    with: {
      reviews: true,
      collections: { with: { collection: true } },
      relatedStories: {
        with: { story: { with: { author: true, category: true } } },
      },
    },
  });
}

/** Admin: all books with their collection memberships. */
export async function getAllBooks() {
  return db.query.books.findMany({
    orderBy: (b) => asc(b.title),
    with: { collections: { with: { collection: true } } },
  });
}

export async function getBookById(id: string) {
  return db.query.books.findFirst({
    where: (b) => eq(b.id, id),
    with: { collections: true },
  });
}

/** Bare list of collections (for form checkboxes). */
export async function getCollections() {
  return db.query.bookCollections.findMany({
    orderBy: (c) => asc(c.sortOrder),
  });
}

export type BookListItem = Awaited<ReturnType<typeof getBooks>>[number];
export type AdminBook = Awaited<ReturnType<typeof getAllBooks>>[number];
export type CollectionItem = Awaited<ReturnType<typeof getCollections>>[number];
export type BookCollectionWithBooks = Awaited<
  ReturnType<typeof getBookCollections>
>[number];
export type BookDetail = NonNullable<
  Awaited<ReturnType<typeof getBookBySlug>>
>;
