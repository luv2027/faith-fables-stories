import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBookBySlug } from "@/lib/queries/books";
import { BookDetail } from "@/components/books/BookDetail";

export async function generateMetadata({
  params,
}: PageProps<"/books/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book) return { title: "Book not found" };
  return {
    title: `${book.title} by ${book.author}`,
    description: book.description,
  };
}

export default async function BookPage({ params }: PageProps<"/books/[slug]">) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);

  if (!book) notFound();

  return <BookDetail book={book} />;
}
