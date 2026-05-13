# CLAUDE.md — audio-swap

## Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 + Quasar + Capacitor (TypeScript, `<script setup>`, Pinia) |
| Storage (client) | `@capacitor-community/sqlite` (mobile) / `sql.js` (web/PWA) |
| Backend | NestJS + better-sqlite3 |
| Database | SQLite (single file per environment) |
| Media processing | FFmpeg (pinned binary, server-side via `child_process`) |
| Payments | Stripe (Checkout + Billing Portal) |
| Package manager | pnpm |
| Testing | Vitest (frontend unit), Jest (backend unit), Playwright (E2E) |
| Language | TypeScript strict throughout |

## Repo Layout

```
audio-swap/
├── app/                              # Quasar + Vue 3 frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── VideoImporter.vue     # URL or file upload
│   │   │   ├── AudioTrackMixer.vue   # Level + fade controls per track
│   │   │   ├── VoiceRecorder.vue     # MediaRecorder voiceover capture
│   │   │   ├── MusicLibrary.vue      # Royalty-free track browser
│   │   │   └── JobStatus.vue         # Polling / SSE progress indicator
│   │   ├── pages/
│   │   │   ├── IndexPage.vue
│   │   │   ├── EditorPage.vue
│   │   │   ├── ExportPage.vue
│   │   │   └── AccountPage.vue
│   │   ├── stores/
│   │   │   ├── project.store.ts
│   │   │   ├── job.store.ts
│   │   │   └── auth.store.ts
│   │   ├── composables/
│   │   │   ├── useJobPolling.ts
│   │   │   ├── useVoiceRecorder.ts
│   │   │   └── useVideoImport.ts
│   │   └── db/
│   │       ├── client.ts
│   │       └── migrations/
├── api/                              # NestJS backend
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   ├── auth/
│   │   ├── users/
│   │   ├── projects/                 # Project metadata, import handling
│   │   ├── jobs/                     # Processing job CRUD, SSE status gateway
│   │   ├── ffmpeg/                   # PROTECTED — FFmpeg config, executor, probing
│   │   │   ├── ffmpeg.config.ts      # Pinned binary path + version assertion
│   │   │   ├── ffmpeg.executor.ts    # child_process wrapper
│   │   │   └── ffmpeg.service.ts     # Audio swap command builder
│   │   ├── royalty-free-library/     # PROTECTED — curated track metadata + file refs
│   │   │   ├── library.service.ts
│   │   │   └── tracks/              # Audio files (MP3, curated)
│   │   ├── billing/
│   │   ├── storage/
│   │   └── common/
│   │       ├── guards/
│   │       ├── pipes/
│   │       └── interceptors/
│   ├── test/
│   └── data/
│       └── audio-swap.db
├── e2e/                              # Playwright tests
├── .env.example
└── pnpm-workspace.yaml
```

## Running the App

```bash
# Install all deps
pnpm install

# Start backend (dev)
pnpm --filter api dev

# Start frontend (dev)
pnpm --filter app dev
```

## Testing

```bash
# Frontend unit tests
pnpm --filter app test

# Backend unit tests
pnpm --filter api test

# Backend e2e tests
pnpm --filter api test:e2e

# Playwright E2E
pnpm --filter e2e test
```

## Lint / Format / Type Check

```bash
pnpm --filter app lint
pnpm --filter api lint
pnpm --filter app typecheck
pnpm --filter api typecheck
pnpm format
```

## Code Conventions

- All Vue components use `<script setup lang="ts">` — no Options API
- Pinia stores use `defineStore` with setup function syntax
- NestJS services hold all business logic — controllers are thin
- DTOs use `class-validator`; all inputs validated at controller boundary
- No `any` type — use `unknown` with explicit narrowing
- File naming: `kebab-case.ts` for modules, `PascalCase.vue` for components
- FFmpeg commands are assembled exclusively in `api/src/ffmpeg/ffmpeg.service.ts`
- SQLite queries use parameterized statements only

## Storage Rules

- **Client-side:** `sql.js` (web/PWA) or `@capacitor-community/sqlite` (native). Stores project metadata and job status cache only.
- **Server-side:** `better-sqlite3` via NestJS service. WAL mode enabled. Single `audio-swap.db` file.
- Uploaded video and audio files stored in `storage/uploads/`. Deleted after 48 hours via cron.
- Processed output files stored in `storage/outputs/`. Deleted after 7 days if unclaimed.
- Never store binary media in SQLite — file paths only.
- Royalty-free audio track files live in `api/src/royalty-free-library/tracks/` — never in `storage/`.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_PATH` | Yes | Absolute path to SQLite `.db` file |
| `JWT_SECRET` | Yes | JWT signing secret |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook endpoint secret |
| `STRIPE_PRO_PRICE_ID` | Yes | Stripe Price ID for $4.99/mo — hardcoded, never change |
| `FFMPEG_BINARY_PATH` | Yes | Absolute path to pinned FFmpeg binary |
| `FFMPEG_EXPECTED_VERSION` | Yes | Expected FFmpeg version string — assertion on startup |
| `MAX_UPLOAD_MB_FREE` | Yes | Must be `500` — free tier upload cap |
| `MAX_UPLOAD_MB_PRO` | Yes | Must be `2048` — Pro tier upload cap |
| `MAX_DURATION_FREE_MINUTES` | Yes | Must be `5` |
| `MAX_DURATION_PRO_MINUTES` | Yes | Must be `60` |
| `STORAGE_PATH` | Yes | Absolute path to local file storage root |
| `PORT` | Yes | NestJS listen port (default: `3000`) |
| `CORS_ORIGIN` | Yes | Frontend origin for CORS |

## Deployment

- Backend: Docker container with FFmpeg binary baked in at the pinned version
- Frontend: Static build deployed to Cloudflare Pages or Netlify
- SQLite DB mounted as persistent volume — never inside Docker image layer
- No Redis or external queue required (jobs tracked in SQLite)

## Protected Paths

Agents must **never** modify files under these paths without explicit human approval:

- `api/src/ffmpeg/` — FFmpeg config, executor, and audio-swap command builder
- `api/src/royalty-free-library/` — curated track metadata and audio files

## Known Footguns

- FFmpeg `child_process` calls are blocking-ish — run them in a worker thread pool or use `spawn` with streaming to avoid blocking the event loop.
- The `-c:v copy` flag is mandatory. Removing it causes full video re-encode, which breaks the output format guarantee and massively increases CPU cost.
- Free-tier output resolution must be capped at 480p — apply `-vf scale=-2:480` only if source exceeds 480p, and only on free tier.
- URL-imported videos must be validated to confirm they are direct media file URLs (Content-Type check) — reject HTML page URLs early.
- `better-sqlite3` is synchronous — never call it on the main thread inside async handlers without proper isolation.
- MediaRecorder in browser produces WebM/Ogg — ensure FFmpeg accepts these as audio input without special flags.

## Commit & PR Conventions

- Commits: `type(scope): message` — types: `feat`, `fix`, `chore`, `test`, `docs`, `refactor`
- Scope examples: `importer`, `mixer`, `ffmpeg`, `library`, `billing`, `jobs`
- PRs must reference a GitHub issue number
- PR titles must not exceed 72 characters
- Every PR touching `api/src/` must include at least one Jest test
- Every PR touching `app/src/` must include at least one Vitest test
