import Link from "next/link";
import { aiEnabled } from "@/lib/env";
import { getCategories } from "@/lib/queries/categories";
import { getAuthors } from "@/lib/queries/authors";
import { createStory } from "@/lib/actions/stories";
import { StoryForm } from "@/components/admin/StoryForm";

export default async function NewStoryPage() {
  const [categories, authors] = await Promise.all([
    getCategories(),
    getAuthors(),
  ]);

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href="/admin" className="text-sm text-muted hover:text-accent">
          ← All stories
        </Link>
        <h2 className="mt-2 font-serif text-2xl font-semibold text-ink">
          New story
        </h2>
      </div>
      <StoryForm
        action={createStory}
        categories={categories}
        authors={authors}
        submitLabel="Publish story"
        aiEnabled={aiEnabled}
      />
    </div>
  );
}
