import type { NextRequest } from "next/server";
import { aiEnabled } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth/session";
import { getCategories } from "@/lib/queries/categories";
import { generateJson } from "@/lib/ai/gemini";
import {
  extractTextFromFile,
  estimateReadingTime,
  MAX_UPLOAD_BYTES,
} from "@/lib/documents/extract-text";

interface Extracted {
  title: string;
  excerpt: string;
  body: string;
  categorySlug: string;
}

const SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    excerpt: { type: "string" },
    body: { type: "string" },
    categorySlug: { type: "string" },
  },
  required: ["title", "excerpt", "body", "categorySlug"],
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

  if (text.trim().length < 30) {
    return Response.json(
      { error: "The document didn't contain enough readable text." },
      { status: 400 },
    );
  }

  const categories = await getCategories();
  const categoryList = categories.map((c) => `${c.slug} (${c.name})`).join(", ");

  const system = `You help an editor import an inspiring story from a document.
From the provided raw text, produce clean structured fields:
- "title": a short, evocative title (use the document's own title if present).
- "excerpt": a warm 1-2 sentence hook for story cards.
- "body": the full story text, cleaned into readable paragraphs separated by blank lines. Preserve the author's words and meaning — fix obvious extraction artifacts (broken line-breaks, page numbers, headers/footers) but do NOT rewrite or summarize. You may mark an especially resonant single line as a pull-quote by prefixing it with "> ".
- "categorySlug": choose the single best-fitting category slug from this list: ${categoryList}.
Return only valid JSON.`;

  try {
    const out = await generateJson<Extracted>({
      system,
      contents: [
        { role: "user", text: `Raw document text:\n\n${text.slice(0, 30000)}` },
      ],
      schema: SCHEMA,
    });

    const validCategory = categories.find((c) => c.slug === out.categorySlug);
    return Response.json({
      title: out.title ?? "",
      excerpt: out.excerpt ?? "",
      body: out.body ?? "",
      categorySlug: validCategory ? out.categorySlug : "",
      readingTimeMin: estimateReadingTime(out.body || text),
    });
  } catch (err) {
    console.error("extract-story error:", err);
    return Response.json(
      { error: "The AI couldn't process that document. Try another file." },
      { status: 502 },
    );
  }
}
