"use client";

import { useActionState, useRef, useState } from "react";
import type { CategoryItem } from "@/lib/queries/categories";
import type { AuthorItem } from "@/lib/queries/authors";
import type { StoryActionState } from "@/lib/actions/stories";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { CoverPicker } from "./CoverPicker";

const field =
  "w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg";
const labelClass = "mb-1.5 block text-sm font-medium text-ink";

export interface StoryFormInitial {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  categoryId: string;
  authorId: string;
  coverImage: string;
  readingTimeMin: number;
  featured: boolean;
}

interface StoryFormProps {
  action: (
    prev: StoryActionState,
    formData: FormData,
  ) => Promise<StoryActionState>;
  categories: CategoryItem[];
  authors: AuthorItem[];
  initial?: StoryFormInitial;
  submitLabel: string;
  aiEnabled?: boolean;
}

export function StoryForm({
  action,
  categories,
  authors,
  initial,
  submitLabel,
  aiEnabled = false,
}: StoryFormProps) {
  const [state, formAction, pending] = useActionState<StoryActionState, FormData>(
    action,
    {},
  );

  // Controlled fields (so document import can auto-fill them).
  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [readingTime, setReadingTime] = useState(initial?.readingTimeMin ?? 5);
  const [authorChoice, setAuthorChoice] = useState(initial?.authorId ?? "");

  // Document import state.
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importedFrom, setImportedFrom] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(file: File) {
    setImporting(true);
    setImportError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/extract-story", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setImportError(data.error ?? "Could not read that document.");
        return;
      }
      if (data.title) setTitle(data.title);
      if (data.excerpt) setExcerpt(data.excerpt);
      if (data.body) setBody(data.body);
      if (data.readingTimeMin) setReadingTime(data.readingTimeMin);
      if (data.categorySlug) {
        const match = categories.find((c) => c.slug === data.categorySlug);
        if (match) setCategoryId(match.id);
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
              <p className="text-sm font-medium text-ink">
                Import from a document
              </p>
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
          placeholder="The Morning I Stopped Running"
        />
      </div>

      <div>
        <label htmlFor="excerpt" className={labelClass}>
          Excerpt <span className="font-normal text-muted">(shown on cards)</span>
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          required
          rows={2}
          className={field}
          placeholder="A one or two sentence hook…"
        />
      </div>

      <div>
        <label htmlFor="body" className={labelClass}>
          Story{" "}
          <span className="font-normal text-muted">
            (blank line = new paragraph; start a line with &gt; for a quote)
          </span>
        </label>
        <textarea
          id="body"
          name="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={14}
          className={cn(field, "font-reading leading-relaxed")}
          placeholder={"Write the story here.\n\nSeparate paragraphs with a blank line.\n\n> A line like this becomes a pull-quote."}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="categoryId" className={labelClass}>
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className={field}
          >
            <option value="" disabled>
              Choose a category…
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="readingTimeMin" className={labelClass}>
            Reading time (min)
          </label>
          <input
            id="readingTimeMin"
            name="readingTimeMin"
            type="number"
            min={1}
            max={120}
            value={readingTime}
            onChange={(e) => setReadingTime(Number(e.target.value))}
            required
            className={field}
          />
        </div>
      </div>

      <div>
        <label htmlFor="authorId" className={labelClass}>
          Author
        </label>
        <select
          id="authorId"
          name="authorId"
          value={authorChoice}
          onChange={(e) => setAuthorChoice(e.target.value)}
          required
          className={field}
        >
          <option value="" disabled>
            Choose an author…
          </option>
          {authors.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
          <option value="__new">+ New author…</option>
        </select>
        {authorChoice === "__new" && (
          <input
            name="newAuthorName"
            placeholder="New author name"
            className={cn(field, "mt-3")}
          />
        )}
      </div>

      <CoverPicker name="coverImage" initialValue={initial?.coverImage} />

      <label className="flex items-center gap-3 text-sm text-ink">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={initial?.featured}
          className="h-4 w-4 rounded border-border text-accent focus-visible:ring-accent"
        />
        Feature this story on the homepage
      </label>

      {state.error && (
        <p role="alert" className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent-hover">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
