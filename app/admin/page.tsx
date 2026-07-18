import Link from "next/link";
import { getAllStories } from "@/lib/queries/stories";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DeleteStoryButton } from "@/components/admin/DeleteStoryButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const stories = await getAllStories();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted">
          {stories.length} {stories.length === 1 ? "story" : "stories"}
        </p>
        <Button asChild>
          <Link href="/admin/stories/new">+ New story</Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-raised text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Category</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Author</th>
              <th className="px-4 py-3 font-medium">Featured</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {stories.map((story) => (
              <tr key={story.id} className="bg-surface">
                <td className="px-4 py-3">
                  <Link
                    href={`/stories/${story.slug}`}
                    className="font-medium text-ink hover:text-accent"
                  >
                    {story.title}
                  </Link>
                </td>
                <td className="hidden px-4 py-3 text-muted sm:table-cell">
                  {story.category.name}
                </td>
                <td className="hidden px-4 py-3 text-muted md:table-cell">
                  {story.author.name}
                </td>
                <td className="px-4 py-3">
                  {story.featured && <Badge>Featured</Badge>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/admin/stories/${story.id}/edit`}
                      className="text-sm font-medium text-accent hover:text-accent-hover"
                    >
                      Edit
                    </Link>
                    <DeleteStoryButton id={story.id} title={story.title} />
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
