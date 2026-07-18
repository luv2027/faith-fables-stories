import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BookCardData {
  slug: string;
  title: string;
  author: string;
  coverImage: string;
}

interface BookCardProps {
  book: BookCardData;
  className?: string;
}

export function BookCard({ book, className }: BookCardProps) {
  return (
    <Link
      href={`/books/${book.slug}`}
      className={cn("group block", className)}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-surface-raised shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
        <Image
          src={book.coverImage}
          alt=""
          fill
          sizes="(max-width: 768px) 45vw, 200px"
          className="object-cover"
        />
      </div>
      <h3 className="mt-3 font-serif text-base font-semibold leading-snug text-ink">
        {book.title}
      </h3>
      <p className="mt-0.5 text-sm text-muted">{book.author}</p>
    </Link>
  );
}
