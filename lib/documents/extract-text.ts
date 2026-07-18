import "server-only";
import mammoth from "mammoth";
import { extractText as extractPdfText, getDocumentProxy } from "unpdf";

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB

const PDF = "application/pdf";
const DOCX =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/**
 * Extract plain text from an uploaded document (PDF, DOCX, TXT, or Markdown).
 * Returns the raw text, normalized to reasonable whitespace.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const type = file.type;
  const buffer = Buffer.from(await file.arrayBuffer());

  let text = "";

  if (type === PDF || name.endsWith(".pdf")) {
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const result = await extractPdfText(pdf, { mergePages: true });
    text = Array.isArray(result.text) ? result.text.join("\n\n") : result.text;
  } else if (type === DOCX || name.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else if (
    type.startsWith("text/") ||
    name.endsWith(".txt") ||
    name.endsWith(".md")
  ) {
    text = buffer.toString("utf-8");
  } else {
    throw new Error("Unsupported file type. Upload a PDF, DOCX, TXT, or MD.");
  }

  // Normalize: collapse 3+ blank lines, trim trailing spaces.
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Word-count based reading time (~200 wpm), min 1. */
export function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
