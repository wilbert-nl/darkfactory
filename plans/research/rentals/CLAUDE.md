# CLAUDE.md — rentals

## Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 + Quasar + TypeScript (`<script setup>`) |
| State | Pinia stores |
| Client storage | `sql.js` (web/PWA, WASM SQLite) |
| Backend | NestJS + better-sqlite3 |
| Database | SQLite (single file, WAL mode) |
| Payments | Stripe Payment Intents (capture-later deposit hold) |
| Identity | Stripe Identity (renter ID verification) |
| Auth | JWT (access + refresh tokens) |
| Package manager | pnpm |
| Testing | Vitest (frontend unit), Jest (backend unit), Playwright (E2E) |
| AI | Anthropic Claude API — NestJS backend only |
| Language | TypeScript strict throughout |

## Repo Layout

```
rentals/
├── api/                              # NestJS backend
│   ├── src/
│   │   ├── auth/                     # PROTECTED — JWT, guards, session management
│   │   ├── payments/
│   │   │   ├── deposit.service.ts    # PROTECTED — Stripe PI create, deposit hold
│   │   │   ├── capture.service.ts    # PROTECTED — deposit capture / cancel on return
│   │   │   └── payments.controller.ts
│   │   ├── verification/             # PROTECTED — Stripe Identity webhook, ID status
│   │   ├── listings/                 # Item listing CRUD, photo upload, category tags
│   │   ├── availability/             # Calendar conflict detection (SQLite atomic tx)
│   │   ├── bookings/                 # Booking lifecycle, late return fee calculation
│   │   ├── claims/                   # Damage claim workflow, photo evidence, escalation
│   │   ├── users/                    # Lister and renter profiles
│   │   ├── search/                   # SQLite FTS5 search, location filter
│   │   ├── notifications/            # Email notifications for booking status
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/                         # Jest backend tests
│   ├── data/                         # SQLite database file (gitignored)
│   ├── uploads/                      # Item photos (gitignored)
│   └── package.json
├── web/                              # Quasar SPA frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── BrowsePage.vue
│   │   │   ├── ListingDetailPage.vue
│   │   │   ├── CreateListingPage.vue
│   │   │   ├── BookingPage.vue
│   │   │   ├── ListerDashboardPage.vue
│   │   │   ├── RenterDashboardPage.vue
│   │   │   ├── DamageClaimPage.vue
│   │   │   └── VerificationPage.vue
│   │   ├── components/
│   │   │   ├── ItemCard.vue
│   │   │   ├── AvailabilityCalendar.vue
│   │   │   ├── BookingStatus.vue
│   │   │   ├── DepositBadge.vue
│   │   │   ├── DamageClaimForm.vue
│   │   │   └── PhotoUpload.vue
│   │   ├── stores/
│   │   │   ├── auth.store.ts
│   │   │   ├── listings.store.ts
│   │   │   ├── bookings.store.ts
│   │   │   └── claims.store.ts
│   │   ├── boot/
│   │   │   └── axios.ts
│   │   └── router/
│   │       └── index.ts
│   ├── test/                         # Vitest frontend tests
│   └── package.json
├── e2e/                              # Playwright E2E tests
│   ├── booking-flow.spec.ts
│   ├── deposit-hold.spec.ts
│   └── damage-claim.spec.ts
├── .env.example
└── pnpm-workspace.yaml
```

## Running the App

```bash
# Install all deps
pnpm install

# Start backend (port 3000)
cd api && pnpm dev

# Start frontend (port 9000)
cd web && pnpm dev

# Run both concurrently from root
pnpm dev
```

## Testing

```bash
# Frontend unit tests
cd web && pnpm test

# Backend unit tests
cd api && pnpm test

# E2E tests (requires both servers running)
pnpm e2e
```

## Lint / Format / Type Check

```bash
pnpm lint
pnpm format
cd web && pnpm type-check
cd api && pnpm type-check
```

## Code Conventions

- All Vue components use `<script setup lang="ts">`
- Pinia stores use `defineStore` with `setup()` syntax
- NestJS services injected via constructor DI
- DTOs use `class-validator`; all input validated at controller boundary
- No `any` type; use `unknown` and narrow explicitly
- Service fee always calculated in `bookings.service.ts` as `Math.round(rentalAmount * SERVICE_FEE_BPS / 10000)` — never inline elsewhere
- Late return fees calculated in `bookings.service.ts` server-side using hardcoded formula — never in frontend
- Amounts stored as INTEGER (cents) in SQLite; never REAL for money
- Deposit capture and cancel logic lives exclusively in `capture.service.ts`

