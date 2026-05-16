# Stash — Product Specification

> **Status:** Draft v0.1 (pre-implementation)
> **Last updated:** 2026-05-16

A web-first app — installable as a PWA on iOS and Android — that turns "paste
anything" into organized notes. The user pastes a link or text; the system
analyzes the content, proposes (or creates) a folder, generates a clean title
and one-sentence summary, and stores the result as a private note that can be
made public on demand.

---

## 1. Problem & users

### Problem
People save links and text snippets across half a dozen tools — browser tabs,
notes apps, group chats, "send to self" emails — and none of them auto-organize.
Re-finding what you saved is the hard part, not saving it.

### Primary user
Knowledge workers, researchers, students, and anyone who regularly stashes
articles, screenshots-of-text, and snippets to read or reference later. They
want speed of capture (one paste, no taxonomy decisions) and reliable retrieval.

### Why this exists vs. alternatives
- **Browser bookmarks** — folder discipline required, no summaries, no text snippets.
- **Pocket / Instapaper** — links only, no AI categorization.
- **Notion / Apple Notes** — manual filing, blank-page problem.

Stash's wedge: **zero filing decisions at capture time** + **trustworthy retrieval** (search + AI-assigned folders).

---

## 2. Scope

### In scope (v1)
1. Auth: email+password with verification link, Google OAuth, Facebook OAuth
2. Paste → auto-categorize → save (AI proposes folder, title, summary)
3. Note management: edit, move between folders, delete
4. Folder management: create, rename, delete (no sub-folders)
5. Public sharing: per-note opt-in, revocable share link
6. Full-text search across all the user's notes
7. PWA shell: installable, works on desktop browsers + mobile

### Out of scope (v1, may revisit)
- Sub-folders / nested taxonomy
- Tags (in addition to folders)
- Native iOS / Android binaries (PWA covers both initially)
- Browser extension / iOS share sheet integration
- Multi-user folders / collaboration
- Real-time sync across multiple open tabs
- Offline-first writes (offline reads via PWA cache are OK)
- File / image attachments (text and links only in v1)
- Import from Pocket / Notion / bookmarks
- Notifications, reminders, deadlines

### Explicit non-goals
- This is **not** a long-form writing tool. Notes are short captures, not documents.
- This is **not** a read-it-later reader. We summarize and link out; we don't reformat the page.

---

## 3. User stories

### Capture
- As a logged-in user, I paste a URL or text into the input and click **Stash it**. Within ~3 seconds the system saves a note with an AI-generated title, summary, and folder assignment, and shows me which folder it went to.
- If no existing folder fits, the system proposes a new folder name and creates it as part of the same action.
- I can paste from anywhere — even when offline — but I see a clear error if categorization fails (the AI step requires network).

### Organize
- I see my folders as chips on the home screen with note counts.
- I open a folder and see its notes (most-recently-updated first).
- I open a note, edit its title / summary / content, change its folder, or delete it.
- I create folders manually, rename them, delete them. Deleting a folder unfiles its notes (sets folder to null); it does not delete the notes.

### Find
- I type a query in the search box; matches across title, summary, and content appear ranked by recency.
- I see at least the title and the matched summary; clicking opens the full note.

### Share
- Notes are private by default — only I can see them.
- I toggle **Share** on a note; the system mints a random unguessable token and a public URL.
- Anyone with the URL sees a read-only page with title, summary, source URL (if any), and content. They cannot see other notes or my account.
- I toggle **Share** off; the existing public URL stops working (404). Re-enabling mints the same token (or a fresh one — TBD, see §10).

### Account
- I register with email + password; the system emails me a verification link valid for 24 hours.
- I cannot sign in until I click the link. If I try, I get a clear "verify your email first" message and can request a new link.
- I sign in with Google or Facebook in one click; those flows auto-verify the email.
- I sign out via a link in the top-right of the app shell.

---

