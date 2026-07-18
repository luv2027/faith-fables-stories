import Link from "next/link";
import { getAllBooks } from "@/lib/queries/books";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DeleteBookButton } from "@/components/admin/DeleteBookButton";

export const dynamic = "force-dynamic";

export default async function AdminBooksPage() {
  const books = await getAllBooks();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted">
          {books.length} {books.length === 1 ? "book" : "books"}
        </p>
        <Button asChild>
          <Link href="/admin/books/new">+ New book</Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-raised text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Author</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Collections</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {books.map((book) => (
              <tr key={book.id} className="bg-surface">
                <td className="px-4 py-3">
                  <Link
                    href={`/books/${book.slug}`}
                    className="font-medium text-ink hover:text-accent"
                  >
                    {book.title}
                  </Link>
                </td>
                <td className="hidden px-4 py-3 text-muted sm:table-cell">
                  {book.author}
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {book.collections.map(({ collection }) => (
                      <Badge key={collection.id} tone="outline">
                        {collection.name}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/admin/books/${book.id}/edit`}
                      className="text-sm font-medium text-accent hover:text-accent-hover"
                    >
                      Edit
                    </Link>
                    <DeleteBookButton id={book.id} title={book.title} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
