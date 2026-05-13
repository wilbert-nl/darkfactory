# CLAUDE.md — we-buy

## Stack

| Layer | Technology |
|---|---|
| Frontend framework | Vue 3 + Quasar (TypeScript, `<script setup>`) |
| State management | Pinia |
| Backend framework | NestJS (TypeScript strict) |
| Backend database | better-sqlite3 (SQLite) |
| AI grading | Anthropic Claude Haiku (vision + text) — server-side only |
| Image storage | Cloudflare R2 (presigned URLs) |
| Payments / escrow | Stripe Payment Intents |
| Location search | SQLite geospatial queries (lat/lng bounding box) |
| Package manager | pnpm |
| Unit tests | Vitest (frontend), Jest (backend) |
| E2E tests | Playwright |

## Repo Layout

```
we-buy/
├── app/                        # Quasar frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ListingCard.vue
│   │   │   ├── PhotoUploader.vue
│   │   │   ├── AiGradeDisplay.vue
│   │   │   ├── OfferThread.vue
│   │   │   ├── RatingSubmitForm.vue
│   │   │   ├── EscrowCheckout.vue
│   │   │   └── AiGradeDisclaimer.vue  # PROTECTED — never modify
│   │   ├── pages/
│   │   │   ├── BrowsePage.vue
│   │   │   ├── ListingDetailPage.vue
│   │   │   ├── CreateListingPage.vue
│   │   │   ├── MessagesPage.vue
│   │   │   ├── MyListingsPage.vue
│   │   │   └── CheckoutPage.vue
│   │   ├── stores/
│   │   │   ├── auth.store.ts
│   │   │   ├── listings.store.ts
│   │   │   ├── messages.store.ts
│   │   │   └── checkout.store.ts
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
│   │   ├── payments/           # PROTECTED PATH
│   │   │   ├── payments.module.ts
│   │   │   ├── escrow.service.ts      # PROTECTED FILE
│   │   │   ├── fee.service.ts         # PROTECTED FILE
│   │   │   ├── escrow.controller.ts
│   │   │   └── stripe.service.ts
│   │   ├── ai/                 # PROTECTED PATH
│   │   │   ├── ai.module.ts
│   │   │   ├── grading.service.ts     # Claude Haiku vision
│   │   │   └── pricing.service.ts     # Claude Haiku price suggestion
│   │   ├── listings/
│   │   │   ├── listings.module.ts
│   │   │   ├── listings.controller.ts
│   │   │   └── listings.service.ts    # Photo count enforcement
│   │   ├── messages/
│   │   │   ├── messages.module.ts
│   │   │   └── messages.service.ts    # Offer/counter-offer logic
│   │   ├── ratings/
│   │   │   ├── ratings.module.ts
│   │   │   ├── ratings.controller.ts
│   │   │   └── ratings.service.ts     # Immutable — no update/delete
│   │   ├── storage/
│   │   │   └── r2.service.ts
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

- `fee.service.ts` contains a single constant `PLATFORM_FEE_PERCENT = 3` — this is the only place the fee appears
- `escrow.service.ts` contains `ESCROW_AUTO_RELEASE_DAYS = 7` — hardcoded, not configurable
- Ratings service exposes `create()` only — no `update()` or `delete()` methods exist
- Photo count enforced in `listings.service.ts`: free = 5, Pro = 20 — `MAX_PHOTOS_FREE = 5` and `MAX_PHOTOS_PRO = 20` are constants
- AI grading in `grading.service.ts` uses Claude Haiku with vision; response is wrapped in a `GradeResult` type and never returned raw to client
- Location search uses bounding box: `SELECT * FROM listings WHERE lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?` with haversine ranking in application layer
- `AiGradeDisclaimer.vue` renders a hardcoded string — never fetched from API or config

## Storage Rules (SQLite)

- All queries use `db.prepare()` parameterized statements — never string concatenation
- `listings` table includes `photo_count` column updated on each photo upload — checked against tier limit in transaction
- `ratings` table has no `updated_at` column — insert only; no update path
- `escrow` table: `created_at`, `buyer_confirmed_at`, `auto_release_at`, `released_at`
- Geospatial: `lat REAL` and `lng REAL` columns on `listings` — no PostGIS (SQLite only)
- Schema migrations in `api/migrations/`

## Environment Variables

| Variable | Service | Description |
|---|---|---|
| `DATABASE_PATH` | API | Absolute path to SQLite file |
| `JWT_SECRET` | API | JWT signing secret |
| `ANTHROPIC_API_KEY` | API | Claude Haiku for grading and price suggestions |
| `R2_ACCOUNT_ID` | API | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | API | R2 access key |
| `R2_SECRET_ACCESS_KEY` | API | R2 secret key |
| `R2_BUCKET_NAME` | API | R2 bucket name |
| `STRIPE_SECRET_KEY` | API | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | API | Stripe webhook signing secret |
| `VITE_API_BASE_URL` | App | Backend URL |

No Anthropic, R2, or Stripe credentials appear in the frontend `.env`.

## Deployment

- NestJS on VPS or Docker; SQLite on persistent volume
- Escrow auto-release cron via `@nestjs/schedule` — runs daily
- Frontend SPA on Cloudflare Pages

## Protected Paths

- `api/src/auth/` — JWT auth and guards
- `api/src/payments/escrow.service.ts` — escrow release logic and auto-release constant
- `api/src/payments/fee.service.ts` — platform fee constant
- `api/src/ai/` — Claude Haiku grading and pricing integrations

## Known Footguns

- Stripe `capture_method: 'manual'` required for escrow — do not use auto-capture Payment Intents
- Escrow release (capture) must be idempotent — check `released_at IS NULL` before calling `stripe.paymentIntents.capture()`
- Claude Haiku vision accepts base64 image data — resize photos to max 1024px before encoding to stay within token limits
- SQLite bounding box queries return false positives near poles — acceptable for MVP given local classifieds use case
- Photo upload to R2 must be atomic with the `photo_count` increment — if R2 upload fails, do not increment the count

## Commit & PR Conventions

- Commits: `feat(listings): add AI condition grading on photo upload`
- Scopes: `auth`, `payments`, `escrow`, `ai`, `listings`, `messages`, `ratings`, `storage`, `ui`, `e2e`
- PRs touching protected paths require `needs-human` label
