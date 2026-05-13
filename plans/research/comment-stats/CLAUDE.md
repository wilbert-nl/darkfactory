# CLAUDE.md — comment-stats

## Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 + Quasar (web only) + TypeScript strict |
| State | Pinia stores |
| Backend | NestJS + better-sqlite3 |
| Database | SQLite (single file, WAL mode) |
| Auth | YouTube OAuth 2.0 (Google Identity) + JWT session |
| External APIs | YouTube Data API v3, Anthropic Claude Haiku |
| Payments | Stripe (subscriptions) |
| Package manager | pnpm |
| Unit tests | Vitest (frontend), Jest (backend) |
| E2E tests | Playwright |
| Lint/Format | ESLint + Prettier |

## Repo Layout

```
comment-stats/
├── app/                        # Quasar web app
│   ├── src/
│   │   ├── pages/
│   │   │   ├── DashboardPage.vue
│   │   │   ├── VideoPage.vue      # per-video sentiment + keywords
│   │   │   └── ModerationPage.vue # toxic/spam queue
│   │   ├── components/
│   │   │   ├── SentimentChart.vue
│   │   │   ├── KeywordCloud.vue
│   │   │   └── QuestionList.vue
│   │   ├── stores/
│   │   │   ├── auth.store.ts
│   │   │   ├── channel.store.ts
│   │   │   └── analysis.store.ts
│   │   ├── composables/
│   │   └── router/
│   └── quasar.config.ts
├── api/                        # NestJS backend
│   ├── src/
│   │   ├── auth/               # PROTECTED — YouTube OAuth + JWT
│   │   ├── youtube/            # PROTECTED — YouTube API client + quota tracking
│   │   ├── analysis/           # sentiment, keywords, question detection
│   │   ├── moderation/         # toxic/spam flagging + queue
│   │   ├── billing/            # Stripe subscriptions
│   │   ├── export/             # CSV export (Pro)
│   │   ├── cache/              # SQLite cache layer
│   │   └── database/           # better-sqlite3 setup, migrations
│   ├── test/
│   └── jest.config.ts
├── shared/                     # Shared TypeScript types
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

# Full stack (from root)
pnpm dev
```

## Testing

```bash
# Frontend unit tests
cd app && pnpm test

# Backend unit + integration tests
cd api && pnpm test

# E2E (requires both servers running)
pnpm test:e2e
```

## Lint / Format / Type Check

```bash
pnpm lint          # ESLint across all packages
pnpm format        # Prettier across all packages
pnpm typecheck     # tsc --noEmit across all packages
```

All three must pass before any PR is merged.

## Code Conventions

- All Vue components use `<script setup lang="ts">` — no Options API
- Pinia stores use `defineStore` with the composition-style setup function
- All backend services are injected via NestJS DI — no `new Service()` in controllers
- API responses follow `{ data, meta, error }` envelope
- Dates and times are always UTC ISO 8601 strings at the API boundary
- YouTube API call wrappers live in `api/src/youtube/` — no other module calls the YouTube SDK directly
- Claude API calls live in `api/src/analysis/` — Haiku model only, never in frontend

## Storage Rules (SQLite)

- All database queries use parameterized statements via better-sqlite3's `prepare()` — string interpolation into SQL is prohibited
- Schema migrations are versioned files in `api/src/database/migrations/` — no ad hoc `ALTER TABLE` in service code
- The YouTube quota counter is a row in the `quota_usage` table, updated atomically using SQLite transactions
- Sensitive values (OAuth tokens, API keys) are stored encrypted using AES-256-GCM; the encryption key comes from `ENCRYPTION_KEY` env var
- WAL mode is enabled on startup: `PRAGMA journal_mode=WAL`

## Environment Variables

| Variable | Location | Description |
|---|---|---|
| `YOUTUBE_CLIENT_ID` | api | YouTube OAuth 2.0 client ID |
| `YOUTUBE_CLIENT_SECRET` | api | YouTube OAuth 2.0 client secret |
| `YOUTUBE_API_KEY` | api | YouTube Data API v3 key (fallback, non-OAuth) |
| `ANTHROPIC_API_KEY` | api | Claude Haiku API key |
| `ENCRYPTION_KEY` | api | AES-256-GCM key for token encryption (32 bytes hex) |
| `STRIPE_SECRET_KEY` | api | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | api | Stripe webhook signing secret |
| `DATABASE_PATH` | api | Absolute path to SQLite file |
| `JWT_SECRET` | api | JWT signing secret (min 32 chars) |
| `YOUTUBE_QUOTA_DAILY_LIMIT` | api | Soft cap (default: 9500, hard limit 10000) |

No environment variables belong in `app/` — the frontend never holds secrets.

## Deployment

- Backend: single Node.js process (PM2 or systemd), SQLite file on persistent volume
- Frontend: static build (`quasar build`), served from CDN or Nginx
- SQLite WAL file and `-shm`/`-wal` sidecar files must be on the same volume
- Run `pnpm migrate` before each deploy to apply pending migrations

## Protected Paths

The following paths require a human-authored GitHub issue and explicit human approval before any agent modifies them:

- `api/src/youtube/` — YouTube API client; quota enforcement logic lives here
- `api/src/auth/` — OAuth flow, token encryption, JWT issuance

## Known Footguns

- YouTube API quota units: `commentThreads.list` costs 1 unit per call but returns max 100 comments per page. Paginating a 10,000-comment video costs 100 units. Always check the daily counter before paginating.
- `better-sqlite3` is synchronous — never call it from an async event loop without wrapping in a worker or using NestJS's queue pattern for heavy batch jobs.
- Claude Haiku prompt must be tested for token length before sending — a video with 500 comments must be chunked; the $0.05 cap enforces this.
- YouTube OAuth refresh tokens expire if the app is in "Testing" mode and the token is older than 7 days.

## Commit & PR Conventions

- Branch: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`
- Commit: `type(scope): description` (Conventional Commits)
- PRs must reference the GitHub issue number
- PRs must not modify protected paths unless the issue is explicitly labeled `human-approved`
