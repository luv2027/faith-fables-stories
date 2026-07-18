import Link from "next/link";
import { getFeaturedStories } from "@/lib/queries/stories";
import { getCategories } from "@/lib/queries/categories";
import { getBookCollections } from "@/lib/queries/books";
import { Button } from "@/components/ui/Button";
import { CategoryPill } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/layout/Container";
import { StoryGrid } from "@/components/stories/StoryGrid";
import { BookCollectionRow } from "@/components/books/BookCollectionRow";

export default async function HomePage() {
  const [featured, categories, collections] = await Promise.all([
    getFeaturedStories(3),
    getCategories(),
    getBookCollections(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="gradient-warm relative overflow-hidden">
        <Container className="flex flex-col items-center py-24 text-center md:py-32">
          <span className="fade-rise mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-4 py-1.5 text-xs font-medium text-muted backdrop-blur">
            <span className="text-accent">✦</span> A quieter place to read & grow
          </span>
          <h1 className="fade-rise max-w-3xl font-serif text-5xl font-semibold leading-[1.05] tracking-tight text-ink md:text-7xl">
            Stories That Inspire the Heart
          </h1>
          <p
            className="fade-rise mt-6 max-w-xl text-lg leading-relaxed text-muted"
            style={{ ["--delay" as string]: "80ms" }}
          >
            Discover stories, books, and ideas that help you learn, grow, and
            become a better version of yourself.
          </p>
          <div
            className="fade-rise mt-9 flex flex-col gap-3 sm:flex-row"
            style={{ ["--delay" as string]: "160ms" }}
          >
            <Button asChild size="lg">
              <Link href="/stories">Explore Stories</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/community">Join Community</Link>
            </Button>
          </div>
        </Container>
      </section>

      {/* Featured stories */}
      <Container as="section" className="py-20">
        <SectionHeading
          eyebrow="Featured"
          title="Stories worth your quiet hour"
          subtitle="A few pieces our readers keep returning to."
          linkHref="/stories"
          linkLabel="All stories"
        />
        <div className="mt-10">
          <StoryGrid stories={featured} />
        </div>
      </Container>

      {/* Browse by category */}
      <section className="bg-surface py-20">
        <Container>
          <SectionHeading
            eyebrow="Explore"
            title="Browse by what you need"
            align="center"
          />
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {categories.map((c) => (
              <CategoryPill
                key={c.id}
                label={c.name}
                href={`/stories?category=${c.slug}`}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* Book collections teaser */}
      <Container as="section" className="py-20">
        <SectionHeading
          eyebrow="The Library"
          title="Books, organized by how you feel"
          subtitle="Not a bookstore — a curated shelf for wherever you are right now."
          linkHref="/books"
          linkLabel="All collections"
        />
        <div className="mt-12 space-y-14">
          {collections.slice(0, 2).map((collection) => (
            <BookCollectionRow key={collection.id} collection={collection} />
          ))}
        </div>
      </Container>

      {/* Community + AI teasers */}
      <Container as="section" className="grid gap-6 py-20 md:grid-cols-2">
        <div className="flex flex-col justify-between gap-6 rounded-xl border border-border bg-surface p-8">
          <div>
            <h3 className="font-serif text-2xl font-semibold text-ink">
              A community of reflection
            </h3>
            <p className="mt-3 text-base leading-relaxed text-muted">
              Share your own story, follow voices that move you, and think
              deeply together — without the noise of a feed.
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link href="/community">Join the Community</Link>
          </Button>
        </div>

        <div className="flex flex-col justify-between gap-6 rounded-xl border border-accent-soft/50 bg-gradient-to-br from-accent-soft/15 to-transparent p-8">
          <div>
            <h3 className="font-serif text-2xl font-semibold text-ink">
              Meet your Faith Fables AI Guide
            </h3>
            <p className="mt-3 text-base leading-relaxed text-muted">
              Tell it where you are — “I feel stuck in my career” — and it points
              you to the stories and books that might help you find clarity.
            </p>
          </div>
          <Button asChild>
            <Link href="/ai-guide">Try the AI Guide</Link>
          </Button>
        </div>
      </Container>
    </>
  );
}
