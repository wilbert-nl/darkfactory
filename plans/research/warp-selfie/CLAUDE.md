# CLAUDE.md — warp-selfie

## Stack

| Layer | Technology |
|---|---|
| Frontend framework | Vue 3 + Quasar (TypeScript, `<script setup>`) |
| State management | Pinia |
| Backend framework | NestJS (TypeScript strict) |
| Backend database | better-sqlite3 (SQLite) |
| AI compositing | Replicate API or Stability AI API — server-side only |
| Image storage | Cloudflare R2 (presigned URLs) |
| Watermarking | Sharp (server-side image processing) |
| Job queue | NestJS `@nestjs/bull` + in-process queue (SQLite-backed) |
| Payments | Stripe |
| Package manager | pnpm |
| Unit tests | Vitest (frontend), Jest (backend) |
| E2E tests | Playwright |

## Repo Layout

```
warp-selfie/
├── app/                        # Quasar frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── PortraitUploader.vue
│   │   │   ├── DestinationPicker.vue
│   │   │   ├── CompositeJobCard.vue
│   │   │   ├── BatchGenerator.vue
│   │   │   └── WatermarkNotice.vue
│   │   ├── pages/
│   │   │   ├── StudioPage.vue
│   │   │   ├── GalleryPage.vue
│   │   │   ├── DestinationsPage.vue
│   │   │   └── SettingsPage.vue
│   │   ├── stores/
│   │   │   ├── auth.store.ts
│   │   │   ├── jobs.store.ts          # Polls job status
│   │   │   └── gallery.store.ts
│   │   ├── composables/
│   │   │   └── useJobPoller.ts        # Client-side polling loop
│   │   ├── services/
│   │   │   └── api.service.ts
│   │   └── router/
│   │       └── index.ts
│   ├── quasar.config.ts
│   └── package.json
├── api/                        # NestJS backend
│   ├── src/
│   │   ├── auth/               # PROTECTED PATH
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── jwt.strategy.ts
│   │   ├── watermark/          # PROTECTED PATH
│   │   │   ├── watermark.module.ts
│   │   │   └── watermark.service.ts   # Server-only Sharp watermark
│   │   ├── ai-provider/        # PROTECTED PATH
│   │   │   ├── ai-provider.module.ts
│   │   │   ├── replicate.service.ts
│   │   │   └── stability.service.ts
│   │   ├── storage/            # PROTECTED PATH
│   │   │   ├── storage.module.ts
│   │   │   └── r2.service.ts          # Cloudflare R2 operations
│   │   ├── jobs/
│   │   │   ├── jobs.module.ts
│   │   │   ├── jobs.controller.ts     # Submit + poll endpoints
│   │   │   ├── jobs.service.ts
│   │   │   └── composite.processor.ts
│   │   ├── billing/
│   │   │   ├── billing.module.ts
│   │   │   └── stripe.service.ts
│   │   ├── database/
│   │   │   └── database.service.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── migrations/
│   ├── jest.config.ts
│   └── package.json
├── e2e/
│   └── tests/
├── .env.example
└── pnpm-workspace.yaml
```

## Running the App

```bash
pnpm install
cd app && pnpm dev
cd api && pnpm dev
```

## Testing

```bash
cd app && pnpm test
cd api && pnpm test
pnpm e2e
```

## Lint / Format / Type Check

```bash
pnpm -r lint && pnpm -r typecheck && pnpm -r format
```

## Code Conventions

- Job flow: client POSTs to `/jobs` → receives `jobId` → polls `/jobs/:id/status` every 3s → when `status === 'done'` fetches presigned URL
- Watermark is applied in `watermark.service.ts` after compositing and before upload to R2 — the R2 key for free-tier outputs always has `_wm` suffix; client receives this URL directly
- Free tier daily cap check: `SELECT COUNT(*) FROM jobs WHERE user_id = ? AND created_at >= date('now') AND status != 'failed'` — checked in transaction before job creation
- `FREE_DAILY_CAP = 3` is a constant in `jobs.service.ts` — the only place this value appears
- `FREE_RETENTION_HOURS = 24` and `PRO_RETENTION_DAYS = 30` are constants in `storage/r2.service.ts`
- AI provider credentials are never logged — use `[REDACTED]` in any debug output that touches request headers
- AI API calls must include `no_store: true` or equivalent parameter to opt out of training — verify per-provider documentation

## Storage Rules (SQLite)

- All queries use `db.prepare()` parameterized statements
- `jobs` table: `id`, `user_id`, `status`, `tier`, `r2_key`, `created_at`, `expires_at`
- `expires_at` set at job creation: `NOW + 24h` (free) or `NOW + 30d` (Pro)
- Daily cleanup cron deletes R2 objects and job rows where `expires_at < NOW`
- Schema migrations in `api/migrations/`

## Environment Variables

| Variable | Service | Description |
|---|---|---|
| `DATABASE_PATH` | API | Absolute path to SQLite file |
| `JWT_SECRET` | API | JWT signing secret |
| `REPLICATE_API_TOKEN` | API | Replicate AI API token |
| `STABILITY_API_KEY` | API | Stability AI API key (alternative) |
| `R2_ACCOUNT_ID` | API | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | API | R2 access key |
| `R2_SECRET_ACCESS_KEY` | API | R2 secret key |
| `R2_BUCKET_NAME` | API | R2 bucket name |
| `STRIPE_SECRET_KEY` | API | Stripe secret |
| `STRIPE_WEBHOOK_SECRET` | API | Stripe webhook secret |
| `VITE_API_BASE_URL` | App | Backend URL |

No AI provider keys or R2 credentials appear in the frontend `.env`.

## Deployment

- NestJS on VPS or Docker; SQLite on persistent volume
- R2 cleanup cron runs inside NestJS via `@nestjs/schedule`
- Frontend SPA on Cloudflare Pages

## Protected Paths

- `api/src/auth/` — JWT auth and guards
- `api/src/watermark/` — server-side watermark application
- `api/src/ai-provider/` — Replicate and Stability AI integrations
- `api/src/storage/` — R2 presigned URL generation and object lifecycle

## Known Footguns

- Replicate predictions are async — poll the prediction status URL, do not assume synchronous completion
- Sharp must be installed with the correct platform binary for Docker — use `sharp --platform linux` in Dockerfile
- R2 presigned URLs expire — generate them on-demand when client requests, not at job creation time
- Free-tier cap check and job insert must be in a single SQLite transaction to prevent race conditions from concurrent requests

## Commit & PR Conventions

- Commits: `feat(jobs): add batch generation with aspect ratio selection`
- Scopes: `auth`, `watermark`, `ai-provider`, `storage`, `jobs`, `billing`, `ui`, `e2e`
- PRs touching protected paths require `needs-human` label
