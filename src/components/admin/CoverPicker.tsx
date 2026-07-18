"use client";

import { useRef, useState } from "react";
import { COVER_OPTIONS } from "@/lib/covers";
import { cn } from "@/lib/utils";

type Mode = "preset" | "url" | "upload";

interface CoverPickerProps {
  name: string;
  initialValue?: string;
}

function initialMode(value: string | undefined): Mode {
  if (!value || value.startsWith("/covers/")) return "preset";
  if (value.startsWith("/uploads/")) return "upload";
  return "url";
}

const tab =
  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors";

export function CoverPicker({ name, initialValue }: CoverPickerProps) {
  const startMode = initialMode(initialValue);
  const [mode, setMode] = useState<Mode>(startMode);
  const [preset, setPreset] = useState(
    startMode === "preset" ? (initialValue ?? COVER_OPTIONS[0]) : COVER_OPTIONS[0],
  );
  const [url, setUrl] = useState(startMode === "url" ? (initialValue ?? "") : "");
  const [uploaded, setUploaded] = useState(
    startMode === "upload" ? (initialValue ?? "") : "",
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const value = mode === "preset" ? preset : mode === "url" ? url : uploaded;

  async function onFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload-cover", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      setUploaded(data.url);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-ink">Cover image</span>
      <input type="hidden" name={name} value={value} />

      <div className="mb-3 inline-flex rounded-lg border border-border p-1">
        {(["preset", "url", "upload"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              tab,
              mode === m ? "bg-accent text-white" : "text-muted",
            )}
          >
            {m === "preset" ? "Built-in" : m === "url" ? "Image URL" : "Upload"}
          </button>
        ))}
      </div>

      {mode === "preset" && (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {COVER_OPTIONS.map((src) => (
            <button
              type="button"
              key={src}
              onClick={() => setPreset(src)}
              aria-pressed={preset === src}
              className={cn(
                "relative aspect-[2/3] overflow-hidden rounded-md border-2 transition-all",
                preset === src
                  ? "border-accent ring-2 ring-accent"
                  : "border-transparent hover:border-border",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {mode === "url" && (
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://images.example.com/cover.jpg"
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        />
      )}

      {mode === "upload" && (
        <div className="flex items-center gap-4">
          <div className="relative h-28 w-20 flex-shrink-0 overflow-hidden rounded-md border border-border bg-surface-raised">
            {uploaded ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={uploaded} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xs text-muted">
                No image
              </span>
            )}
          </div>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="rounded-full bg-surface px-5 py-2.5 text-sm font-medium text-ink ring-1 ring-border transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
            >
              {uploading ? "Uploading…" : uploaded ? "Replace image" : "Choose image"}
            </button>
            <p className="mt-2 text-xs text-muted">PNG, JPG, WEBP or GIF · max 5 MB</p>
            {error && (
              <p role="alert" className="mt-1 text-xs text-accent-hover">
                {error}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
