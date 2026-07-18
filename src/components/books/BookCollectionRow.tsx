import type { BookCollectionWithBooks } from "@/lib/queries/books";
import { BookCard } from "./BookCard";

interface BookCollectionRowProps {
  collection: BookCollectionWithBooks;
}

export function BookCollectionRow({ collection }: BookCollectionRowProps) {
  return (
    <section className="space-y-5">
      <div className="max-w-2xl">
        {collection.emotionGoal && (
          <p className="mb-1 text-sm font-medium uppercase tracking-widest text-accent">
            {collection.emotionGoal}
          </p>
        )}
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          {collection.name}
        </h2>
        {collection.description && (
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {collection.description}
          </p>
        )}
      </div>

      <div className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-5 overflow-x-auto px-1 pb-2">
        {collection.books.map(({ book }) => (
          <div key={book.id} className="w-36 flex-shrink-0 snap-start sm:w-44">
            <BookCard book={book} />
          </div>
        ))}
      </div>
    </section>
  );
}
