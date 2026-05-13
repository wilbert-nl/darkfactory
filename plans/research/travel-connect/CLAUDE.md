# CLAUDE.md — travel-connect

## Stack

| Layer | Technology |
|---|---|
| Frontend framework | Vue 3 + Quasar (TypeScript, `<script setup>`) |
| State management | Pinia |
| Backend framework | NestJS (TypeScript strict) |
| Backend database | better-sqlite3 (SQLite) |
| Payments / escrow | Stripe Payment Intents |
| Package manager | pnpm |
| Unit tests | Vitest (frontend), Jest (backend) |
| E2E tests | Playwright |

## Repo Layout

```
travel-connect/
├── app/                        # Quasar frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── TripRequestForm.vue
│   │   │   ├── AgencyCard.vue
│   │   │   ├── ProposalComparison.vue
│   │   │   ├── MessageThread.vue
│   │   │   ├── IataBadge.vue
│   │   │   └── BookingCheckout.vue
│   │   ├── pages/
│   │   │   ├── HomePage.vue
│   │   │   ├── PostTripPage.vue
│   │   │   ├── RequestFeedPage.vue    # Agency view
│   │   │   ├── ProposalsPage.vue      # Traveler comparison view
│   │   │   ├── MessagesPage.vue
│   │   │   ├── AgencyProfilePage.vue
│   │   │   └── BookingPage.vue
│   │   ├── stores/
│   │   │   ├── auth.store.ts
│   │   │   ├── requests.store.ts
│   │   │   ├── proposals.store.ts
│   │   │   └── messages.store.ts
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
│   │   │   ├── escrow.controller.ts
│   │   │   └── stripe.service.ts
│   │   ├── verification/       # PROTECTED PATH
│   │   │   ├── verification.module.ts
│   │   │   ├── verification.controller.ts
│   │   │   └── verification.service.ts # Human-only IATA badge grant
│   │   ├── requests/
│   │   │   ├── requests.module.ts
│   │   │   ├── requests.controller.ts
│   │   │   └── requests.service.ts
│   │   ├── proposals/
│   │   │   ├── proposals.module.ts
│   │   │   ├── proposals.controller.ts
│   │   │   └── proposals.service.ts   # Enforces 3/mo free limit
│   │   ├── messages/
│   │   │   ├── messages.module.ts
│   │   │   ├── messages.controller.ts
│   │   │   └── messages.service.ts
│   │   ├── agencies/
│   │   │   └── agencies.service.ts
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

- Two user roles: `traveler` and `agency` — stored in JWT payload, enforced via NestJS guards on every protected route
- Agency proposal count is checked and incremented in `proposals.service.ts` — the check and insert are wrapped in a SQLite transaction to prevent race conditions
- `escrow.service.ts` contains a single source-of-truth constant `PLATFORM_FEE_PERCENT = 8` — this is the only place the fee appears in the codebase
- Traveler full name and contact are never included in the proposal response DTO for unconfirmed bookings — serialization enforced in the DTO, not in service logic
- IATA badge grant in `verification.service.ts` requires a human-supplied admin token — no automated code path grants it
- Escrow auto-release cron runs daily; `ESCROW_AUTO_RELEASE_DAYS = 14` is a hardcoded constant in `escrow.service.ts`
- Messages are async (polling every 30s) — no WebSocket in MVP
- Account deletion triggers a cascade that nullifies traveler PII columns within 30 days via a scheduled job

## Storage Rules (SQLite)

- All queries use `db.prepare()` parameterized statements
- Proposal count per agency per month: `SELECT COUNT(*) FROM proposals WHERE agency_id = ? AND created_at >= ?` — checked in transaction
- Escrow records include `created_at`, `confirmed_at`, `released_at`, and `auto_release_at` columns
- Schema migrations in `api/migrations/`

## Environment Variables

| Variable | Service | Description |
|---|---|---|
| `DATABASE_PATH` | API | Absolute path to SQLite file |
| `JWT_SECRET` | API | JWT signing secret |
| `STRIPE_SECRET_KEY` | API | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | API | Stripe webhook signing secret |
| `ADMIN_TOKEN` | API | Static token for IATA badge grant endpoint (human use only) |
| `VITE_API_BASE_URL` | App | Backend URL |

## Deployment

- NestJS on VPS or Docker; SQLite on persistent volume
- Daily cron for escrow auto-release runs inside the NestJS process via `@nestjs/schedule`
- Frontend SPA on Cloudflare Pages or similar

## Protected Paths

- `api/src/auth/` — JWT auth and guards
- `api/src/payments/escrow.service.ts` — fee constant and escrow release logic
- `api/src/verification/` — IATA badge grant (human-only)

## Known Footguns

- SQLite does not enforce row-level locking — wrap proposal count + insert in a `BEGIN IMMEDIATE` transaction to prevent double-submission race condition
- Stripe Payment Intents must be created with `capture_method: 'manual'` for escrow — do not auto-capture
- Escrow release (capture) must be idempotent — check `released_at IS NULL` before calling `stripe.paymentIntents.capture()`
- Account deletion cascade must respect the 30-day schedule — do not delete immediately as Stripe may need to process chargebacks

## Commit & PR Conventions

- Commits: `feat(proposals): enforce 3/mo free agency limit server-side`
- Scopes: `auth`, `payments`, `escrow`, `verification`, `requests`, `proposals`, `messages`, `ui`, `e2e`
- PRs touching protected paths require `needs-human` label
