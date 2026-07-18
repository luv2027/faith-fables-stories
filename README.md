# Faith Fables Stories

> **Stories That Inspire the Heart.**
> A calm, premium platform of inspiring stories, curated books, and an AI guide — built to help people learn, reflect, and grow. Not a bookstore; a meaningful place to read.

---

## Table of contents

- [Overview](#overview)
- [Tech stack](#tech-stack)
- [Features](#features)
- [Architecture](#architecture)
  - [Directory layout](#directory-layout)
  - [Request & data flow](#request--data-flow)
  - [Data model](#data-model)
  - [Authentication & sessions](#authentication--sessions)
  - [Admin & roles](#admin--roles)
  - [AI Guide (Gemini)](#ai-guide-gemini)
  - [Design system](#design-system)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [npm scripts](#npm-scripts)
- [Security](#security)
- [Deployment](#deployment)
- [Roadmap](#roadmap)

---

## Overview

Faith Fables Stories brings together four things:

1. **Stories** — inspiring, real-life journeys across categories (Personal Growth, Success, Spiritual Wisdom, Leadership, Creativity, Overcoming Challenges). Browse, search, filter, and read in a distraction-free reader.
2. **Books** — a curated library organized by *how you feel / what you need* (Finding Purpose, Building Discipline, For Entrepreneurs, …) rather than by genre.
3. **AI Guide** — a warm, conversational companion (Google Gemini) that talks with you and recommends stories/books **from the catalog** only when you ask or accept an offer. Full chat history per account.
4. **Community** — a thoughtful space for sharing and reflection *(placeholder in the current build)*.

Accounts, an admin content studio, and a per-user AI chat history are all implemented.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | **Next.js 16** (App Router, React 19, Turbopack) |
| Language | **TypeScript** (strict) |
| Styling | **Tailwind CSS v4** (CSS-first `@theme`, no `tailwind.config.js`) |
| Database | **PostgreSQL** |
| ORM | **Drizzle ORM** + `drizzle-kit` (node-postgres driver) |
| Auth | Custom sessions (scrypt password hashing + DB-backed sessions) + **Google OAuth** |
| AI | **Google Gemini** (`gemini-flash-latest`) via REST, streaming |
| Validation | **Zod** |
| Fonts | Fraunces (display), Newsreader (reading), Inter (UI) via `next/font` |

> ⚠️ This project targets **Next.js 16**, which has meaningful differences from earlier versions: `params`/`searchParams` are Promises, typed `PageProps<'/route'>` helpers, middleware renamed to `proxy.ts`, `fetch` uncached by default, and Tailwind v4's CSS-based config. See `node_modules/next/dist/docs/` for the bundled reference.

---

## Features

- **Landing page** — warm-editorial hero, featured stories, category browse, book-collection teasers, community & AI teasers.
- **Stories** — grid browse, text search + category filter (URL-driven `?q=&category=`), long-form reader with author, reading time, likes, related books.
- **Books** — collections by emotion/goal, book detail with key lessons, reviews, related stories.
- **Auth** — email/password sign-up & sign-in, "Continue with Google", secure httpOnly sessions, dark/light theme.
- **Admin studio** (`/admin`) — full CRUD for **stories** and **books** (title, category/author or collection assignment, key lessons, featured flag). Cover image via **built-in picker, URL, or file upload**. Changes publish to the live site immediately.
- **AI document import** — in the admin forms, upload a **PDF / DOCX / TXT / MD** and Gemini auto-fills the fields (story: title, excerpt, body, category, reading time; book: title, author, description, key lessons, collections) for you to review before saving.
- **Branding** — lotus logo mark in the navbar, footer, auth cards, and favicon (generated from the source artwork via `scripts/gen-logo.mjs`).
- **AI Guide** — ChatGPT-style streaming chat, conversational-first (recommends only on request/offer), **per-account chat history** with a sidebar (new chat, load, delete).
- **Accessibility & polish** — semantic landmarks, focus rings, skip link, reduced-motion support, responsive nav.

---

## Architecture

### Directory layout

```
app/                              # Next.js App Router (routes = folders)
  layout.tsx                      # root layout: fonts, theme script, Navbar, ConditionalFooter
  page.tsx                        # landing page
  globals.css                     # Tailwind v4 @theme design tokens
  stories/                        # /stories, /stories/[slug]
  books/                          # /books, /books/[slug]
  community/  ai-guide/           # community placeholder, AI chat
  login/  signup/                 # auth pages
  admin/                          # admin studio (layout gates on role)
    page.tsx  stories/  books/    # story & book CRUD screens
  api/
    ai-guide/stream/route.ts      # streaming Gemini endpoint (+ persists chat)
    auth/google/                  # OAuth start + callback route handlers
    admin/extract-story/          # doc → structured story fields (Gemini)
    admin/extract-book/           # doc → structured book fields (Gemini)
    admin/upload-cover/           # image upload → /public/uploads/covers

db/
  schema.ts                       # Drizzle tables + relations + inferred types
  index.ts                        # pooled Drizzle client (globalThis singleton), server-only
  seed.ts                         # idempotent seed (stories, books, etc.)
  migrations/                     # drizzle-kit generated SQL

lib/
  env.ts                          # zod-validated env (server-only)
  utils.ts  covers.ts             # helpers (cn, slugify, cover options)
  queries/                        # server-only read functions (stories, books, categories, authors, conversations)
  actions/                        # 'use server' mutations (stories, books, conversations, ai-guide)
  auth/                           # password (scrypt), session, google OAuth, auth actions
  ai/                             # gemini client (JSON + streaming), guide prompt builder

src/components/
  layout/  ui/  stories/  books/  admin/  ai/  auth/   # presentational + interactive components

scripts/gen-covers.mjs            # generates warm-gradient SVG cover placeholders
```

**Path aliases** (`tsconfig.json`): `@/components/*` → `src/components/*`, `@/db/*` → `db/*`, `@/lib/*` → `lib/*`, `@/*` → project root.

### Request & data flow

- **Reads**: Server Components call typed functions in `lib/queries/*` directly (no REST layer) → Drizzle → Postgres. These modules are `server-only`.
- **Writes**: Forms submit to `'use server'` actions in `lib/actions/*`, which validate with Zod, mutate via Drizzle, then `revalidatePath()` the affected pages so the site updates immediately.
- **Streaming AI**: the chat posts to `app/api/ai-guide/stream/route.ts`, which streams Gemini tokens straight to the browser and persists the turn before closing.

### Data model

Drizzle schema in `db/schema.ts`. Tables in use:

| Table | Purpose |
|-------|---------|
| `authors`, `categories` | story authorship & taxonomy |
| `stories` | title, slug, body, cover, author/category FKs, reading time, like/comment counters, featured |
| `books`, `book_collections`, `book_collection_books` | books + emotion/goal collections (many-to-many) |
| `reviews`, `story_related_books` | book reviews; story↔book links |
| `users` | email, name, scrypt `password_hash` (nullable for OAuth), `google_id`, `role` |
| `sessions` | opaque token → user, with expiry |
| `ai_conversations`, `ai_messages` | per-user chat history + stored recommendation slugs |

Reserved-for-roadmap tables also exist (`comments`, `likes`, `follows`, `saved_stories`, `favorite_books`, `reading_journey`).

Migrations live in `db/migrations/` and are applied with `npm run db:migrate`.

### Authentication & sessions

- Passwords hashed with **scrypt** (`node:crypto`, no native deps) — format `salt:hash`, constant-time compare.
- **Sessions** are random opaque tokens stored in the `sessions` table; the token lives in an **httpOnly, SameSite=Lax, Secure-in-prod** cookie (`ff_session`).
- `getCurrentUser()` (React-cached per request) resolves the cookie → session → user. `requireUser()` / `requireAdmin()` redirect when unauthorized.
- **Google OAuth**: `/api/auth/google` starts the flow (CSRF `state` cookie); `/api/auth/google/callback` exchanges the code, fetches the profile, upserts the user by email, and starts a session. Works alongside password login; OAuth-only users have no password.

### Admin & roles

- Every user has a `role` of `user` or `admin` (stored on `users`).
- **Admins are defined by the `ADMIN_EMAILS` allow-list** in the environment. On **sign-up and every login** (password *and* Google), a user's role is synced: email in the list → `admin`, else `user`.
- `/admin/*` is gated in `app/admin/layout.tsx` via `requireAdmin()`; the "Admin" nav link only shows for admins.
- There is **no self-service admin** — role is granted only by editing `ADMIN_EMAILS` (server-side), which is deliberate.

### AI Guide (Gemini)

- **Grounded**: the whole catalog (story/book titles, slugs, categories, excerpts) is injected into the system prompt; the model may recommend **only by slug from that list** — no hallucinated titles. Returned slugs are re-validated against the DB before rendering cards.
- **Conversational-first**: by default it recommends nothing; it only shows stories/books when the user asks or accepts an offer. Recommendations are emitted as a single trailing `@@RECS {…}` line, split from the visible message.
- **Streaming**: `streamGeminiText()` reads Gemini's SSE and the route pipes tokens to the client for a live typing effect.
- **History**: for signed-in users, each turn is saved to `ai_conversations` / `ai_messages`; reopening a conversation restores messages and re-resolves recommendation cards. Guests chat ephemerally.
- Provider logic is isolated in `lib/ai/*`, so swapping models/providers is a small change.

### Design system

- **Logo-matched** aesthetic: blush-white background, deep indigo-plum ink, **lotus rose-magenta** accent with **gold** highlights (echoing the logo); a matching deep-plum (never pure-black) dark theme. The "FaithFables" wordmark is two-tone (navy + rose) like the logo.
- Tailwind **v4** design tokens live in `app/globals.css` under `@theme` (e.g. `--color-bg`, `--color-ink`, `--color-accent`). Dark mode via a `.dark` class + `@custom-variant`.
- Typography: **Fraunces** for headings, **Newsreader** for the reading column (66ch measure), **Inter** for UI.
- Calm motion only (fade-rise, hover lift), fully disabled under `prefers-reduced-motion`.

---

## Getting started

### Prerequisites

- **Node.js 20+**
- **PostgreSQL 15+** — either a local install (e.g. Homebrew `postgresql@15`) or the bundled `docker-compose.yml` (`postgres:17`).

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Start Postgres
docker compose up -d          # OR use a local/hosted Postgres

# 3. Configure environment
cp .env.example .env          # then edit values (see below)

# 4. Create schema + seed content
npm run db:migrate
npm run db:seed

# 5. Run
npm run dev                   # http://localhost:3000
```

To become an admin, put your email in `ADMIN_EMAILS`, then sign up/log in with it.

---

## Environment variables

All configuration is via `.env` (never committed). See `.env.example` for the template.

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Postgres connection string, e.g. `postgresql://user:pass@localhost:5432/faithfables` |
| `ADMIN_EMAILS` | — | Comma-separated emails granted the admin role on sign-up/login |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | — | Enables "Continue with Google". Redirect URI: `{origin}/api/auth/google/callback` |
| `GEMINI_API_KEY` | — | Enables the AI Guide. Get one at <https://aistudio.google.com/apikey> |
| `GEMINI_MODEL` | — | Defaults to `gemini-flash-latest` |

> The Google button and the AI Guide only activate when their keys are present; otherwise the app degrades gracefully.

---

## npm scripts

| Script | Does |
|--------|------|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm run start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate a migration from `db/schema.ts` |
| `npm run db:migrate` | Apply migrations |
| `npm run db:push` | Push schema directly (dev convenience) |
| `npm run db:seed` | Seed catalog content |
| `npm run db:studio` | Open Drizzle Studio |

---

## Security

- **`.env` is gitignored** (`.env*`) and contains all secrets — it is never committed.
- **No `NEXT_PUBLIC_` secrets.** Next.js only exposes env vars to the browser when prefixed `NEXT_PUBLIC_`; none of our secrets (`GEMINI_API_KEY`, `GOOGLE_CLIENT_SECRET`, `DATABASE_URL`) use it, so they **never reach the client bundle**.
- **`server-only` guards** on `lib/env.ts`, `db/index.ts`, `lib/auth/*`, `lib/ai/gemini.ts`, and all `lib/queries/*` — importing them into a Client Component fails the build, preventing accidental leakage of `pg`/keys.
- **Passwords**: scrypt-hashed, never stored or logged in plaintext; constant-time comparison.
- **Sessions**: opaque random tokens in httpOnly/SameSite/Secure cookies; server-validated with expiry; deletable.
- **Authorization**: admin routes and every mutating action call `requireAdmin()` / `requireUser()` server-side (not just hidden in the UI).
- **AI safety**: the guide can only surface catalog items (slug-validated), preventing fabricated recommendations.
- **Input validation**: Zod at every action/route boundary.
- **`.env.example`** ships with empty placeholders only — no real keys.

> If an API key has ever been shared outside `.env` (chat, screenshot, logs), rotate it — for Gemini at <https://aistudio.google.com/apikey>.

### Known limitation (pre-launch)

- **Email ownership is not verified for password signup.** We validate email *format* (Zod `z.email()`), and Google sign-in is verified by Google (`email_verified`), but password signup does **not** send a confirmation email. Because admin is granted via `ADMIN_EMAILS` on signup, a not-yet-registered admin email could be claimed via password signup without proving ownership. Mitigations to apply before a public launch: require admins to authenticate via Google, and/or add email verification (code/link) using an email provider. Google-authenticated logins are already safe.

---

## Deployment

1. Provision a hosted Postgres (Neon, Supabase, RDS, …) and set `DATABASE_URL`.
2. Set all env vars in the host (including `ADMIN_EMAILS`, and `GEMINI_*` / `GOOGLE_*` if used). Add the production redirect URI to your Google OAuth client.
3. Run migrations against the prod DB: `npm run db:migrate` (and `npm run db:seed` for initial content).
4. `npm run build && npm run start` (or deploy to a Next.js host like Vercel).

No code changes are needed between local and hosted DBs — everything goes through `DATABASE_URL` and Drizzle.

### File uploads on serverless (important)

Cover-image uploads are written to `public/uploads/covers/` on the local filesystem. This works in dev and on a **persistent/self-hosted server**, but **not on ephemeral serverless hosts** (e.g. Vercel), where the filesystem is read-only/temporary — uploaded files would vanish between deploys/requests. Before deploying there, point the `app/api/admin/upload-cover/route.ts` handler at **object storage** (AWS S3, Cloudflare R2, or Supabase Storage) and store the returned public URL instead of a local path. The "Built-in" and "Image URL" cover options work anywhere with no changes.

---

## Roadmap

- Community: user-authored stories, likes, comments, following (tables already modeled).
- Reading journey, saved stories, favorite books.
- Book reviews & collection management in the admin studio.
- In-app user/role management (so admins can promote without editing env).
- **Email verification for password signup** + verified-admin bootstrap (see Security → Known limitation).
- **Object storage for cover uploads** (S3 / R2 / Supabase) so uploads persist on serverless hosts (see Deployment → File uploads).
- Mobile drawer for the chat-history sidebar; conversation rename.
