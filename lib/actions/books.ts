"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { bookCollectionBooks, books } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { slugify } from "@/lib/utils";

export interface BookActionState {
  error?: string;
}

const coverSchema = z
  .string()
  .trim()
  .min(1, "Choose a cover or paste an image URL")
  .refine(
    (v) => v.startsWith("/") || /^https?:\/\/.+/.test(v),
    "Cover must be a built-in cover or a valid http(s) URL",
  );

const bookSchema = z.object({
  title: z.string().trim().min(2, "Title is too short").max(240),
  author: z.string().trim().min(2, "Author is required").max(200),
  description: z.string().trim().min(10, "Description is too short"),
  coverImage: coverSchema,
  keyLessons: z.string().optional(),
});

function parseForm(formData: FormData) {
  return bookSchema.safeParse({
    title: formData.get("title"),
    author: formData.get("author"),
    description: formData.get("description"),
    coverImage: formData.get("coverImage"),
    keyLessons: formData.get("keyLessons") ?? "",
  });
}

function parseLessons(raw: string | undefined): string[] {
  return (raw ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 20);
}

function selectedCollections(formData: FormData): string[] {
  return formData
    .getAll("collections")
    .filter((v): v is string => typeof v === "string");
}

async function uniqueBookSlug(base: string, excludeId?: string): Promise<string> {
  const root = base || "book";
  let candidate = root;
  let n = 1;
  while (n < 500) {
    const existing = await db.query.books.findFirst({
      where: eq(books.slug, candidate),
      columns: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    n += 1;
    candidate = `${root}-${n}`;
  }
  return `${root}-${Date.now()}`;
}

async function setCollections(bookId: string, collectionIds: string[]) {
  await db
    .delete(bookCollectionBooks)
    .where(eq(bookCollectionBooks.bookId, bookId));
  if (collectionIds.length) {
    await db.insert(bookCollectionBooks).values(
      collectionIds.map((collectionId, idx) => ({
        bookId,
        collectionId,
        sortOrder: idx,
      })),
    );
  }
}

function revalidate() {
  revalidatePath("/");
  revalidatePath("/books");
  revalidatePath("/admin/books");
}

export async function createBook(
  _prev: BookActionState,
  formData: FormData,
): Promise<BookActionState> {
  await requireAdmin();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid book details" };
  }
  const data = parsed.data;

  const slug = await uniqueBookSlug(slugify(data.title));
  const [created] = await db
    .insert(books)
    .values({
      slug,
      title: data.title,
      author: data.author,
      description: data.description,
      coverImage: data.coverImage,
      keyLessons: parseLessons(data.keyLessons),
    })
    .returning();

  await setCollections(created.id, selectedCollections(formData));

  revalidate();
  redirect("/admin/books");
}

export async function updateBook(
  _prev: BookActionState,
  formData: FormData,
): Promise<BookActionState> {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return { error: "Missing book id." };

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid book details" };
  }
  const data = parsed.data;

  const slug = await uniqueBookSlug(slugify(data.title), id);
  await db
    .update(books)
    .set({
      slug,
      title: data.title,
      author: data.author,
      description: data.description,
      coverImage: data.coverImage,
      keyLessons: parseLessons(data.keyLessons),
    })
    .where(eq(books.id, id));

  await setCollections(id, selectedCollections(formData));

  revalidate();
  revalidatePath(`/books/${slug}`);
  redirect("/admin/books");
}

export async function deleteBook(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id === "string" && id) {
    await db.delete(books).where(eq(books.id, id));
    revalidate();
  }
  redirect("/admin/books");
}
