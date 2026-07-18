import "server-only";
import { env } from "@/lib/env";

const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export interface GeminiTurn {
  role: "user" | "model";
  text: string;
}

interface GenerateJsonArgs {
  system: string;
  // Full conversation so far, oldest first, ending with the latest user turn.
  contents: GeminiTurn[];
  // A Gemini responseSchema (OpenAPI-subset) describing the JSON to return.
  schema: Record<string, unknown>;
}

/**
 * Call Gemini's generateContent with JSON mode and return the parsed object.
 * Throws on transport/HTTP/parse errors — callers should catch and degrade.
 */
export async function generateJson<T>({
  system,
  contents,
  schema,
}: GenerateJsonArgs): Promise<T> {
  const res = await fetch(`${BASE}/${env.GEMINI_MODEL}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": env.GEMINI_API_KEY,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: contents.map((t) => ({
        role: t.role,
        parts: [{ text: t.text }],
      })),
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7,
      },
    }),
    // never cache AI responses
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const text: string | undefined =
    data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no content");

  return JSON.parse(text) as T;
}

/**
 * Stream plain-text deltas from Gemini's streamGenerateContent (SSE).
 * Yields text chunks as they arrive.
 */
export async function* streamGeminiText({
  system,
  contents,
}: {
  system: string;
  contents: GeminiTurn[];
}): AsyncGenerator<string> {
  const res = await fetch(
    `${BASE}/${env.GEMINI_MODEL}:streamGenerateContent?alt=sse`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: contents.map((t) => ({
          role: t.role,
          parts: [{ text: t.text }],
        })),
        generationConfig: { temperature: 0.7 },
      }),
      cache: "no-store",
    },
  );

  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini ${res.status}: ${body.slice(0, 200)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const json = JSON.parse(payload);
        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) yield text as string;
      } catch {
        // partial/non-JSON keep-alive line — ignore
      }
    }
  }
}
