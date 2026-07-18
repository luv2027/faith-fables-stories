import type { Review } from "@/db/schema";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";

function Stars({ rating }: { rating: number }) {
  return (
    <span
      className="inline-flex gap-0.5 text-accent-soft"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className="h-4 w-4"
          fill={i < rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.4"
          aria-hidden="true"
        >
          <path d="m10 2 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L2.2 7.7l5.4-.8L10 2Z" />
        </svg>
      ))}
    </span>
  );
}

export function ReviewCard({ review }: { review: Review }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <Avatar name={review.reviewerName} size={32} />
        <div>
          <p className="text-sm font-medium text-ink">{review.reviewerName}</p>
          <Stars rating={review.rating} />
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">{review.body}</p>
    </Card>
  );
}
