import type { StoryListItem } from "@/lib/queries/stories";
import { StoryCard } from "./StoryCard";

interface StoryGridProps {
  stories: StoryListItem[];
  emptyMessage?: string;
}

export function StoryGrid({
  stories,
  emptyMessage = "No stories found. Try a different category or search.",
}: StoryGridProps) {
  if (stories.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-surface px-6 py-16 text-center text-muted">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {stories.map((story, i) => (
        <div
          key={story.id}
          className="fade-rise"
          style={{ ["--delay" as string]: `${Math.min(i, 6) * 60}ms` }}
        >
          <StoryCard story={story} />
        </div>
      ))}
    </div>
  );
}
