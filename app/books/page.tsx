import type { Metadata } from "next";
import { getBookCollections } from "@/lib/queries/books";
import { Container } from "@/components/layout/Container";
import { BookCollectionRow } from "@/components/books/BookCollectionRow";

export const metadata: Metadata = {
  title: "Books",
  description:
    "A curated library organized by how you feel and what you're reaching for.",
};

export default async function BooksPage() {
  const collections = await getBookCollections();

  return (
    <Container className="py-12">
      <header className="max-w-2xl">
        <h1 className="font-serif text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          The Library
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted">
          Not a bookstore. A curated shelf organized by what you need — purpose,
          discipline, creativity, and the courage to grow.
        </p>
      </header>

      <div className="mt-14 space-y-16">
        {collections.map((collection) => (
          <BookCollectionRow key={collection.id} collection={collection} />
        ))}
      </div>
    </Container>
  );
}
