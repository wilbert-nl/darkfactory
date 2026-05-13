# CLAUDE.md — movie-critic

## Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 + Quasar + TypeScript (`<script setup>`) |
| State | Pinia stores |
| Client storage | `sql.js` (web/PWA, WASM SQLite) |
| Backend | NestJS + better-sqlite3 |
| Database | SQLite (single file, WAL mode) |
| Payments | Stripe Connect (marketplace escrow, 15% commission) |
| Screener URLs | Time-limited signed URLs generated server-side (24h expiry) |
| Auth | JWT (access + refresh tokens) |
| Package manager | pnpm |
| Testing | Vitest (frontend unit), Jest (backend unit), Playwright (E2E) |
| AI | Anthropic Claude API — NestJS backend only (non-review tasks) |
| Language | TypeScript strict throughout |

## Repo Layout

```
movie-critic/
├── api/                            # NestJS backend
│   ├── src/
│   │   ├── auth/                   # PROTECTED — JWT, guards, role management
│   │   ├── payments/
│   │   │   ├── commission.service.ts  # PROTECTED — 15% commission calculation
│   │   │   ├── escrow.service.ts      # Stripe Connect escrow, capture, transfer
│   │   │   └── payments.controller.ts
│   │   ├── screener/               # PROTECTED — signed URL generation (24h), delivery
│   │   ├── review/
│   │   │   ├── publish.service.ts  # PROTECTED — review publish trigger logic
│   │   │   ├── review.service.ts   # Review CRUD, status transitions
│   │   │   └── review.controller.ts
│   │   ├── critics/                # Critic profiles, genre specs, rate setting
│   │   ├── filmmakers/             # Filmmaker profiles, brief submission
│   │   ├── bookings/               # Booking lifecycle, auto-release timer
│   │   ├── admin/                  # Human admin: critic approval, moderation
│   │   ├── users/                  # User accounts, roles
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/                       # Jest backend tests
│   ├── data/                       # SQLite database file (gitignored)
│   └── package.json
├── web/                            # Quasar SPA frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── CriticsPage.vue
│   │   │   ├── CriticProfilePage.vue
│   │   │   ├── SubmitBriefPage.vue
│   │   │   ├── BookingPage.vue
│   │   │   ├── CriticWorkspacePage.vue
│   │   │   ├── FilmmakerDashboardPage.vue
│   │   │   └── ReviewPublicPage.vue
│   │   ├── components/
│   │   │   ├── CriticCard.vue
│   │   │   ├── BriefForm.vue
│   │   │   ├── BookingStatus.vue
│   │   │   ├── ReviewCard.vue
│   │   │   └── EscrowBadge.vue
│   │   ├── stores/
│   │   │   ├── auth.store.ts
│   │   │   ├── critics.store.ts
│   │   │   ├── bookings.store.ts
│   │   │   └── reviews.store.ts
│   │   ├── boot/
│   │   │   └── axios.ts
│   │   └── router/
│   │       └── index.ts
│   ├── test/                       # Vitest frontend tests
│   └── package.json
├── e2e/                            # Playwright E2E tests
│   ├── booking-flow.spec.ts
│   ├── screener-delivery.spec.ts
│   └── review-publish.spec.ts
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
- Commission is always calculated in `commission.service.ts` — never inline in other services
- Screener URLs generated in `screener/` module only — never constructed ad hoc
- Filmmaker identity (name, email, contact) must be stripped from critic-facing booking responses until booking status is `confirmed`
- Amounts stored as INTEGER (cents) in SQLite; never REAL for money

## Storage Rules (SQLite)

- **Parameterized queries only** — NO string interpolation in SQL, ever
- Use `better-sqlite3` prepared statements: `db.prepare('SELECT ... WHERE id = ?').get(id)`
- `booking_status` transitions enforced via CHECK constraint: `pending → confirmed → in_review → complete → published`
- Published reviews have `published_at` set; once set, `deleted_at` can only be set by a human admin action (role check in service layer)
- Screener URL records store `expires_at` (Unix timestamp); expired URLs return 410 Gone
- Auto-release timer stored as `auto_release_at` on booking; a NestJS cron job processes overdue rows
- WAL mode and foreign keys enabled on connection open

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_PATH` | Yes | Absolute path to SQLite `.db` file |
| `JWT_SECRET` | Yes | HS256 secret for access tokens |
| `JWT_REFRESH_SECRET` | Yes | HS256 secret for refresh tokens |
| `JWT_EXPIRES_IN` | Yes | Access token TTL (e.g. `15m`) |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `STRIPE_CONNECT_CLIENT_ID` | Yes | Stripe Connect OAuth client ID |
| `COMMISSION_RATE_BPS` | Yes | Must be `1500` (15%); validated at startup |
| `SCREENER_URL_TTL_SECONDS` | Yes | Must be `86400` (24h); validated at startup |
| `AUTO_RELEASE_DAYS` | Yes | Must be `7`; validated at startup |
| `SCREENER_SIGNING_SECRET` | Yes | Secret for HMAC-signed screener URL tokens |
| `EMAIL_SMTP_HOST` | Yes | SMTP host for transactional email |
| `EMAIL_SMTP_PORT` | Yes | SMTP port |
| `EMAIL_FROM` | Yes | Sender address |
| `ANTHROPIC_API_KEY` | No | Claude API key (backend non-review features only) |
| `PORT` | No | API server port (default: 3000) |
| `NODE_ENV` | No | `development` \| `production` |

## Deployment

- Backend: single NestJS process; SQLite file on persistent volume
- Frontend: Quasar SPA → `web/dist/spa/`, served via nginx or CDN
- Stripe webhooks: `POST /payments/webhook` in Stripe dashboard
- Cron: NestJS `@Cron` task fires every hour to process auto-release bookings
- Startup validation: service asserts `COMMISSION_RATE_BPS === 1500`, `SCREENER_URL_TTL_SECONDS === 86400`, `AUTO_RELEASE_DAYS === 7` — exits if wrong

## Protected Paths

These files and directories must never be modified by agents:

- `api/src/auth/` — JWT, role guards, session management
- `api/src/payments/commission.service.ts` — 15% commission calculation
- `api/src/screener/` — signed URL generation, 24h expiry, delivery gate
- `api/src/review/publish.service.ts` — review publish trigger and state transition

## Known Footguns

- **Filmmaker identity leak** — always use a `CriticBookingResponseDto` that omits filmmaker PII; never return a raw booking entity to the critic before status is `confirmed`
- **Screener URL expiry** — signed URL tokens must be verified server-side on every screener request; do not rely solely on `expires_at` in the database
- **Stripe Connect payouts** — funds flow: filmmaker → platform account → critic connected account; never direct charge to critic
- **Auto-release cron** — cron fires every hour; ensure idempotency: check `released_at IS NULL` before processing
- **sql.js WASM** — requires `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` headers
- **Review deletion guard** — `publish.service.ts` must check `req.user.role === 'admin'` before setting `deleted_at`; agents must not add bypass paths

## Commit & PR Conventions

- Commits: `feat(bookings): implement 7-day auto-release cron` — conventional commits, scope required
- PRs: one feature or fix per PR; include test coverage; reference GitHub issue
- Branch naming: `feat/<issue>-<slug>`, `fix/<issue>-<slug>`
- Squash merge to main
