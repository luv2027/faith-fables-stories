"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteConversation } from "@/lib/actions/conversations";
import type { ConversationListItem } from "@/lib/queries/conversations";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  conversations: ConversationListItem[];
  currentId: string | null;
}

export function ChatSidebar({ conversations, currentId }: ChatSidebarProps) {
  const router = useRouter();

  async function onDelete(id: string, title: string) {
    if (!confirm(`Delete “${title}”?`)) return;
    await deleteConversation(id);
    if (id === currentId) router.push("/ai-guide");
    else router.refresh();
  }

  return (
    <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-64 flex-shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="p-3">
        <Link
          href="/ai-guide"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
        >
          <span className="text-lg leading-none">+</span> New chat
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {conversations.length === 0 ? (
          <p className="px-3 py-4 text-xs text-muted">
            Your conversations will appear here.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {conversations.map((c) => {
              const active = c.id === currentId;
              return (
                <li key={c.id} className="group relative">
                  <Link
                    href={`/ai-guide?c=${c.id}`}
                    className={cn(
                      "block truncate rounded-lg py-2 pl-3 pr-8 text-sm transition-colors",
                      active
                        ? "bg-surface-raised text-ink"
                        : "text-muted hover:bg-surface-raised hover:text-ink",
                    )}
                    title={c.title}
                  >
                    {c.title}
                  </Link>
                  <button
                    type="button"
                    onClick={() => onDelete(c.id, c.title)}
                    aria-label={`Delete ${c.title}`}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                      <path
                        d="M6 7h12M9 7V5h6v2M10 11v6M14 11v6M7 7l1 12h8l1-12"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </nav>
    </aside>
  );
}
