interface CommentListProps {
  count: number;
}

/**
 * Read-only reflections placeholder for Phase 1. Community reading/writing of
 * reflections arrives with auth in Phase 3.
 */
export function CommentList({ count }: CommentListProps) {
  return (
    <section
      aria-label="Reflections"
      className="mt-14 rounded-xl border border-border bg-surface-raised/50 p-6 text-center"
    >
      <h2 className="font-serif text-xl font-semibold text-ink">
        {count} reflection{count === 1 ? "" : "s"}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
        Thoughtful reflections from readers will live here. Sharing and reading
        reflections opens up when community accounts arrive.
      </p>
      <span className="mt-4 inline-flex items-center rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted">
        Coming soon
      </span>
    </section>
  );
}
