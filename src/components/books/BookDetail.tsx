import Image from "next/image";
import Link from "next/link";
import type { BookDetail as BookDetailType } from "@/lib/queries/books";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/layout/Container";
import { ReviewCard } from "./ReviewCard";

export function BookDetail({ book }: { book: BookDetailType }) {
  return (
    <Container className="py-12">
      {/* Header */}
      <div className="grid gap-10 md:grid-cols-[240px_1fr]">
        <div className="mx-auto w-48 md:mx-0 md:w-full">
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-surface-raised shadow-md">
            <Image
              src={book.coverImage}
              alt=""
              fill
              priority
              sizes="240px"
              className="object-cover"
            />
          </div>
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            {book.collections.map(({ collection }) => (
              <Link key={collection.id} href="/books">
                <Badge tone="outline">{collection.name}</Badge>
              </Link>
            ))}
          </div>
          <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-ink">
            {book.title}
          </h1>
          <p className="mt-2 text-lg text-muted">by {book.author}</p>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink">
            {book.description}
          </p>

          {book.keyLessons.length > 0 && (
            <div className="mt-8">
              <h2 className="font-serif text-xl font-semibold text-ink">
                Key lessons
              </h2>
              <ul className="mt-4 space-y-3">
                {book.keyLessons.map((lesson, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-ink">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent-soft/25 text-xs font-semibold text-accent-hover"
                    >
                      {i + 1}
                    </span>
                    {lesson}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {book.reviews.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-2xl font-semibold text-ink">
            What readers say
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {book.reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </section>
      )}

      {/* Related stories */}
      {book.relatedStories.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-2xl font-semibold text-ink">
            Related stories
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {book.relatedStories.map(({ story }) => (
              <Link
                key={story.id}
                href={`/stories/${story.slug}`}
                className="group flex gap-4 rounded-lg border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-accent-soft hover:shadow-md"
              >
                <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-md bg-surface-raised">
                  <Image src={story.coverImage} alt="" fill sizes="112px" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-accent">
                    {story.category.name}
                  </p>
                  <p className="mt-1 font-serif text-base font-semibold leading-snug text-ink">
                    {story.title}
                  </p>
                  <p className="mt-1 text-sm text-muted">{story.author.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
