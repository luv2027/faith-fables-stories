import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Community",
  description:
    "A thoughtful community for sharing stories, following creators, and reflecting together.",
};

const PILLARS = [
  {
    title: "Share your story",
    body: "Write from your own experience and inspire someone you'll never meet.",
  },
  {
    title: "Follow inspiring voices",
    body: "Build a small, meaningful circle of creators whose words move you.",
  },
  {
    title: "Reflect together",
    body: "Leave reflections, not hot takes. Depth over popularity, always.",
  },
];

export default function CommunityPage() {
  return (
    <Container className="py-20">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted">
          <span className="text-accent">✦</span> Coming soon
        </span>
        <h1 className="mt-6 font-serif text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          A community built for reflection, not noise
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          We&apos;re building a thoughtful space to share stories and grow
          together — designed to feel calm and human, never like another social
          feed.
        </p>
      </div>

      <div className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-3">
        {PILLARS.map((p) => (
          <div
            key={p.title}
            className="rounded-xl border border-border bg-surface p-6 text-center"
          >
            <h2 className="font-serif text-lg font-semibold text-ink">
              {p.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 text-center">
        <Button asChild variant="secondary">
          <Link href="/stories">Read stories in the meantime</Link>
        </Button>
      </div>
    </Container>
  );
}
