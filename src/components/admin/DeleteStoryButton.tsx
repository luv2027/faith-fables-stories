"use client";

import { deleteStory } from "@/lib/actions/stories";

export function DeleteStoryButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  return (
    <form
      action={deleteStory}
      onSubmit={(e) => {
        if (!confirm(`Delete “${title}”? This cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-sm font-medium text-muted transition-colors hover:text-accent"
      >
        Delete
      </button>
    </form>
  );
}