## 4. Features in detail

### 4.1 Paste & categorize

**Trigger:** user submits via the paste box (button or ⌘/Ctrl+Enter).

**Steps:**
1. **URL detection** — if the pasted content contains an `http(s)://...` URL, treat the first one as the canonical link.
2. **Link enrichment** — for URL pastes, fetch the page with an 8-second timeout, extract `og:title`, `og:description`, and a trimmed body text (≤4000 chars). Failures degrade silently; the AI step still runs on the raw paste.
3. **Categorization** — call Claude with:
   - System prompt explaining the task and rules
   - User payload: pasted text, link metadata (if any), and the user's existing folder names (sorted alphabetically for cache stability)
   - Constraint: return JSON matching the schema in §6.4
4. **Folder resolution** — if Claude's `folder_name` matches an existing folder (case-insensitive), use it. Otherwise create a new folder under the user's account.
5. **Note creation** — persist with AI-generated `title`, `summary`, the full pasted `content`, and the extracted `url` (if any).
6. **Response** — return note + folder + a flag indicating whether the folder is new and Claude's confidence level. UI surfaces this as "Saved to *Finance*" or "Saved to new folder *Side Projects*".

**Latency target:** P50 ≤ 3 s, P95 ≤ 6 s (URL fetches dominate the long tail).

**Failure modes:**
- AI API down / `ANTHROPIC_API_KEY` missing → fall back to a heuristic: use page title or first line as title, page description or first 180 chars as summary, place in `Inbox` (or first existing folder). User gets the note saved; they can re-categorize manually later.
- URL fetch times out → categorize on raw text only.
- AI returns malformed JSON → use heuristic fallback, log for monitoring.

