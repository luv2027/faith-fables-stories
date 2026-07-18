import Image from "next/image";
import Link from "next/link";
import type { StoryListItem } from "@/lib/queries/stories";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

interface StoryCardProps {
  story: StoryListItem;
}

export function StoryCard({ story }: StoryCardProps) {
  return (
    <Card interactive className="group flex h-full flex-col overflow-hidden">
      <Link href={`/stories/${story.slug}`} className="flex h-full flex-col">
        <div className="relative aspect-[3/2] w-full overflow-hidden bg-surface-raised">
          <Image
            src={story.coverImage}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <Badge>{story.category.name}</Badge>
          <h3 className="font-serif text-xl font-semibold leading-snug tracking-tight text-ink">
            {story.title}
          </h3>
          <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted">
            {story.excerpt}
          </p>
          <div className="mt-2 flex items-center justify-between gap-3 border-t border-border pt-4">
            <span className="flex items-center gap-2">
              <Avatar name={story.author.name} src={story.author.avatarUrl} size={28} />
              <span className="text-xs font-medium text-ink">
                {story.author.name}
              </span>
            </span>
            <span className="text-xs text-muted">
              {story.readingTimeMin} min read
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
}
