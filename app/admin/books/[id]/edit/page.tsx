import Link from "next/link";
import { notFound } from "next/navigation";
import { aiEnabled } from "@/lib/env";
import { getBookById, getCollections } from "@/lib/queries/books";
import { updateBook } from "@/lib/actions/books";
import { BookForm } from "@/components/admin/BookForm";

export default async function EditBookPage({
  params,
}: PageProps<"/admin/books/[id]/edit">) {
  const { id } = await params;
  const [book, collections] = await Promise.all([
    getBookById(id),
    getCollections(),
  ]);

  if (!book) notFound();

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href="/admin/books" className="text-sm text-muted hover:text-accent">
          ← All books
        </Link>
        <h2 className="mt-2 font-serif text-2xl font-semibold text-ink">
          Edit book
        </h2>
      </div>
      <BookForm
        action={updateBook}
        collections={collections}
        initial={{
          id: book.id,
          title: book.title,
          author: book.author,
          description: book.description,
          coverImage: book.coverImage,
          keyLessons: book.keyLessons,
          collectionIds: book.collections.map((c) => c.collectionId),
        }}
        submitLabel="Save changes"
        aiEnabled={aiEnabled}
      />
    </div>
  );
}
