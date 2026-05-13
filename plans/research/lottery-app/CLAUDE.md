# CLAUDE.md — lottery-app

## Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 + Quasar + TypeScript (`<script setup>`) |
| State | Pinia stores |
| Client storage | `sql.js` (web/PWA, WASM SQLite) |
| Backend | NestJS + better-sqlite3 |
| Database | SQLite (single file, WAL mode) |
| Randomness | NIST Randomness Beacon public API (NOT Math.random()) |
| KYC / Identity | Stripe Identity (or Persona) — third-party |
| Payments | Stripe (pool entry fees, payouts, deposit limits) |
| Auth | JWT (access + refresh tokens) |
| Package manager | pnpm |
| Testing | Vitest (frontend unit), Jest (backend unit), Playwright (E2E) |
| AI | Anthropic Claude API — NestJS backend only (non-lottery features) |
| Language | TypeScript strict throughout |

## Repo Layout

```
lottery-app/
├── api/                          # NestJS backend
│   ├── src/
│   │   ├── auth/                 # PROTECTED — JWT, guards, age verification
│   │   ├── kyc/                  # PROTECTED — KYC status, Stripe Identity webhook
│   │   ├── lottery/
│   │   │   ├── draw.service.ts   # PROTECTED — NIST beacon draw logic
│   │   │   ├── payout.service.ts # PROTECTED — 95% payout, proof generation
│   │   │   ├── pool.service.ts   # Pool creation and join logic
│   │   │   └── pool.controller.ts
│   │   ├── audit/                # Public draw audit records (append-only)
│   │   ├── referral/             # Referral tracking and credit logic
│   │   ├── billing/              # Stripe payment capture, deposit limit enforcement
│   │   ├── users/                # User profiles, KYC status, deposit limits
│   │   ├── jurisdiction/         # Region config — human-only changes
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/                     # Jest backend tests
│   ├── data/                     # SQLite database file (gitignored)
│   └── package.json
├── web/                          # Quasar SPA frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── PoolsPage.vue
│   │   │   ├── PoolDetailPage.vue
│   │   │   ├── CreatePoolPage.vue
│   │   │   ├── AuditPage.vue
│   │   │   ├── DashboardPage.vue
│   │   │   └── KycPage.vue
│   │   ├── components/
│   │   │   ├── PoolCard.vue
│   │   │   ├── DrawResultBanner.vue
│   │   │   ├── AuditRecord.vue
│   │   │   └── DepositLimitBar.vue
│   │   ├── stores/
│   │   │   ├── auth.store.ts
│   │   │   ├── pools.store.ts
│   │   │   └── audit.store.ts
│   │   ├── boot/
│   │   │   └── axios.ts
│   │   └── router/
│   │       └── index.ts
│   ├── test/                     # Vitest frontend tests
│   └── package.json
├── e2e/                          # Playwright E2E tests
│   ├── pool-join.spec.ts
│   ├── kyc-gate.spec.ts
│   └── audit.spec.ts
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
- Draw and payout amounts always calculated in integer cents (no floating point for money)
- All dates stored as ISO 8601 strings in SQLite
- Randomness: always call `NistBeaconService.fetchPulse()` — never `Math.random()` or `crypto.getRandomValues()` for lottery logic

## Storage Rules (SQLite)

- **Parameterized queries only** — NO string interpolation in SQL, ever
- Use `better-sqlite3` prepared statements: `db.prepare('SELECT ... WHERE id = ?').get(id)`
- Draw records table has `CHECK` constraint preventing UPDATE and a trigger preventing DELETE
- Payout records are append-only; no UPDATE or DELETE permitted
- Deposit limit enforced by checking cumulative `payments` rows in SQLite before each Stripe charge
- WAL mode enabled on connection open
- Foreign keys enabled on connection open
- Amounts stored as INTEGER (cents); never REAL for money

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
| `NIST_BEACON_BASE_URL` | Yes | NIST Randomness Beacon API base URL |
| `KYC_PROVIDER` | Yes | `stripe-identity` or `persona` |
| `PERSONA_API_KEY` | No | Persona API key (if KYC_PROVIDER=persona) |
| `PLATFORM_FEE_BPS` | Yes | Must be `500` (5%); validated at startup |
| `PAYOUT_RATE_BPS` | Yes | Must be `9500` (95%); validated at startup |
| `EMAIL_SMTP_HOST` | Yes | SMTP host for transactional email |
| `EMAIL_SMTP_PORT` | Yes | SMTP port |
| `EMAIL_FROM` | Yes | Sender address |
| `ANTHROPIC_API_KEY` | No | Claude API key (non-lottery backend features only) |
| `PORT` | No | API server port (default: 3000) |
| `NODE_ENV` | No | `development` \| `production` |

## Deployment

- Backend: single NestJS process; SQLite file on persistent volume
- Frontend: Quasar SPA → `web/dist/spa/`, served via nginx or CDN
- Stripe webhooks: `POST /billing/webhook` and `POST /kyc/webhook`
- NIST Beacon: outbound HTTPS to `beacon.nist.gov` must be unblocked
- Startup validation: service asserts `PLATFORM_FEE_BPS === 500` and `PAYOUT_RATE_BPS === 9500` — exits process if wrong

## Protected Paths

These files and directories must never be modified by agents:

- `api/src/auth/` — JWT, age gate, session management
- `api/src/kyc/` — KYC status tracking, Stripe Identity webhook handling
- `api/src/lottery/draw.service.ts` — NIST beacon draw execution and proof storage
- `api/src/lottery/payout.service.ts` — winner payout, 95% rate calculation, proof generation

## Known Footguns

- **NIST Beacon latency** — beacon pulses are published every 60 seconds; schedule draws to align with beacon pulse windows; never wait synchronously for a pulse
- **Floating point money** — amounts must be INTEGER cents in SQLite and in all calculations; never use JavaScript `number` for prize pool math without converting to BigInt or integer cents first
- **Stripe webhook replay** — check `event.id` against processed events table before handling any payment webhook
- **sql.js WASM** — requires `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` headers
- **KYC webhook timing** — KYC status may arrive minutes after user submits; use polling or SSE to notify the frontend; never block UI thread waiting for KYC
- **Jurisdiction table** — `jurisdiction_config` rows control enabled regions; this table is human-only; add a startup assertion that no agent-triggered migration can insert rows here

## Commit & PR Conventions

- Commits: `feat(pools): add entry fee validation` — conventional commits, scope required
- PRs: one feature or fix per PR; include test coverage; reference GitHub issue
- Branch naming: `feat/<issue>-<slug>`, `fix/<issue>-<slug>`
- Squash merge to main
