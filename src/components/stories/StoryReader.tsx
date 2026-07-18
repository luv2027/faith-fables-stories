import Image from "next/image";
import Link from "next/link";
import type { StoryDetail } from "@/lib/queries/stories";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/layout/Container";
import { CommentList } from "./CommentList";
import { LikeButton } from "./LikeButton";

function renderBody(body: string) {
  return body.split(/\n\s*\n/).map((block, i) => {
    const text = block.trim();
    if (text.startsWith(">")) {
      return <blockquote key={i}>{text.replace(/^>\s?/, "")}</blockquote>;
    }
    return <p key={i}>{text}</p>;
  });
}

export function StoryReader({ story }: { story: StoryDetail }) {
  return (
    <article className="pb-8">
      {/* Header */}
      <Container size="narrow" className="pt-12 text-center">
        <Badge className="mb-5">{story.category.name}</Badge>
        <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight text-ink md:text-5xl">
          {story.title}
        </h1>
        <div className="mt-6 flex items-center justify-center gap-3 text-sm text-muted">
          <Avatar name={story.author.name} src={story.author.avatarUrl} size={36} />
          <span className="font-medium text-ink">{story.author.name}</span>
          <span aria-hidden="true">·</span>
          <span>{story.readingTimeMin} min read</span>
        </div>
      </Container>

      {/* Cover */}
      <Container size="narrow" className="mt-10">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-surface-raised">
          <Image
            src={story.coverImage}
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      </Container>

      {/* Body */}
      <Container size="narrow" className="mt-12">
        <div className="reading mx-auto text-ink">{renderBody(story.body)}</div>

        <div className="mx-auto mt-10 flex max-w-[66ch] items-center justify-between border-t border-border pt-6">
          <LikeButton initialCount={story.likesCount} size="md" />
          <span className="text-sm text-muted">Share this story with someone</span>
        </div>

        {/* Related books */}
        {story.relatedBooks.length > 0 && (
          <div className="mx-auto mt-14 max-w-[66ch]">
            <h2 className="font-serif text-2xl font-semibold text-ink">
              Books that pair with this story
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {story.relatedBooks.map(({ book }) => (
                <Link
                  key={book.id}
                  href={`/books/${book.slug}`}
                  className="group flex gap-4 rounded-lg border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-accent-soft hover:shadow-md"
                >
                  <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-md bg-surface-raised">
                    <Image src={book.coverImage} alt="" fill sizes="64px" className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-serif text-base font-semibold leading-snug text-ink">
                      {book.title}
                    </p>
                    <p className="mt-1 text-sm text-muted">{book.author}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mx-auto max-w-[66ch]">
          <CommentList count={story.commentsCount} />
        </div>
      </Container>
    </article>
  );
}
