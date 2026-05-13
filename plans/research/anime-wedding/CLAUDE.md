# CLAUDE.md — anime-wedding

## Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 + Quasar + Capacitor (TypeScript, `<script setup>`, Pinia) |
| Storage (client) | `@capacitor-community/sqlite` (mobile) / `sql.js` (web/PWA) |
| Backend | NestJS + better-sqlite3 |
| Database | SQLite (single file per environment) |
| Queue | BullMQ (Redis-backed job queue for video processing) |
| AI provider | Replicate API or RunPod API (external, not in-house) |
| Payments | Stripe (Checkout + Billing Portal) |
| Package manager | pnpm |
| Testing | Vitest (frontend unit), Jest (backend unit), Playwright (E2E) |
| Language | TypeScript strict throughout |

## Repo Layout

```
anime-wedding/
├── app/                          # Quasar + Vue 3 frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── VideoUploader.vue
│   │   │   ├── StylePresetGrid.vue
│   │   │   ├── ProcessingProgress.vue
│   │   │   └── WatermarkedPreview.vue
│   │   ├── pages/
│   │   │   ├── IndexPage.vue
│   │   │   ├── UploadPage.vue
│   │   │   ├── ResultPage.vue
│   │   │   └── AccountPage.vue
│   │   ├── stores/
│   │   │   ├── upload.store.ts
│   │   │   ├── job.store.ts
│   │   │   └── auth.store.ts
│   │   ├── composables/
│   │   │   ├── useJobPolling.ts
│   │   │   └── useVideoUpload.ts
│   │   └── db/
│   │       ├── client.ts         # sql.js or capacitor-sqlite adapter
│   │       └── migrations/
├── api/                          # NestJS backend
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   ├── auth/                 # JWT auth, user sessions
│   │   ├── users/
│   │   ├── videos/               # Upload handling, metadata, deletion scheduler
│   │   ├── jobs/                 # Job CRUD, status endpoints, SSE/WS gateway
│   │   ├── styles/               # Art style preset definitions
│   │   ├── watermark/            # PROTECTED — watermark overlay logic
│   │   ├── queue/                # PROTECTED — BullMQ producers/consumers
│   │   ├── ai-provider/          # PROTECTED — Replicate/RunPod API clients
│   │   ├── billing/              # Stripe integration, tier checks
│   │   ├── storage/              # File storage adapter (local or S3-compatible)
│   │   └── common/
│   │       ├── guards/
│   │       ├── pipes/
│   │       └── interceptors/
│   ├── test/
│   └── data/
│       └── anime-wedding.db      # SQLite database file
├── e2e/                          # Playwright tests
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

# Start Redis (required for queue)
docker compose up redis -d
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
pnpm format          # prettier across workspace
```

## Code Conventions

- All Vue components use `<script setup lang="ts">` — no Options API
- Pinia stores use `defineStore` with setup function syntax
- NestJS services are the only layer with business logic — controllers are thin
- DTOs use `class-validator` decorators; all inputs validated at controller boundary
- Errors use NestJS built-in exception filters — no raw `throw new Error()`
- File naming: `kebab-case.ts` for modules, `PascalCase.vue` for components
- No `any` type — use `unknown` and narrow explicitly
- SQLite queries use parameterized statements — never string interpolation

## Storage Rules

- **Client-side:** `sql.js` for web/PWA, `@capacitor-community/sqlite` for native. Single DB file per user session. Stores upload history and job status cache only.
- **Server-side:** `better-sqlite3` via NestJS service. Single `anime-wedding.db` file. WAL mode enabled.
- Raw video files stored in `storage/uploads/` (or S3-compatible bucket). Deleted after 24 hours via scheduled NestJS cron job.
- Processed output clips stored in `storage/outputs/`. Free tier clips include watermark baked in. Pro clips stored separately.
- Never store binary video data in SQLite — file paths only.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_PATH` | Yes | Absolute path to SQLite `.db` file |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key (sk_live_... or sk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook endpoint secret |
| `STRIPE_PRO_PRICE_ID` | Yes | Stripe Price ID for $9.99/mo Pro plan — hardcoded |
| `REPLICATE_API_TOKEN` | Yes | Replicate API token for video style transfer |
| `RUNPOD_API_KEY` | Conditional | RunPod API key (alternative to Replicate) |
| `AI_PROVIDER` | Yes | `replicate` or `runpod` |
| `REDIS_URL` | Yes | Redis connection URL for BullMQ |
| `STORAGE_DRIVER` | Yes | `local` or `s3` |
| `S3_ENDPOINT` | Conditional | S3-compatible endpoint URL |
| `S3_BUCKET` | Conditional | S3 bucket name |
| `S3_ACCESS_KEY` | Conditional | S3 access key |
| `S3_SECRET_KEY` | Conditional | S3 secret key |
| `MAX_UPLOAD_MB` | Yes | Hard cap in MB — must be `500`, never changed by agents |
| `MAX_CLIP_SECONDS` | Yes | Hard cap in seconds — must be `120`, never changed by agents |
| `VIDEO_RETENTION_HOURS` | Yes | Must be `24` — raw video deletion window |
| `PORT` | Yes | NestJS listen port (default: `3000`) |
| `CORS_ORIGIN` | Yes | Frontend origin for CORS |

## Deployment

- Backend: Docker container, single NestJS process + Redis sidecar
- Frontend: Static build deployed to Cloudflare Pages or Netlify
- SQLite DB file mounted as a persistent volume — never baked into the Docker image
- Redis: Managed Redis (Upstash or Railway) or Docker sidecar

## Protected Paths

Agents must **never** modify files under these paths without explicit human approval:

- `api/src/watermark/` — watermark overlay logic
- `api/src/queue/` — job queue producers and consumers
- `api/src/ai-provider/` — Replicate/RunPod API client and configuration

## Known Footguns

- BullMQ jobs must be idempotent — failed jobs will be retried. Ensure video processing handlers are safe to re-run.
- `better-sqlite3` is synchronous — never call it inside an async event handler without wrapping in a worker or offloading to a dedicated DB service.
- SSE connections drop on Cloudflare (100s timeout) — implement client-side reconnection with exponential backoff.
- Free tier watermark must be applied server-side in `api/src/watermark/` before the output file is served — never rely on client-side overlay.
- Replicate webhooks and RunPod callbacks must be authenticated — verify signatures before processing job completion events.
- Video retention cron must run even if no jobs are active — schedule it independently of the queue.

## Commit & PR Conventions

- Commits: `type(scope): message` — types: `feat`, `fix`, `chore`, `test`, `docs`, `refactor`
- Scope examples: `upload`, `queue`, `billing`, `watermark`, `styles`
- PRs must reference a GitHub issue number
- PR titles must not exceed 72 characters
- Every PR touching `api/src/` must include at least one Jest test
- Every PR touching `app/src/` must include at least one Vitest test
