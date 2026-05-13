# CLAUDE.md — crowd-shot

## Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 + Quasar + Capacitor (iOS/Android/web) + TypeScript strict |
| State | Pinia stores |
| Backend | NestJS + better-sqlite3 |
| Database | SQLite with rtree extension (geospatial queries) |
| Auth | JWT + refresh tokens |
| Real-time | NestJS + SQLite polling (geo-match queries) |
| Push notifications | @capacitor/push-notifications (FCM/APNs) |
| File storage | Cloudflare R2 (presigned upload/download URLs) |
| Payments | Stripe Connect (escrow) |
| Package manager | pnpm |
| Unit tests | Vitest (frontend), Jest (backend) |
| E2E tests | Playwright |
| Lint/Format | ESLint + Prettier |

## Repo Layout

```
crowd-shot/
├── app/                          # Quasar + Capacitor app
│   ├── src/
│   │   ├── pages/
│   │   │   ├── MapPage.vue          # request creation with map pin
│   │   │   ├── JobFeedPage.vue      # photographer nearby jobs
│   │   │   ├── SubmissionPage.vue   # camera + upload
│   │   │   ├── ApprovalPage.vue     # requester review queue
│   │   │   └── DisputePage.vue      # dispute initiation
│   │   ├── components/
│   │   │   ├── MapPin.vue
│   │   │   ├── JobCard.vue
│   │   │   └── MediaPreview.vue
│   │   ├── stores/
│   │   │   ├── auth.store.ts
│   │   │   ├── jobs.store.ts
│   │   │   └── notifications.store.ts
│   │   ├── composables/
│   │   │   └── useGeolocation.ts
│   │   └── router/
│   ├── android/
│   ├── ios/
│   └── quasar.config.ts
├── api/                          # NestJS backend
│   ├── src/
│   │   ├── auth/                 # PROTECTED — JWT, refresh tokens
│   │   ├── geo/                  # PROTECTED — rtree queries, GPS verification
│   │   ├── payments/
│   │   │   ├── escrow.service.ts # PROTECTED — Stripe Connect escrow logic
│   │   │   └── stripe.module.ts
│   │   ├── moderation/           # PROTECTED — content review queue
│   │   ├── jobs/                 # job lifecycle (create, submit, approve, reject)
│   │   ├── notifications/        # FCM/APNs push dispatch
│   │   ├── storage/              # R2 presigned URL generation
│   │   ├── disputes/             # dispute workflow (human-reviewed)
│   │   ├── billing/              # Pro subscription management
│   │   └── database/             # better-sqlite3 setup, migrations, rtree init
│   ├── test/
│   └── jest.config.ts
├── shared/                       # Shared TypeScript types
└── pnpm-workspace.yaml
```

## Running the App

```bash
# Install
pnpm install

# Backend (dev)
cd api && pnpm dev

# Frontend web (dev)
cd app && pnpm dev

# iOS (requires Xcode)
cd app && pnpm cap run ios

# Android (requires Android Studio)
cd app && pnpm cap run android
```

## Testing

```bash
# Frontend unit tests
cd app && pnpm test

# Backend unit + integration tests
cd api && pnpm test

# E2E (web, requires both servers running)
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
- Geolocation handling is isolated in `app/src/composables/useGeolocation.ts` — no raw `navigator.geolocation` calls in components
- GPS verification always happens in `api/src/geo/` — client-side coordinates are inputs only, never authoritative
- All Stripe interactions go through `api/src/payments/` — no Stripe SDK in frontend
- R2 presigned URL generation happens in `api/src/storage/` — frontend receives URL, never credentials
- Platform fee constant: `PLATFORM_FEE_PERCENT = 20` in `api/src/payments/constants.ts`; never duplicated elsewhere
- Max reward constant: `MAX_REWARD_AMOUNT_USD = 500` in `api/src/jobs/constants.ts`

## Storage Rules (SQLite)

- All queries use parameterized statements via better-sqlite3's `prepare()` — no string interpolation
- rtree virtual table (`jobs_geo`) indexes job latitude/longitude for proximity queries
- Schema migrations are versioned files in `api/src/database/migrations/`
- WAL mode enabled on startup: `PRAGMA journal_mode=WAL`
- GPS coordinates stored as `REAL` (lat/lng), never as text
- Escrow state transitions are recorded in an `escrow_events` audit table

## Environment Variables

| Variable | Location | Description |
|---|---|---|
| `JWT_SECRET` | api | JWT signing secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | api | Refresh token signing secret |
| `STRIPE_SECRET_KEY` | api | Stripe secret key |
| `STRIPE_CONNECT_SECRET` | api | Stripe Connect secret for payouts |
| `STRIPE_WEBHOOK_SECRET` | api | Stripe webhook signing secret |
| `R2_ACCESS_KEY_ID` | api | Cloudflare R2 access key |
| `R2_SECRET_ACCESS_KEY` | api | Cloudflare R2 secret |
| `R2_BUCKET_NAME` | api | R2 bucket name |
| `R2_ENDPOINT` | api | R2 S3-compatible endpoint URL |
| `FCM_SERVER_KEY` | api | Firebase Cloud Messaging server key |
| `APNS_KEY_ID` | api | APNs key ID |
| `APNS_TEAM_ID` | api | APNs team ID |
| `APNS_PRIVATE_KEY` | api | APNs private key (PEM) |
| `DATABASE_PATH` | api | Absolute path to SQLite file |
| `GEO_RADIUS_DEFAULT_KM` | api | Default photographer alert radius (e.g. 5) |

## Deployment

- Backend: single Node.js process (PM2 or systemd), SQLite on persistent volume
- Frontend: `quasar build` + `cap copy` → native builds submitted via Xcode / Android Studio; web build to CDN
- SQLite WAL sidecar files must be on the same volume as the database file
- Run `pnpm migrate` before each deploy

## Protected Paths

The following paths require a human-authored GitHub issue and explicit human approval before any agent modifies them:

- `api/src/auth/` — JWT issuance and refresh token logic
- `api/src/payments/escrow.service.ts` — escrow hold, release, refund logic
- `api/src/geo/` — GPS verification and rtree proximity queries
- `api/src/moderation/` — content moderation queue and delivery gate

## Known Footguns

- SQLite rtree stores bounding boxes, not points — store a job's location as `minLat=maxLat=lat, minLng=maxLng=lng` for point indexing.
- Stripe Connect requires photographers to complete onboarding (identity verification) before receiving payouts — check `charges_enabled` on their account before allowing submissions.
- FCM/APNs push to offline devices: messages are queued by the push service but may be delayed. Do not assume delivery.
- R2 presigned URLs expire — set expiry to 15 minutes for uploads; do not reuse URLs.
- GPS drift: mobile devices can return coordinates with >100m error. Server-side verification checks timestamp plausibility, not exact coordinates.

## Commit & PR Conventions

- Branch: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`
- Commit: `type(scope): description` (Conventional Commits)
- PRs must reference the GitHub issue number
- PRs must not modify protected paths unless the issue is labeled `human-approved`