## Storage Rules (SQLite)

- **Parameterized queries only** — NO string interpolation in SQL, ever
- Use `better-sqlite3` prepared statements: `db.prepare('SELECT ... WHERE id = ?').get(id)`
- Availability conflict detection uses `BEGIN EXCLUSIVE TRANSACTION` — no other booking may be inserted for the same item and overlapping dates concurrently
- Booking status transitions enforced via CHECK constraint: `pending → confirmed → active → returned → completed`
- Damage claims stored with `status` enum: `open | under_review | resolved`; agents may only set `open`; human admins set `resolved`
- `stripe_payment_intent_id` stored on each booking; referenced by capture and cancel operations
- WAL mode and foreign keys enabled on connection open
- Amounts stored as INTEGER (cents); never REAL

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_PATH` | Yes | Absolute path to SQLite `.db` file |
| `JWT_SECRET` | Yes | HS256 secret for access tokens |
| `JWT_REFRESH_SECRET` | Yes | HS256 secret for refresh tokens |
| `JWT_EXPIRES_IN` | Yes | Access token TTL (e.g. `15m`) |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `STRIPE_IDENTITY_WEBHOOK_SECRET` | Yes | Stripe Identity webhook signing secret |
| `SERVICE_FEE_BPS` | Yes | Must be `1000` (10%); validated at startup |
| `LATE_FEE_PER_DAY_CENTS` | Yes | Late return fee per day in cents (e.g. `2000` = $20); hardcoded in config |
| `UPLOAD_PATH` | Yes | Absolute path to item photo upload directory |
| `MAX_PHOTO_SIZE_MB` | Yes | Maximum photo upload size in MB (e.g. `10`) |
| `EMAIL_SMTP_HOST` | Yes | SMTP host for transactional email |
| `EMAIL_SMTP_PORT` | Yes | SMTP port |
| `EMAIL_FROM` | Yes | Sender address |
| `ANTHROPIC_API_KEY` | No | Claude API key (backend non-payment features only) |
| `PORT` | No | API server port (default: 3000) |
| `NODE_ENV` | No | `development` \| `production` |

## Deployment

- Backend: single NestJS process; SQLite file on persistent volume
- Frontend: Quasar SPA → `web/dist/spa/`, served via nginx or CDN
- Photos: stored at `UPLOAD_PATH` on persistent volume; back up separately
- Stripe webhooks: `POST /payments/webhook` and `POST /verification/webhook` in Stripe dashboard
- Startup validation: service asserts `SERVICE_FEE_BPS === 1000` — exits if wrong

## Protected Paths

These files and directories must never be modified by agents:

- `api/src/auth/` — JWT, role guards, session management
- `api/src/payments/deposit.service.ts` — Stripe Payment Intent creation and deposit hold
- `api/src/payments/capture.service.ts` — deposit capture and cancel on return confirmation
- `api/src/verification/` — Stripe Identity webhook, renter ID verification status

## Known Footguns

- **Availability race condition** — always use `BEGIN EXCLUSIVE TRANSACTION` for availability check + booking insert; a plain `SELECT` followed by `INSERT` creates a TOCTOU window
- **Stripe capture window** — Payment Intents with `capture_method: manual` expire after 7 days; booking confirmation must happen before expiry or the hold must be re-created
- **Stripe webhook idempotency** — check `event.id` in a processed events table before handling; duplicate delivery is expected
- **Late fee overflow** — calculate late fees as BigInt or integer cents; never floating point
- **ID verification timing** — Stripe Identity results arrive asynchronously; frontend must poll `/verification/status` rather than assume synchronous completion
- **sql.js WASM** — requires `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` headers
- **Photo upload size** — enforce `MAX_PHOTO_SIZE_MB` at the NestJS interceptor level; do not rely solely on nginx

## Commit & PR Conventions

- Commits: `feat(availability): add exclusive transaction for conflict detection` — conventional commits, scope required
- PRs: one feature or fix per PR; include test coverage; reference GitHub issue
- Branch naming: `feat/<issue>-<slug>`, `fix/<issue>-<slug>`
- Squash merge to main
