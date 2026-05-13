# CLAUDE.md — point-system

## Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 + Quasar + TypeScript (`<script setup>`) |
| State | Pinia stores |
| Client storage | `sql.js` (web/PWA, WASM SQLite) |
| Embed widgets | iframe-safe static HTML + JS snippets (cookie-free) |
| Backend | NestJS + better-sqlite3 |
| Database | SQLite (single file, WAL mode, append-only ledger) |
| Webhook auth | HMAC-SHA256 signature verification |
| Payments | Stripe (Free / Pro / Enterprise subscription billing) |
| Auth | JWT (access + refresh tokens) |
| Integrations | Zapier / Make.com via NestJS webhook endpoint |
| Package manager | pnpm |
| Testing | Vitest (frontend unit), Jest (backend unit), Playwright (E2E) |
| AI | Anthropic Claude API — NestJS backend only |
| Language | TypeScript strict throughout |

## Repo Layout

```
point-system/
├── api/                              # NestJS backend
│   ├── src/
│   │   ├── auth/                     # PROTECTED — JWT, API key auth, guards
│   │   ├── webhooks/
│   │   │   ├── hmac.service.ts       # PROTECTED — HMAC-SHA256 verification
│   │   │   └── webhooks.controller.ts
│   │   ├── points/
│   │   │   ├── ledger.service.ts     # PROTECTED — append-only ledger, balance reads
│   │   │   ├── points.service.ts     # Point grant orchestration
│   │   │   └── points.controller.ts
│   │   ├── rewards/
│   │   │   ├── redemption.service.ts # PROTECTED — idempotent redemption logic
│   │   │   ├── catalog.service.ts    # Reward catalog CRUD
│   │   │   └── rewards.controller.ts
│   │   ├── communities/              # Community workspace CRUD, member management
│   │   ├── leaderboard/              # Leaderboard computation (polling, no WebSocket)
│   │   ├── embeds/                   # Embed snippet generation, iframe endpoint
│   │   ├── integrations/             # Zapier / Make.com webhook endpoint
│   │   ├── billing/                  # Stripe subscription management
│   │   ├── users/                    # User accounts, API key management
│   │   ├── rate-limit/               # 1000 req/hr per community enforcement
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/                         # Jest backend tests
│   ├── data/                         # SQLite database file (gitignored)
│   └── package.json
├── web/                              # Quasar SPA frontend (admin dashboard)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── DashboardPage.vue
│   │   │   ├── CommunitySettingsPage.vue
│   │   │   ├── RewardsCatalogPage.vue
│   │   │   ├── LeaderboardPage.vue
│   │   │   ├── EmbedGeneratorPage.vue
│   │   │   ├── IntegrationsPage.vue
│   │   │   └── MembersPage.vue
│   │   ├── components/
│   │   │   ├── PointsRuleForm.vue
│   │   │   ├── RewardCard.vue
│   │   │   ├── LeaderboardTable.vue
│   │   │   ├── EmbedSnippet.vue
│   │   │   └── ApiKeyDisplay.vue
│   │   ├── stores/
│   │   │   ├── auth.store.ts
│   │   │   ├── community.store.ts
│   │   │   ├── points.store.ts
│   │   │   └── rewards.store.ts
│   │   ├── boot/
│   │   │   └── axios.ts
│   │   └── router/
│   │       └── index.ts
│   ├── test/                         # Vitest frontend tests
│   └── package.json
├── widgets/                          # Embeddable widget source (vanilla JS + CSS)
│   ├── leaderboard/
│   │   ├── leaderboard.js
│   │   └── leaderboard.css
│   └── profile/
│       ├── profile.js
│       └── profile.css
├── e2e/                              # Playwright E2E tests
│   ├── webhook-ingestion.spec.ts
│   ├── redemption.spec.ts
│   └── embed.spec.ts
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

# Build widget bundles
cd widgets && pnpm build

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
- Point balances never read from a `balance` column — always computed as `SUM(amount)` from transactions table with community and member scope
- Redemption endpoints must include an `idempotencyKey` field in the request DTO
- Widget JS must not use `document.cookie`, `localStorage`, or `sessionStorage`
- Rate limiting enforced via a NestJS guard that checks per-community request counts in SQLite

## Storage Rules (SQLite)

- **Parameterized queries only** — NO string interpolation in SQL, ever
- Use `better-sqlite3` prepared statements: `db.prepare('SELECT ... WHERE id = ?').get(id)`
- `point_transactions` table: INSERT only — no UPDATE or DELETE; enforced by SQLite trigger + application layer check
- Balance computed as: `SELECT SUM(amount) FROM point_transactions WHERE community_id = ? AND member_id = ?`
- Negative balance guard: before INSERT, verify `current_balance + amount >= 0`; reject with 422 if violated
- Redemption records include `idempotency_key` UNIQUE constraint to prevent double-spend
- `communities` table has `member_count` cache column — updated via trigger, not direct application write
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
| `STRIPE_PRO_PRICE_ID` | Yes | Stripe Price ID for Pro ($29/mo) |
| `STRIPE_ENTERPRISE_PRICE_ID` | Yes | Stripe Price ID for Enterprise |
| `WEBHOOK_RATE_LIMIT_PER_HOUR` | Yes | Must be `1000`; validated at startup |
| `EMBED_BASE_URL` | Yes | Public base URL for embed iframe endpoints |
| `ANTHROPIC_API_KEY` | No | Claude API key (backend non-points features only) |
| `PORT` | No | API server port (default: 3000) |
| `NODE_ENV` | No | `development` \| `production` |

## Deployment

- Backend: single NestJS process; SQLite file on persistent volume
- Frontend: Quasar SPA → `web/dist/spa/`, served via nginx or CDN
- Widgets: built static JS/CSS served from CDN with long cache TTL
- Embed iframes: served from `EMBED_BASE_URL`; must include `X-Frame-Options: ALLOWALL` or `Content-Security-Policy: frame-ancestors *`
- Stripe webhooks: `POST /billing/webhook` in Stripe dashboard
- Startup validation: service asserts `WEBHOOK_RATE_LIMIT_PER_HOUR === 1000` — exits if wrong

## Protected Paths

These files and directories must never be modified by agents:

- `api/src/auth/` — JWT, API key issuance, guards
- `api/src/webhooks/hmac.service.ts` — HMAC-SHA256 webhook signature verification
- `api/src/points/ledger.service.ts` — append-only transaction INSERT, balance computation
- `api/src/rewards/redemption.service.ts` — idempotent redemption, double-spend prevention

## Known Footguns

- **Ledger balance race** — use SQLite exclusive transaction when checking balance + inserting debit; never check balance in one query and insert in a separate statement
- **HMAC timing attack** — use `crypto.timingSafeEqual` when comparing HMAC signatures; never `===` string comparison
- **Widget cookie ban** — widget JS bundle must not import any library that uses cookies or storage; audit with `grep -r 'cookie\|localStorage\|sessionStorage' widgets/`
- **Rate limit counter drift** — rate limit counts stored in SQLite with a 1-hour rolling window; use `strftime('%s', 'now')` for window boundaries; never rely on Node.js `Date.now()` alone
- **sql.js WASM** — requires `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` headers for the admin SPA
- **Zapier webhook auth** — Zapier does not send HMAC by default; the integration endpoint must enforce API key auth as a fallback, not skip HMAC

## Commit & PR Conventions

- Commits: `feat(points): add negative balance guard` — conventional commits, scope required
- PRs: one feature or fix per PR; include test coverage; reference GitHub issue
- Branch naming: `feat/<issue>-<slug>`, `fix/<issue>-<slug>`
- Squash merge to main
