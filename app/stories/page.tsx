import type { Metadata } from "next";
import { getStories } from "@/lib/queries/stories";
import { getCategories } from "@/lib/queries/categories";
import { Container } from "@/components/layout/Container";
import { SearchBar } from "@/components/ui/SearchBar";
import { StoryFilters } from "@/components/stories/StoryFilters";
import { StoryGrid } from "@/components/stories/StoryGrid";

export const metadata: Metadata = {
  title: "Stories",
  description:
    "Browse inspiring stories across personal growth, leadership, creativity, and more.",
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function StoriesPage({
  searchParams,
}: PageProps<"/stories">) {
  const params = await searchParams;
  const category = first(params.category);
  const q = first(params.q);

  const [stories, categories] = await Promise.all([
    getStories({ category, q }),
    getCategories(),
  ]);

  return (
    <Container className="py-12">
      <header className="max-w-2xl">
        <h1 className="font-serif text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          Stories
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted">
          Real journeys of growth, courage, and quiet transformation. Read one,
          and carry it with you.
        </p>
      </header>

      <div className="mt-8 flex flex-col gap-5">
        <SearchBar />
        <StoryFilters categories={categories} activeCategory={category} q={q} />
      </div>

      <div className="mt-10">
        <StoryGrid stories={stories} />
      </div>
    </Container>
  );
}
