# Stash

Paste a link or any text. Stash files it into the right folder automatically,
with an AI-generated title and one-line summary. Web first, installable as a
PWA on iOS / Android.

## Features

- **Auth**: email + password (with email verification link), Google OAuth, Facebook OAuth
- **Smart paste**: Claude analyzes the content (and fetches the link if you paste a URL), proposes an existing folder, or suggests a new one
- **Notes**: edit title, summary, content; move between folders; delete
- **Folders**: create, rename, delete (no sub-folders); deleting a folder unfiles its notes
- **Sharing**: notes are private by default; one click to mint a public read-only link
- **Search**: full-text search across title, summary, and content
- **PWA**: manifest + standalone display; installable on phones via "Add to Home Screen"

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind · Prisma + SQLite · Auth.js v5 · Anthropic SDK (Claude Opus 4.7 with prompt caching)

## Run locally

```bash
cd stash
cp .env.example .env
# Edit .env — at minimum set AUTH_SECRET (openssl rand -base64 32)
# Optional: ANTHROPIC_API_KEY (falls back to a simple heuristic if missing)
# Optional: AUTH_GOOGLE_ID / AUTH_FACEBOOK_ID for OAuth buttons

npm install
npx prisma db push   # creates dev.db from schema
npm run dev
```

Open <http://localhost:3000>.

### Email verification in dev

If `SMTP_HOST` is empty, the verification link is **printed to the server console** instead of emailed. Click it to verify, then sign in.

### Enabling OAuth

- **Google**: create OAuth credentials at <https://console.cloud.google.com>, set redirect URI `http://localhost:3000/api/auth/callback/google`, put `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` in `.env`.
- **Facebook**: create app at <https://developers.facebook.com>, redirect URI `http://localhost:3000/api/auth/callback/facebook`, put `AUTH_FACEBOOK_ID`/`AUTH_FACEBOOK_SECRET` in `.env`.

Buttons hide automatically when credentials aren't set.

### Native apps (iOS / Android)

The web build is a PWA — users can install it from Safari ("Add to Home Screen") or Chrome ("Install App"). For real native shells, wrap the same URL in Capacitor or use the Web Share Target API for paste-from-anywhere flows.

## Project layout

```
stash/
├── prisma/schema.prisma         # User, Account, Session, Folder, Note, VerificationToken
├── src/
│   ├── app/
│   │   ├── page.tsx             # landing
│   │   ├── login, register, verify
│   │   ├── app/                 # authed app shell
│   │   │   ├── page.tsx         # paste box + folders + recent
│   │   │   ├── folders/[id]
│   │   │   ├── notes/[id]
│   │   │   └── search
│   │   ├── s/[token]            # public share page
│   │   └── api/
│   │       ├── auth/[...nextauth], auth/register, auth/verify
│   │       ├── paste            # POST: categorize + create note
│   │       ├── notes, notes/[id], notes/[id]/share
│   │       ├── folders, folders/[id]
│   │       └── search
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts              # Auth.js config: credentials + Google + Facebook
│   │   ├── ai.ts                # Claude categorization (cached system prompt)
│   │   ├── fetch-url.ts         # pulls og:title/description from pasted URLs
│   │   └── email.ts             # nodemailer + dev-console fallback
│   └── components/
│       ├── PasteBox, NewFolderButton, FolderHeader, NoteEditor
└── public/
    ├── manifest.json
    └── icon.svg
```

## Notes on the AI step

- Model: `claude-opus-4-7`
- The system prompt is cached via `cache_control: {type: "ephemeral"}` — every paste after the first reuses the cached prefix (~90% discount on those tokens)
- Folder list is sorted before sending so it stays prefix-stable across requests with the same set of folders
- Returns structured JSON via `output_config.format` (no prefill, no parsing fragility)
- If `ANTHROPIC_API_KEY` is unset, the route falls back to a simple title/summary heuristic so the app still works end-to-end

## Roadmap (not implemented)

- Browser extension / iOS share sheet for paste-from-anywhere
- Tags (in addition to folders)
- Drag-and-drop reorder of folders
- SQLite FTS5 for ranked search
- Real PNG/maskable icons
- Service worker for offline shell
