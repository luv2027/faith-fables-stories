import type { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { aiConversations, aiMessages } from "@/db/schema";
import { aiEnabled } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth/session";
import { streamGeminiText, type GeminiTurn } from "@/lib/ai/gemini";
import { buildGuideSystem } from "@/lib/ai/guide-prompt";

interface Body {
  question?: unknown;
  history?: unknown;
  conversationId?: unknown;
}

function parseRecs(full: string): { storySlugs: string[]; bookSlugs: string[] } {
  const i = full.indexOf("@@RECS");
  if (i < 0) return { storySlugs: [], bookSlugs: [] };
  try {
    const parsed = JSON.parse(full.slice(i + "@@RECS".length).trim());
    return {
      storySlugs: Array.isArray(parsed.storySlugs) ? parsed.storySlugs : [],
      bookSlugs: Array.isArray(parsed.bookSlugs) ? parsed.bookSlugs : [],
    };
  } catch {
    return { storySlugs: [], bookSlugs: [] };
  }
}

export async function POST(req: NextRequest) {
  if (!aiEnabled) {
    return new Response("AI Guide is not configured.", { status: 503 });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid request body.", { status: 400 });
  }

  const question =
    typeof body.question === "string" ? body.question.trim() : "";
  if (question.length < 2) {
    return new Response("Please say a little more.", { status: 400 });
  }

  const history: GeminiTurn[] = Array.isArray(body.history)
    ? body.history
        .filter(
          (t): t is { role: string; text: string } =>
            !!t &&
            typeof t === "object" &&
            typeof (t as { text?: unknown }).text === "string",
        )
        .slice(-10)
        .map((t) => ({
          role: t.role === "assistant" ? "model" : "user",
          text: t.text,
        }))
    : [];

  // Persistence is per-account; guests chat ephemerally.
  const user = await getCurrentUser();
  let conversationId: string | null =
    typeof body.conversationId === "string" ? body.conversationId : null;

  if (user) {
    if (conversationId) {
      const owned = await db.query.aiConversations.findFirst({
        where: and(
          eq(aiConversations.id, conversationId),
          eq(aiConversations.userId, user.id),
        ),
        columns: { id: true },
      });
      if (!owned) conversationId = null; // not theirs — start fresh
    }
    if (!conversationId) {
      const [created] = await db
        .insert(aiConversations)
        .values({ userId: user.id, title: question.slice(0, 80) })
        .returning({ id: aiConversations.id });
      conversationId = created.id;
    }
  } else {
    conversationId = null;
  }

  const system = await buildGuideSystem();
  const contents: GeminiTurn[] = [...history, { role: "user", text: question }];

  const encoder = new TextEncoder();
  const persistId = conversationId;
  const userId = user?.id ?? null;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let full = "";
      try {
        for await (const delta of streamGeminiText({ system, contents })) {
          full += delta;
          controller.enqueue(encoder.encode(delta));
        }

        // Persist the turn before closing the stream (reliable in prod too).
        if (userId && persistId) {
          try {
            const markerIdx = full.indexOf("@@RECS");
            const messageText = (
              markerIdx >= 0 ? full.slice(0, markerIdx) : full
            ).trim();
            const { storySlugs, bookSlugs } = parseRecs(full);
            await db.insert(aiMessages).values([
              { conversationId: persistId, role: "user", content: question },
              {
                conversationId: persistId,
                role: "assistant",
                content: messageText,
                storySlugs,
                bookSlugs,
              },
            ]);
            await db
              .update(aiConversations)
              .set({ updatedAt: new Date() })
              .where(eq(aiConversations.id, persistId));
          } catch (err) {
            console.error("AI Guide persist error:", err);
          }
        }
      } catch (err) {
        console.error("AI Guide stream error:", err);
        controller.enqueue(
          encoder.encode(
            "\n\n(Sorry — I couldn't finish that thought. Please try again.)",
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  const headers: Record<string, string> = {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
  };
  if (conversationId) headers["X-Conversation-Id"] = conversationId;

  return new Response(stream, { headers });
}
