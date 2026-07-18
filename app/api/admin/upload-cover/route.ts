import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { put } from "@vercel/blob";
import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

// Raster only — SVG is excluded (script-injection risk).
const ALLOWED: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return Response.json({ error: "Not authorized." }, { status: 403 });
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
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "Image is too large (max 5 MB)." }, { status: 400 });
  }
  const ext = ALLOWED[file.type];
  if (!ext) {
    return Response.json(
      { error: "Use a PNG, JPG, WEBP, or GIF image." },
      { status: 400 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const name = `${randomUUID()}.${ext}`;

  try {
    // Preferred: object storage (works on serverless like Vercel).
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`covers/${name}`, bytes, {
        access: "public",
        contentType: file.type,
      });
      return Response.json({ url: blob.url });
    }

    // Fallback: local filesystem (dev / persistent self-hosted server).
    const dir = join(process.cwd(), "public", "uploads", "covers");
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, name), bytes);
    return Response.json({ url: `/uploads/covers/${name}` });
  } catch (err) {
    console.error("upload-cover error:", err);
    return Response.json(
      { error: "Could not save the image. Please try again." },
      { status: 500 },
    );
  }
}
