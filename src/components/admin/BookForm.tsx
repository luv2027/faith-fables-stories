"use client";

import { useActionState, useRef, useState } from "react";
import type { CollectionItem } from "@/lib/queries/books";
import type { BookActionState } from "@/lib/actions/books";
import { Button } from "@/components/ui/Button";
import { CoverPicker } from "./CoverPicker";

const field =
  "w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg";
const labelClass = "mb-1.5 block text-sm font-medium text-ink";

export interface BookFormInitial {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  keyLessons: string[];
  collectionIds: string[];
}

interface BookFormProps {
  action: (
    prev: BookActionState,
    formData: FormData,
  ) => Promise<BookActionState>;
  collections: CollectionItem[];
  initial?: BookFormInitial;
  submitLabel: string;
  aiEnabled?: boolean;
}

export function BookForm({
  action,
  collections,
  initial,
  submitLabel,
  aiEnabled = false,
}: BookFormProps) {
  const [state, formAction, pending] = useActionState<BookActionState, FormData>(
    action,
    {},
  );

  // Controlled fields (so document import can auto-fill them).
  const [title, setTitle] = useState(initial?.title ?? "");
  const [author, setAuthor] = useState(initial?.author ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [keyLessons, setKeyLessons] = useState(
    initial?.keyLessons.join("\n") ?? "",
  );
  const [selectedCollections, setSelectedCollections] = useState<string[]>(
    initial?.collectionIds ?? [],
  );

  // Document import state.
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importedFrom, setImportedFrom] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function toggleCollection(id: string) {
    setSelectedCollections((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function onFile(file: File) {
    setImporting(true);
    setImportError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/extract-book", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setImportError(data.error ?? "Could not read that document.");
        return;
      }
      if (data.title) setTitle(data.title);
      if (data.author) setAuthor(data.author);
      if (data.description) setDescription(data.description);
      if (Array.isArray(data.keyLessons) && data.keyLessons.length) {
        setKeyLessons(data.keyLessons.join("\n"));
      }
      if (Array.isArray(data.collectionSlugs) && data.collectionSlugs.length) {
        const ids = collections
          .filter((c) => data.collectionSlugs.includes(c.slug))
          .map((c) => c.id);
        if (ids.length) setSelectedCollections(ids);
      }
      setImportedFrom(file.name);
    } catch {
      setImportError("Upload failed. Please try again.");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      {initial && <input type="hidden" name="id" value={initial.id} />}

      {/* Import from document */}
      {aiEnabled && (
        <div className="rounded-xl border border-dashed border-accent-soft bg-accent-soft/10 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ink">Import from a document</p>
              <p className="text-xs text-muted">
                Upload a PDF, DOCX, TXT or MD and AI fills the fields below for
                you to review.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {importedFrom && !importing && (
                <span className="text-xs text-muted">Filled from {importedFrom}</span>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.docx,.txt,.md,application/pdf,text/plain"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onFile(f);
                }}
              />
              <Button
                type="button"
                variant="secondary"
                disabled={importing}
                onClick={() => fileRef.current?.click()}
              >
                {importing ? "Analyzing…" : "Upload document"}
              </Button>
            </div>
          </div>
          {importError && (
            <p role="alert" className="mt-3 text-sm text-accent-hover">
              {importError}
            </p>
          )}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="title" className={labelClass}>
            Title
          </label>
          <input
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={field}
          />
        </div>
        <div>
          <label htmlFor="author" className={labelClass}>
            Author
          </label>
          <input
            id="author"
            name="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
            className={field}
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          className={field}
        />
      </div>

      <div>
        <label htmlFor="keyLessons" className={labelClass}>
          Key lessons{" "}
          <span className="font-normal text-muted">(one per line)</span>
        </label>
        <textarea
          id="keyLessons"
          name="keyLessons"
          value={keyLessons}
          onChange={(e) => setKeyLessons(e.target.value)}
          rows={5}
          className={field}
          placeholder={"You do not rise to your goals; you fall to your systems.\nSmall habits are votes for who you want to become."}
        />
      </div>

      <div>
        <span className={labelClass}>Collections</span>
        <div className="grid gap-2 sm:grid-cols-2">
          {collections.map((c) => (
            <label
              key={c.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink"
            >
              <input
                type="checkbox"
                name="collections"
                value={c.id}
                checked={selectedCollections.includes(c.id)}
                onChange={() => toggleCollection(c.id)}
                className="h-4 w-4 rounded border-border text-accent focus-visible:ring-accent"
              />
              {c.name}
            </label>
          ))}
        </div>
      </div>

      <CoverPicker name="coverImage" initialValue={initial?.coverImage} />

      {state.error && (
        <p role="alert" className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent-hover">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
