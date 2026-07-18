import type { NextRequest } from "next/server";
import { aiEnabled } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth/session";
import { getCollections } from "@/lib/queries/books";
import { generateJson } from "@/lib/ai/gemini";
import {
  extractTextFromFile,
  MAX_UPLOAD_BYTES,
} from "@/lib/documents/extract-text";

interface Extracted {
  title: string;
  author: string;
  description: string;
  keyLessons: string[];
  collectionSlugs: string[];
}

const SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    author: { type: "string" },
    description: { type: "string" },
    keyLessons: { type: "array", items: { type: "string" } },
    collectionSlugs: { type: "array", items: { type: "string" } },
  },
  required: ["title", "author", "description", "keyLessons", "collectionSlugs"],
};

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return Response.json({ error: "Not authorized." }, { status: 403 });
  }
  if (!aiEnabled) {
    return Response.json(
      { error: "AI is not configured (set GEMINI_API_KEY)." },
      { status: 503 },
    );
  }

  let file: File | null = null;
  try {
    const form = await req.formData();
    const f = form.get("file");
    if (f instanceof File) file = f;
  } catch {
    return Response.json({ error: "Invalid upload." }, { status: 400 });
  }

  if (!file) return Response.json({ error: "No file uploaded." }, { status: 400 });
  if (file.size > MAX_UPLOAD_BYTES) {
    return Response.json({ error: "File is too large (max 15 MB)." }, { status: 400 });
  }

  let text: string;
  try {
    text = await extractTextFromFile(file);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Could not read the file." },
      { status: 400 },
    );
  }

  if (text.trim().length < 20) {
    return Response.json(
      { error: "The document didn't contain enough readable text." },
      { status: 400 },
    );
  }

  const collections = await getCollections();
  const collectionList = collections
    .map((c) => `${c.slug} (${c.name}${c.emotionGoal ? ` — ${c.emotionGoal}` : ""})`)
    .join(", ");

  const system = `You help an editor add a book to a curated library. The document may be a book, a summary, a blurb, or notes.
Produce clean structured fields:
- "title": the book's title.
- "author": the author's name (best guess if implied; empty string if truly unknown).
- "description": a warm 2-4 sentence overview of what the book offers a reader.
- "keyLessons": 3-6 short, punchy takeaways (one sentence each).
- "collectionSlugs": choose the best-fitting collection slugs (0-3) from this list: ${collectionList}.
Return only valid JSON. Never invent slugs outside the list.`;

  try {
    const out = await generateJson<Extracted>({
      system,
      contents: [
        { role: "user", text: `Raw document text:\n\n${text.slice(0, 30000)}` },
      ],
      schema: SCHEMA,
    });

    const validSlugs = new Set(collections.map((c) => c.slug));
    return Response.json({
      title: out.title ?? "",
      author: out.author ?? "",
      description: out.description ?? "",
      keyLessons: Array.isArray(out.keyLessons) ? out.keyLessons.slice(0, 8) : [],
      collectionSlugs: Array.isArray(out.collectionSlugs)
        ? out.collectionSlugs.filter((s) => validSlugs.has(s))
        : [],
    });
  } catch (err) {
    console.error("extract-book error:", err);
    return Response.json(
      { error: "The AI couldn't process that document. Try another file." },
      { status: 502 },
    );
  }
}