### 4.2 Note management
- **List view:** within a folder, sorted by `updatedAt` desc, paginated at 200 (revisit if real users exceed).
- **Detail view:** editable title, summary, content (textarea), folder (dropdown of all user's folders + "Unfiled").
- **Save:** explicit Save button (no auto-save in v1).
- **Delete:** confirm modal, hard delete (no trash in v1).
- **Source URL:** displayed read-only if present, linked, opens in new tab.

### 4.3 Folder management
- **No sub-folders.** Flat list.
- **Uniqueness:** folder names are unique per user (case-sensitive in storage; case-insensitive in the AI match lookup to avoid duplicates like "Finance" / "finance").
- **Color:** optional hex/name string, reserved for future UI; not surfaced in v1.
- **Position:** integer, manual reorder is post-v1, but the field exists so the AI sees a stable order.
- **Delete behavior:** notes in the folder get `folderId = null` (unfiled), they are not deleted.

### 4.4 Sharing
- Note has `isPublic: boolean` and `shareToken: string?` (16-byte hex).
- Enabling share: generate token if absent, set `isPublic = true`, return public URL `/s/{token}`.
- Public page renders: title, summary, source URL (if any), content. No author name beyond display name. No links to the rest of the user's account.
- Disabling share: set `isPublic = false`. The token is *preserved* on the record so re-enabling reuses the same URL (see §10 open question).
- Public page sets `noindex` meta tag (search engines should not crawl unless the user explicitly wants that — out of scope for v1 to make it configurable).

### 4.5 Search
- v1: SQL `LIKE` across `title`, `summary`, `content` (case-insensitive), ranked by `updatedAt` desc, capped at 100 results.
- Post-v1: SQLite FTS5 or Postgres `tsvector` for ranked relevance.
- UI: dedicated `/app/search` page, instant on Enter (no live-as-you-type to avoid quota burn on hosted DB later).

### 4.6 Auth
| Method | Flow | Verified on |
|---|---|---|
| Email + password | Register → verification email → click link → sign in | Click of verification link |
| Google OAuth | Click button → Google consent → return | Google asserts verified email |
| Facebook OAuth | Click button → Facebook consent → return | Facebook asserts verified email |

- Password rules: min 8 chars; hashed with bcrypt (cost factor 10).
- Verification token: 32-byte hex, 24-hour expiry, single-use (deleted on consume).
- Session: JWT (stateless), 30-day rolling expiry.
- Account linking: if a user signs in with OAuth using an email that already has a password account, the accounts are linked (single user record).

### 4.7 PWA
- `manifest.json` with `display: standalone`, `start_url: /app`, theme color matching the dark UI.
- "Add to Home Screen" works on iOS Safari and Chrome on Android.
- A service worker for offline shell + cached assets is post-v1 (offline writes require sync logic — punted to v2).

---

## 5. UX flows

### 5.1 First-time user
1. Landing page → "Create account"
2. Register (email + password + optional name) → "Check your email"
3. Click verification link → "Email verified ✓ — sign in"
4. Sign in → empty app shell with paste box only ("No folders yet — paste something")
5. Paste a URL → folder + note created → recent list populated

### 5.2 Returning user
1. Already signed in (JWT cookie valid) → `/` redirects to `/app`
2. Otherwise → `/login`

### 5.3 Edge cases the UI must handle
- Unverified login attempt: show "Verify your email first" with a "Resend link" button.
- Categorization in progress: button shows "Stashing…", input disabled. No optimistic UI in v1 (we need the AI response to know the folder).
- Paste empty / whitespace-only: button disabled.
- Duplicate folder name (on manual create or rename): show inline "Folder name already exists".
- Share token enable when network fails: show inline error, retain previous state.

---

## 6. Data & API

### 6.1 Entities

```
User
  id            string (cuid)
  name          string?
  email         string (unique, lowercased)
  emailVerified datetime?
  passwordHash  string?              -- null for OAuth-only accounts
  image         string?              -- avatar URL from OAuth
  createdAt     datetime

Account                              -- OAuth providers linked to a User
  provider, providerAccountId, refresh_token, access_token, ...
  unique(provider, providerAccountId)

Session                              -- Auth.js session table
  sessionToken, userId, expires

VerificationToken
  userId, token (unique), expires

Folder
  id        string (cuid)
  userId    string
  name      string                   -- unique per user
  color     string?
  position  int
  createdAt, updatedAt
  unique(userId, name)

Note
  id          string (cuid)
  userId      string
  folderId    string?                -- nullable: unfiled notes
  title       string
  summary     string?
  content     string                 -- the original pasted text
  url         string?                -- extracted URL, if any
  isPublic    boolean (default false)
  shareToken  string? (unique)
  createdAt, updatedAt
```

### 6.2 Storage choice
- v1: SQLite (single-file DB, zero ops, fine up to several GB).
- v2+: Postgres when multi-region or write volume warrants.
- Schema designed to be Postgres-compatible from day one.

### 6.3 HTTP API

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | none | Create account, send verification email |
| `GET`  | `/api/auth/verify?token=…` | none | Consume verification token |
| `*`    | `/api/auth/[...nextauth]` | varies | Auth.js callback routes |
| `POST` | `/api/paste` | required | Categorize and save a paste |
| `GET`  | `/api/notes?folderId=…` | required | List notes (optionally by folder) |
| `GET`  | `/api/notes/:id` | required | Fetch one note |
| `PATCH`| `/api/notes/:id` | required | Update title/summary/content/folder |
| `DELETE`| `/api/notes/:id` | required | Hard-delete a note |
| `POST` | `/api/notes/:id/share` | required | Enable sharing, mint token |
| `DELETE`| `/api/notes/:id/share` | required | Disable sharing (keeps token on record) |
| `GET`  | `/api/folders` | required | List folders with note counts |
| `POST` | `/api/folders` | required | Create folder |
| `PATCH`| `/api/folders/:id` | required | Rename / change color / reorder |
| `DELETE`| `/api/folders/:id` | required | Delete (notes become unfiled) |
| `GET`  | `/api/search?q=…` | required | Full-text search |
| `GET`  | `/s/:token` | none | Public read-only page (server-rendered) |

All authenticated routes return `401` if the session is invalid, `404` if the resource doesn't exist or isn't owned by the caller (we don't leak existence).

### 6.4 AI contract

**Model:** `claude-opus-4-7` (configurable via env).

**System prompt (cached via prompt-caching):**
```
You are Stash's organizer assistant.

Your job: given a snippet of text or a web page summary, decide what folder
it belongs to and produce a clean title and a one-sentence summary.

Rules:
- Pick an existing folder if one is a strong fit. Otherwise propose a new
  folder name (1-3 words, Title Case, no emojis).
- Title: 3-10 words, concise, descriptive. For links, prefer the page's
  real title if available.
- Summary: one sentence, <=180 characters, factual, no fluff like "this is about".
- Output JSON only, matching the schema. Do not include any other text.
```

**User payload (JSON-encoded):**
```json
{
  "existing_folders": ["Finance", "Reading", "Work"],
  "pasted_text": "...",
  "link": {
    "url": "https://...",
    "page_title": "...",
    "page_description": "...",
    "page_text": "..."
  }
}
```

**Response schema (enforced via `output_config.format`):**
```json
{
  "title": "string (3-10 words)",
  "summary": "string (<=180 chars)",
  "folder_name": "string",
  "is_new_folder": "boolean",
  "confidence": "low | medium | high"
}
```

**Caching strategy:** the system prompt and folder list are stable across requests for the same user; `existing_folders` is sorted alphabetically before serialization to keep the byte prefix stable. We expect >80% cache hit rate after warm-up.

**Fallback (no API key or API failure):** title = page title or first line; summary = page description or first 180 chars; folder = "Inbox" (created if needed).

---

## 7. Non-functional requirements

| Concern | Target |
|---|---|
| Paste-to-saved latency (P50 / P95) | 3 s / 6 s |
| Search latency (P95, ≤10K notes per user) | 200 ms |
| Page-load TTI (cached PWA shell) | <1 s |
| Auth-session lifetime | 30 days, rolling |
| Verification token lifetime | 24 hours, single-use |
| Concurrent users (v1 target) | 1K |
| Storage per user (soft cap) | 50 MB (~50K notes) |
| Browser support | Last 2 versions of Chrome, Safari, Firefox, Edge |
| Mobile support | iOS Safari 16+, Chrome Android 110+ |

---

## 8. Security & privacy

- **Passwords:** bcrypt cost 10. Never logged.
- **Verification tokens:** 32-byte hex, single-use, stored hashed if/when we move to Postgres (v1 stores raw because SQLite is local).
- **Share tokens:** 16-byte hex (128 bits of entropy). Unguessable; safe to use as the only auth on public share pages.
- **Cookie / session:** httpOnly, secure in prod, sameSite=lax.
- **API:** all authenticated routes verify session before reading any user-scoped data. We return 404 (not 403) for not-owned resources to avoid leaking existence.
- **URL fetching:** outbound fetch from the categorize endpoint uses a 8 s timeout, follows redirects, sends a `User-Agent: StashBot/1.0`. We do **not** proxy fetched content to the user (no SSRF surface beyond what categorization needs).
- **PII:** we store email + display name + avatar URL. No analytics in v1. No telemetry on note contents.
- **Public share pages:** `noindex` meta tag. No author email or other identifying info beyond display name.

---

## 9. Roadmap (post-v1)

| Priority | Feature |
|---|---|
| High | Browser extension / iOS share sheet (paste from anywhere) |
| High | Service worker for offline reads + queued offline writes |
| High | SQLite FTS5 (ranked search) |
| Med  | Tags (orthogonal to folders) |
| Med  | Drag-and-drop folder reorder |
| Med  | Bulk move / bulk delete in folder view |
| Med  | "Did you mean folder X?" — let the user override AI categorization |
| Low  | Native iOS / Android shells (Capacitor) |
| Low  | Image / file attachments |
| Low  | Multi-user shared folders |
| Low  | Import from Pocket, Instapaper, browser bookmarks |

---

## 10. Open questions

1. **Share-token reuse on toggle off → on.** Should re-enabling sharing mint a fresh token (more secure, breaks old links) or reuse (predictable, links stay alive)? Current spec says reuse; revisit if users want "break old links" semantics.
2. **Multi-paste / batch import.** Should the paste box accept multiple URLs separated by newlines and create one note per line? Out of scope for v1, but the API shape doesn't preclude it.
3. **AI confidence threshold.** When Claude returns `confidence: "low"`, should we drop the note into `Inbox` instead of the AI's proposed folder, and let the user re-file? Pros: fewer wrong assignments. Cons: extra friction. Punt: ship as-is, watch user behavior, decide.
4. **Quota / rate limits.** What's the right per-user limit on paste calls per hour? Need real-cost data from Anthropic + URL fetching before committing. v1 ships unlimited; add limits before public launch.
5. **Account deletion / data export.** Required for GDPR-style compliance. Spec it in v1.1 unless we have a regulated user from day one.
6. **Folder color UI.** Schema reserves a `color` field; no UI in v1. Decide pill background tint vs. left-border accent when we wire it up.

---

## 11. Success metrics

- **Activation:** % of registered users who stash ≥1 note in their first session (target ≥70%).
- **Day-7 retention:** % of activated users who stash ≥1 note in days 4–7 (target ≥30%).
- **Categorization accuracy:** % of saved notes whose AI-assigned folder the user does *not* manually change in the first 7 days (target ≥85%).
- **Search use:** % of WAU who use search at least once per week (target ≥40% — proxy for "I'm actually re-finding things").
- **Share use:** % of WAU who share ≥1 note per month (target ≥10% — proxy for the note being useful to others).

---

## 12. Glossary

- **Stash (verb):** the act of pasting and saving a note.
- **Note:** the user-facing record: title + summary + content + folder + optional source URL.
- **Folder:** a flat, single-level grouping of notes. Each note belongs to ≤1 folder.
- **Share token:** the random secret embedded in a public URL.
- **Unfiled:** a note whose `folderId` is null (folder was deleted, or AI couldn't pick one).

---

## 13. Recommended tech stack (non-binding)

Provided so the spec is implementable end-to-end; the engineering team can swap any layer.

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | One codebase serves web + PWA; server components keep auth checks server-side |
| Language | TypeScript | Type safety across API and UI |
| Styling | Tailwind | Fast iteration on dark UI |
| Auth | Auth.js v5 + Prisma adapter | Handles email/password + OAuth with one library |
| DB (v1) | SQLite via Prisma | Zero-ops local; same schema works for Postgres later |
| AI | Anthropic SDK · Claude Opus 4.7 | Best categorization quality; prompt caching keeps cost low |
| Email | Nodemailer (SMTP) | Standard; dev mode logs to console |
| Hosting | Vercel or Fly.io | Both support Next.js + persistent SQLite (Fly) or external Postgres (Vercel) |

---

## 14. Splitting this spec for the Dark Factory pipeline

If this project is run through the Archon / Dark Factory pipeline (per the
parent repo's convention), this single SPEC.md should be split into the
three governance files:

| File | Content sourced from |
|---|---|
| `MISSION.md` | §1 Problem & users · §2 Scope (in / out / non-goals) · §11 Success metrics · §10 Open questions |
| `CLAUDE.md`  | §6 Data & API · §13 Tech stack · §7 Non-functional requirements · §8 Security |
| `FACTORY_RULES.md` | §4.1 failure modes · §10 Open questions (as escalation triggers) · §7 NFR thresholds (as quality gates) |

Until then, this single spec is the source of truth.
