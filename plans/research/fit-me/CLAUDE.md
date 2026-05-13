# CLAUDE.md — fit-me

## Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 + Quasar (web only) + TypeScript strict |
| State | Pinia stores |
| Backend | NestJS + better-sqlite3 |
| Database | SQLite (single file, WAL mode) |
| Auth | JWT + refresh tokens |
| AI / Image processing | Replicate API or Hugging Face Inference API (external, server-side only) |
| File storage | Cloudflare R2 (presigned upload/download URLs) |
| Job queue | NestJS BullMQ-style queue (in-process, SQLite-backed) |
| Payments | Stripe (subscriptions) |
| Package manager | pnpm |
| Unit tests | Vitest (frontend), Jest (backend) |
| E2E tests | Playwright |
| Lint/Format | ESLint + Prettier |

## Repo Layout

```
fit-me/
├── app/                            # Quasar web app
│   ├── src/
│   │   ├── pages/
│   │   │   ├── TryOnPage.vue          # upload selfie + clothing image
│   │   │   ├── ResultPage.vue         # polling + composite display
│   │   │   ├── WardrobePage.vue       # saved try-ons gallery (Pro)
│   │   │   ├── SizePage.vue           # size guidance output
│   │   │   └── AuthPage.vue
│   │   ├── components/
│   │   │   ├── ImageUploader.vue
│   │   │   ├── PollingSpinner.vue
│   │   │   ├── WatermarkedImage.vue   # always renders watermark on free tier
│   │   │   └── AgeGate.vue           # shown at signup — must not be removable
│   │   ├── stores/
│   │   │   ├── auth.store.ts
│   │   │   ├── tryon.store.ts
│   │   │   └── wardrobe.store.ts
│   │   ├── composables/
│   │   │   └── useJobPoller.ts        # polls /api/jobs/:id for completion
│   │   └── router/
│   └── quasar.config.ts
├── api/                            # NestJS backend
│   ├── src/
│   │   ├── auth/                   # PROTECTED — JWT, age gate enforcement
│   │   ├── ai-provider/            # PROTECTED — Replicate/HuggingFace client
│   │   ├── watermark/              # PROTECTED — watermark application logic
│   │   ├── storage/                # PROTECTED — R2 presigned URL generation, cleanup scheduler
│   │   ├── jobs/                   # try-on job lifecycle (create, queue, poll, complete)
│   │   ├── size/                   # size guidance from body proportion data
│   │   ├── wardrobe/               # Pro wardrobe gallery management
│   │   ├── billing/                # Stripe subscriptions + quota enforcement
│   │   ├── quota/                  # free tier daily cap (3/day) tracking
│   │   └── database/               # better-sqlite3 setup, migrations
│   ├── test/
│   └── jest.config.ts
├── shared/                         # Shared TypeScript types
└── pnpm-workspace.yaml
```

## Running the App

```bash
# Install
pnpm install

# Backend (dev)
cd api && pnpm dev

# Frontend (dev)
cd app && pnpm dev

# Full stack
pnpm dev
```

## Testing

```bash
# Frontend unit tests
cd app && pnpm test

# Backend unit + integration tests
cd api && pnpm test

# E2E
pnpm test:e2e
```

## Lint / Format / Type Check

```bash
pnpm lint
pnpm format
pnpm typecheck
```

All three must pass before any PR is merged.

## Code Conventions

- All Vue components use `<script setup lang="ts">` — no Options API
- Pinia stores use `defineStore` with composition-style setup function
- `AgeGate.vue` must be rendered unconditionally on the signup route — no `v-if` bypass
- Watermark is applied server-side in `api/src/watermark/` before the signed download URL is returned to free-tier users; the frontend must not apply or remove watermarks
- All AI provider calls go through `api/src/ai-provider/` — no Replicate or HuggingFace SDK imports anywhere else
- Free tier quota is checked in `api/src/quota/` before any job is created — the check is a guard, not an afterthought
- Job result polling: frontend calls `GET /api/jobs/:id` on an interval via `useJobPoller.ts` — no WebSocket
- R2 presigned upload URLs expire in 10 minutes; download URLs expire in 60 minutes for Pro, 15 minutes for free

## Storage Rules (SQLite)

- All queries use `prepare()` with bound parameters — no string interpolation
- `jobs` table tracks: `id`, `user_id`, `status`, `selfie_r2_key`, `clothing_r2_key`, `result_r2_key`, `watermarked_r2_key`, `created_at`, `expires_at`
- `quota_usage` table tracks daily try-on count per user; reset daily via a scheduled task
- `wardrobe_items` table is only populated for Pro users
- WAL mode enabled on startup: `PRAGMA journal_mode=WAL`
- A cleanup scheduler runs nightly: deletes free-user images older than 24h, Pro images older than 30 days, and removes corresponding R2 objects

## Environment Variables

| Variable | Location | Description |
|---|---|---|
| `JWT_SECRET` | api | JWT signing secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | api | Refresh token signing secret |
| `REPLICATE_API_TOKEN` | api | Replicate API token (primary AI provider) |
| `HUGGINGFACE_API_KEY` | api | HuggingFace Inference API key (fallback) |
| `R2_ACCESS_KEY_ID` | api | Cloudflare R2 access key |
| `R2_SECRET_ACCESS_KEY` | api | Cloudflare R2 secret |
| `R2_BUCKET_NAME` | api | R2 bucket name |
| `R2_ENDPOINT` | api | R2 S3-compatible endpoint URL |
| `STRIPE_SECRET_KEY` | api | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | api | Stripe webhook signing secret |
| `DATABASE_PATH` | api | Absolute path to SQLite file |
| `FREE_TIER_DAILY_LIMIT` | api | Hard cap per day for free users — must be 3 |
| `FREE_IMAGE_RETENTION_HOURS` | api | Retention for free-tier images — must be 24 |
| `PRO_IMAGE_RETENTION_DAYS` | api | Retention for Pro images — must be 30 |

## Deployment

- Backend: single Node.js process (PM2 or systemd), SQLite on persistent volume
- Frontend: `quasar build` → static files to CDN or Nginx
- Cleanup scheduler must run in the same process as the backend (not a separate cron job that could race)
- Run `pnpm migrate` before each deploy

## Protected Paths

The following paths require a human-authored GitHub issue and explicit human approval before any agent modifies them:

- `api/src/auth/` — JWT issuance, age gate enforcement
- `api/src/watermark/` — watermark application logic
- `api/src/ai-provider/` — Replicate/HuggingFace client and credentials
- `api/src/storage/` — R2 presigned URL generation and image cleanup scheduler

## Known Footguns

- Replicate predictions are async — the API returns a prediction ID immediately; poll `GET /predictions/:id` for status. Do not block the NestJS request thread.
- R2 object keys must include the user ID as a path prefix to simplify per-user cleanup queries.
- Free-tier quota is per calendar day in UTC — reset at midnight UTC, not rolling 24h.
- Watermarked and non-watermarked results are separate R2 objects; never return the non-watermarked key to a free-tier user.
- Age gate is enforced at account creation; do not re-check on every request, but the account must have `age_verified=true` before any try-on job is created.

## Commit & PR Conventions

- Branch: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`
- Commit: `type(scope): description` (Conventional Commits)
- PRs must reference the GitHub issue number
- PRs must not modify protected paths unless the issue is labeled `human-approved`
