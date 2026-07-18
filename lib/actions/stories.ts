"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { authors, stories } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { slugify } from "@/lib/utils";

export interface StoryActionState {
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

const storySchema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(240),
  excerpt: z.string().trim().min(10, "Excerpt is too short").max(400),
  body: z.string().trim().min(20, "Story body is too short"),
  categoryId: z.uuid("Pick a category"),
  authorId: z.string().trim().optional(),
  newAuthorName: z.string().trim().max(160).optional(),
  coverImage: coverSchema,
  readingTimeMin: z.coerce.number().int().min(1).max(120),
  featured: z.boolean(),
});

function parseForm(formData: FormData) {
  return storySchema.safeParse({
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    body: formData.get("body"),
    categoryId: formData.get("categoryId"),
    authorId: formData.get("authorId") ?? undefined,
    newAuthorName: formData.get("newAuthorName") ?? undefined,
    coverImage: formData.get("coverImage"),
    readingTimeMin: formData.get("readingTimeMin"),
    featured: formData.get("featured") === "on",
  });
}

async function uniqueStorySlug(base: string, excludeId?: string): Promise<string> {
  const root = base || "story";
  let candidate = root;
  let n = 1;
  while (n < 500) {
    const existing = await db.query.stories.findFirst({
      where: eq(stories.slug, candidate),
      columns: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    n += 1;
    candidate = `${root}-${n}`;
  }
  return `${root}-${Date.now()}`;
}

async function uniqueAuthorSlug(base: string): Promise<string> {
  const root = base || "author";
  let candidate = root;
  let n = 1;
  while (n < 500) {
    const existing = await db.query.authors.findFirst({
      where: eq(authors.slug, candidate),
      columns: { id: true },
    });
    if (!existing) return candidate;
    n += 1;
    candidate = `${root}-${n}`;
  }
  return `${root}-${Date.now()}`;
}

async function resolveAuthorId(
  authorId: string | undefined,
  newAuthorName: string | undefined,
): Promise<string | null> {
  if (authorId && authorId !== "__new") return authorId;
  const name = newAuthorName?.trim();
  if (!name) return null;
  const slug = await uniqueAuthorSlug(slugify(name));
  const [created] = await db.insert(authors).values({ name, slug }).returning();
  return created.id;
}

export async function createStory(
  _prev: StoryActionState,
  formData: FormData,
): Promise<StoryActionState> {
  await requireAdmin();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid story details" };
  }
  const data = parsed.data;

  const authorId = await resolveAuthorId(data.authorId, data.newAuthorName);
  if (!authorId) {
    return { error: "Select an author or enter a new author name." };
  }

  const slug = await uniqueStorySlug(slugify(data.title));
  await db.insert(stories).values({
    slug,
    title: data.title,
    excerpt: data.excerpt,
    body: data.body,
    coverImage: data.coverImage,
    authorId,
    categoryId: data.categoryId,
    readingTimeMin: data.readingTimeMin,
    featured: data.featured,
  });

  revalidatePath("/");
  revalidatePath("/stories");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateStory(
  _prev: StoryActionState,
  formData: FormData,
): Promise<StoryActionState> {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return { error: "Missing story id." };

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid story details" };
  }
  const data = parsed.data;

  const authorId = await resolveAuthorId(data.authorId, data.newAuthorName);
  if (!authorId) {
    return { error: "Select an author or enter a new author name." };
  }

  const slug = await uniqueStorySlug(slugify(data.title), id);
  await db
    .update(stories)
    .set({
      slug,
      title: data.title,
      excerpt: data.excerpt,
      body: data.body,
      coverImage: data.coverImage,
      authorId,
      categoryId: data.categoryId,
      readingTimeMin: data.readingTimeMin,
      featured: data.featured,
    })
    .where(eq(stories.id, id));

  revalidatePath("/");
  revalidatePath("/stories");
  revalidatePath(`/stories/${slug}`);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteStory(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id === "string" && id) {
    await db.delete(stories).where(eq(stories.id, id));
    revalidatePath("/");
    revalidatePath("/stories");
    revalidatePath("/admin");
  }
  redirect("/admin");
}
