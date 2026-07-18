import type { Metadata } from "next";
import Link from "next/link";
import { aiEnabled } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getConversations,
  getConversationWithMessages,
} from "@/lib/queries/conversations";
import { getStories } from "@/lib/queries/stories";
import { getBooks } from "@/lib/queries/books";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { AiGuide, type ChatMessage } from "@/components/ai/AiGuide";
import { ChatSidebar } from "@/components/ai/ChatSidebar";

export const metadata: Metadata = {
  title: "AI Guide",
  description:
    "Chat with your personal guide to find the right story or book for wherever you are right now.",
};

const PROMPTS = [
  "I feel lost in my career.",
  "I keep starting things and never finishing.",
  "I want to build better habits.",
  "I'm going through a hard season.",
];

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AiGuidePage({
  searchParams,
}: PageProps<"/ai-guide">) {
  if (!aiEnabled) return <UnconfiguredView />;

  const user = await getCurrentUser();
  const requestedId = first((await searchParams).c);

  const conversations = user ? await getConversations(user.id) : [];

  let currentId: string | null = null;
  let initialMessages: ChatMessage[] = [];

  if (user && requestedId) {
    const conv = await getConversationWithMessages(requestedId, user.id);
    if (conv) {
      currentId = conv.id;
      // Resolve stored recommendation slugs into cards.
      const needsRecs = conv.messages.some(
        (m) => m.storySlugs.length || m.bookSlugs.length,
      );
      const [stories, books] = needsRecs
        ? await Promise.all([getStories(), getBooks()])
        : [[], []];

      initialMessages = conv.messages.map((m) => {
        const isAssistant = m.role === "assistant";
        const recStories =
          isAssistant && m.storySlugs.length
            ? stories.filter((s) => m.storySlugs.includes(s.slug))
            : undefined;
        const recBooks =
          isAssistant && m.bookSlugs.length
            ? books.filter((b) => m.bookSlugs.includes(b.slug))
            : undefined;
        return {
          id: m.id,
          role: m.role === "assistant" ? "assistant" : "user",
          text: m.content,
          stories: recStories,
          books: recBooks,
        };
      });
    }
  }

  return (
    <div className="flex min-h-[calc(100dvh-4rem)]">
      {user && <ChatSidebar conversations={conversations} currentId={currentId} />}
      <div className="min-w-0 flex-1">
        <AiGuide
          key={currentId ?? "new"}
          isAuthed={!!user}
          conversationId={currentId}
          initialMessages={initialMessages}
        />
      </div>
    </div>
  );
}

function UnconfiguredView() {
  return (
    <Container className="py-20">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted">
          <span className="text-accent">✦</span> Coming soon
        </span>
        <h1 className="mt-6 font-serif text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          Faith Fables AI Guide
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          Tell it where you are, and it points you to the stories and books that
          might help.
        </p>
      </div>
      <div className="mt-12 text-center">
        <p className="text-sm text-muted">
          The AI Guide turns on once a Gemini API key is configured.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {PROMPTS.map((p) => (
            <span
              key={p}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted"
            >
              {p}
            </span>
          ))}
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild>
            <Link href="/stories">Browse Stories</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/books">Browse Books</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
