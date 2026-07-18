import Link from "next/link";
import { notFound } from "next/navigation";
import { aiEnabled } from "@/lib/env";
import { getCategories } from "@/lib/queries/categories";
import { getAuthors } from "@/lib/queries/authors";
import { getStoryById } from "@/lib/queries/stories";
import { updateStory } from "@/lib/actions/stories";
import { StoryForm } from "@/components/admin/StoryForm";

export default async function EditStoryPage({
  params,
}: PageProps<"/admin/stories/[id]/edit">) {
  const { id } = await params;
  const [story, categories, authors] = await Promise.all([
    getStoryById(id),
    getCategories(),
    getAuthors(),
  ]);

  if (!story) notFound();

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href="/admin" className="text-sm text-muted hover:text-accent">
          ← All stories
        </Link>
        <h2 className="mt-2 font-serif text-2xl font-semibold text-ink">
          Edit story
        </h2>
      </div>
      <StoryForm
        action={updateStory}
        categories={categories}
        authors={authors}
        initial={{
          id: story.id,
          title: story.title,
          excerpt: story.excerpt,
          body: story.body,
          categoryId: story.categoryId,
          authorId: story.authorId,
          coverImage: story.coverImage,
          readingTimeMin: story.readingTimeMin,
          featured: story.featured,
        }}
        submitLabel="Save changes"
        aiEnabled={aiEnabled}
      />
    </div>
  );
}
