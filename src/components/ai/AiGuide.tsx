"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { resolveRecs, type ChatTurn } from "@/lib/actions/ai-guide";
import type { StoryListItem } from "@/lib/queries/stories";
import type { BookListItem } from "@/lib/queries/books";
import { StoryCard } from "@/components/stories/StoryCard";
import { BookCard } from "@/components/books/BookCard";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  streaming?: boolean;
  isError?: boolean;
  stories?: StoryListItem[];
  books?: BookListItem[];
}

interface AiGuideProps {
  isAuthed: boolean;
  conversationId: string | null;
  initialMessages: ChatMessage[];
}

const PROMPTS = [
  "I feel lost in my career.",
  "I keep starting things and never finishing.",
  "I want to build better habits.",
  "I'm going through a hard season.",
];

function uid() {
  return crypto.randomUUID();
}

export function AiGuide({
  isAuthed,
  conversationId: initialConversationId,
  initialMessages,
}: AiGuideProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId,
  );
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || pending) return;

    const history: ChatTurn[] = messages
      .filter((m) => !m.isError)
      .map((m) => ({ role: m.role, text: m.text }));

    const assistantId = uid();
    setMessages((prev) => [
      ...prev,
      { id: uid(), role: "user", text: q },
      { id: assistantId, role: "assistant", text: "", streaming: true },
    ]);
    setInput("");
    setPending(true);

    try {
      const res = await fetch("/api/ai-guide/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history, question: q, conversationId }),
      });
      if (!res.ok || !res.body) throw new Error(`stream ${res.status}`);

      // A brand-new conversation returns its id in a header.
      const returnedId = res.headers.get("X-Conversation-Id");
      const isNewConversation = !!returnedId && returnedId !== conversationId;
      if (returnedId) setConversationId(returnedId);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      // Stream the visible text (everything before the @@RECS marker).
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        const visible = full.split("@@RECS")[0];
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, text: visible } : m)),
        );
      }

      // Finalize: parse recommendations, if any.
      const markerIdx = full.indexOf("@@RECS");
      const messageText = (markerIdx >= 0 ? full.slice(0, markerIdx) : full).trim();
      let stories: StoryListItem[] | undefined;
      let books: BookListItem[] | undefined;

      if (markerIdx >= 0) {
        try {
          const parsed = JSON.parse(full.slice(markerIdx + "@@RECS".length).trim());
          const recs = await resolveRecs(
            parsed.storySlugs ?? [],
            parsed.bookSlugs ?? [],
          );
          stories = recs.stories.length ? recs.stories : undefined;
          books = recs.books.length ? recs.books : undefined;
        } catch {
          // ignore malformed recommendation payload
        }
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, text: messageText, streaming: false, stories, books }
            : m,
        ),
      );

      if (isNewConversation && returnedId) {
        // Give the new conversation its own URL so "New chat" (→ /ai-guide)
        // is always a different route and resets cleanly.
        router.replace(`/ai-guide?c=${returnedId}`);
      } else if (isAuthed) {
        // Existing conversation: refresh sidebar ordering.
        router.refresh();
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                text: "The guide couldn't respond just now. Please try again in a moment.",
                streaming: false,
                isError: true,
              }
            : m,
        ),
      );
    } finally {
      setPending(false);
    }
  }

  const empty = messages.length === 0;

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-3xl flex-col px-4">
      <div className="flex-1 py-10">
        {empty ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span aria-hidden="true" className="text-3xl text-accent">
              ✦
            </span>
            <h1 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-ink md:text-4xl">
              Where are you right now?
            </h1>
            <p className="mt-3 max-w-md text-muted">
              Tell me what you&apos;re going through. I&apos;m here to talk — and
              I&apos;ll point you to a story or book only when it feels right.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => send(p)}
                  className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-accent px-4 py-2.5 text-white">
                    {m.text}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="space-y-5">
                  {m.streaming && m.text === "" ? (
                    <div className="flex w-fit items-center gap-1.5 rounded-2xl rounded-bl-sm bg-surface-raised px-4 py-4">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted" />
                    </div>
                  ) : (
                    <div
                      className={
                        m.isError
                          ? "w-fit max-w-[90%] rounded-2xl rounded-bl-sm bg-accent/10 px-4 py-3 text-accent-hover"
                          : "w-fit max-w-[90%] whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-surface-raised px-4 py-3 text-lg leading-relaxed text-ink"
                      }
                    >
                      {m.text}
                      {m.streaming && (
                        <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-accent align-middle" />
                      )}
                    </div>
                  )}

                  {m.stories && m.stories.length > 0 && (
                    <div>
                      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted">
                        Stories for you
                      </p>
                      <div className="grid gap-5 sm:grid-cols-2">
                        {m.stories.map((s) => (
                          <StoryCard key={s.id} story={s} />
                        ))}
                      </div>
                    </div>
                  )}

                  {m.books && m.books.length > 0 && (
                    <div>
                      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted">
                        Books for you
                      </p>
                      <div className="grid grid-cols-3 gap-5">
                        {m.books.map((b) => (
                          <BookCard key={b.id} book={b} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ),
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="sticky bottom-0 -mx-4 border-t border-border bg-bg/85 px-4 py-4 backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="mx-auto flex max-w-3xl items-end gap-2 rounded-3xl border border-border bg-surface p-2 pl-4 shadow-sm focus-within:border-accent"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder="Ask anything…"
            aria-label="Message the AI Guide"
            className="max-h-40 flex-1 resize-none bg-transparent py-2 text-base text-ink placeholder:text-muted focus:outline-none"
          />
          <button
            type="submit"
            disabled={pending || !input.trim()}
            aria-label="Send"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-accent-hover disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <path
                d="M12 19V5M12 5l-6 6M12 5l6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>
        <p className="mt-2 text-center text-xs text-muted">
          The Guide recommends only from Faith Fables&apos; own stories &amp; books.
        </p>
      </div>
    </div>
  );
}
