import Link from "next/link";
import { aiEnabled } from "@/lib/env";
import { getCollections } from "@/lib/queries/books";
import { createBook } from "@/lib/actions/books";
import { BookForm } from "@/components/admin/BookForm";

export default async function NewBookPage() {
  const collections = await getCollections();

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href="/admin/books" className="text-sm text-muted hover:text-accent">
          ← All books
        </Link>
        <h2 className="mt-2 font-serif text-2xl font-semibold text-ink">
          New book
        </h2>
      </div>
      <BookForm
        action={createBook}
        collections={collections}
        submitLabel="Add book"
        aiEnabled={aiEnabled}
      />
    </div>
  );
}
