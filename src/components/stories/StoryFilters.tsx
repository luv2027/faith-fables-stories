import type { CategoryItem } from "@/lib/queries/categories";
import { CategoryPill } from "@/components/ui/Badge";

interface StoryFiltersProps {
  categories: CategoryItem[];
  activeCategory?: string;
  q?: string;
}

function href(category: string | undefined, q: string | undefined): string {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (q) params.set("q", q);
  const qs = params.toString();
  return qs ? `/stories?${qs}` : "/stories";
}

/**
 * Category filter row. Server component — active state comes from the URL via
 * props, and each pill preserves the current search query.
 */
export function StoryFilters({ categories, activeCategory, q }: StoryFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
      <CategoryPill label="All" href={href(undefined, q)} active={!activeCategory} />
      {categories.map((c) => (
        <CategoryPill
          key={c.id}
          label={c.name}
          href={href(c.slug, q)}
          active={activeCategory === c.slug}
        />
      ))}
    </div>
  );
}
