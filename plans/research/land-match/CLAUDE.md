# CLAUDE.md — land-match

## Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 + Quasar + TypeScript (`<script setup>`) |
| State | Pinia stores |
| Map | Leaflet (no API key) |
| Client storage | `sql.js` (web/PWA, WASM SQLite) |
| Backend | NestJS + better-sqlite3 |
| Database | SQLite (single file, WAL mode) |
| Full-text search | SQLite FTS5 |
| Payments | Stripe (subscriptions: Pro Seller, Pro Buyer) |
| File storage | Local filesystem (encrypted); S3-compatible in production |
| Auth | JWT (access + refresh tokens) |
| Package manager | pnpm |
| Testing | Vitest (frontend unit), Jest (backend unit), Playwright (E2E) |
| AI | Anthropic Claude API — NestJS backend only |
| Language | TypeScript strict throughout |

## Repo Layout

```
land-match/
├── api/                          # NestJS backend
│   ├── src/
│   │   ├── auth/                 # PROTECTED — JWT, guards, refresh tokens
│   │   ├── verification/         # PROTECTED — human reviewer badge workflow
│   │   ├── documents/            # PROTECTED — encrypted document storage
│   │   ├── listings/             # Listing CRUD, GPS validation, GeoJSON boundaries
│   │   ├── search/               # SQLite FTS5 search, filters, saved searches
│   │   ├── messaging/            # Async buyer-seller messaging (polling)
│   │   ├── alerts/               # Email alerts for saved search matches
│   │   ├── billing/              # Stripe subscription management
│   │   ├── users/                # User profiles, tier enforcement
│   │   ├── intent/               # Buyer intent posts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/                     # Jest backend tests
│   ├── data/                     # SQLite database file (gitignored)
│   ├── uploads/                  # Encrypted document storage (gitignored)
│   └── package.json
├── web/                          # Quasar SPA frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ListingsPage.vue
│   │   │   ├── ListingDetailPage.vue
│   │   │   ├── MapPage.vue
│   │   │   ├── CreateListingPage.vue
│   │   │   ├── SearchPage.vue
│   │   │   ├── IntentPage.vue
│   │   │   ├── MessagesPage.vue
│   │   │   └── DashboardPage.vue
│   │   ├── components/
│   │   │   ├── ListingCard.vue
│   │   │   ├── LeafletMap.vue
│   │   │   ├── BoundaryEditor.vue
│   │   │   ├── DocumentUpload.vue
│   │   │   └── SavedSearchBell.vue
│   │   ├── stores/
│   │   │   ├── auth.store.ts
│   │   │   ├── listings.store.ts
│   │   │   ├── search.store.ts
│   │   │   └── messages.store.ts
│   │   ├── composables/
│   │   │   ├── useLeafletMap.ts
│   │   │   └── useGeoJSON.ts
│   │   ├── boot/
│   │   │   └── axios.ts
│   │   └── router/
│   │       └── index.ts
│   ├── test/                     # Vitest frontend tests
│   └── package.json
├── e2e/                          # Playwright E2E tests
│   ├── listings.spec.ts
│   ├── search.spec.ts
│   └── messaging.spec.ts
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
# Lint
pnpm lint

# Format
pnpm format

# Type check (strict)
cd web && pnpm type-check
cd api && pnpm type-check
```

## Code Conventions

- All Vue components use `<script setup lang="ts">`
- Pinia stores use `defineStore` with `setup()` syntax
- NestJS services are injected via constructor DI; no service locator pattern
- DTOs use `class-validator` decorators; all input validated at controller boundary
- No `any` type — use `unknown` and narrow explicitly
- Errors thrown as NestJS `HttpException` subtypes with explicit status codes
- Async functions always `await`; no floating promises
- All dates stored as ISO 8601 strings in SQLite; parsed to `Date` objects in service layer only

## Storage Rules (SQLite)

- **Parameterized queries only** — NO string interpolation in SQL, ever
- Use `better-sqlite3` prepared statements for all queries: `db.prepare('SELECT ... WHERE id = ?').get(id)`
- GPS coordinates stored as `REAL` with ≥6 decimal places; validated before INSERT
- GeoJSON boundary stored as TEXT (JSON.stringify); validated as valid GeoJSON before INSERT
- Listing price validated `>= 1` before INSERT — 0 price must throw `BadRequestException`
- Documents stored encrypted; encryption key from `DOCUMENT_ENCRYPTION_KEY` env var
- FTS5 virtual table `listings_fts` synced via triggers on listings INSERT/UPDATE/DELETE
- WAL mode enabled: `PRAGMA journal_mode=WAL` on connection open
- Foreign keys enabled: `PRAGMA foreign_keys=ON` on connection open

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_PATH` | Yes | Absolute path to SQLite `.db` file |
| `JWT_SECRET` | Yes | HS256 secret for access tokens |
| `JWT_REFRESH_SECRET` | Yes | HS256 secret for refresh tokens |
| `JWT_EXPIRES_IN` | Yes | Access token TTL (e.g. `15m`) |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key (sk_live_… or sk_test_…) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `STRIPE_PRO_SELLER_PRICE_ID` | Yes | Stripe Price ID for Pro Seller ($19.99/mo) |
| `STRIPE_PRO_BUYER_PRICE_ID` | Yes | Stripe Price ID for Pro Buyer ($9.99/mo) |
| `DOCUMENT_ENCRYPTION_KEY` | Yes | 32-byte hex key for AES-256 document encryption |
| `DOCUMENT_STORAGE_PATH` | Yes | Absolute path to encrypted document upload directory |
| `EMAIL_SMTP_HOST` | Yes | SMTP host for alert emails |
| `EMAIL_SMTP_PORT` | Yes | SMTP port |
| `EMAIL_FROM` | Yes | Sender address for alert emails |
| `ANTHROPIC_API_KEY` | No | Claude API key (backend AI features only) |
| `PORT` | No | API server port (default: 3000) |
| `NODE_ENV` | No | `development` \| `production` |

## Deployment

- Backend: single NestJS process; SQLite file on persistent volume
- Frontend: Quasar SPA built to `web/dist/spa/`, served via nginx or CDN
- Documents: encrypted on filesystem; back up `DOCUMENT_STORAGE_PATH` separately
- Stripe webhooks: configure endpoint `POST /billing/webhook` in Stripe dashboard

## Protected Paths

These files and directories must never be modified by agents:

- `api/src/auth/` — authentication, JWT issuance, guards
- `api/src/verification/` — human reviewer verified badge workflow
- `api/src/documents/` — encrypted document storage and retrieval

## Known Footguns

- **Leaflet SSR** — Leaflet assumes `window` is defined; lazy-load the map component, never import at module level
- **sql.js WASM** — must be served with `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` headers for SharedArrayBuffer
- **GeoJSON coordinates** — GeoJSON uses `[lng, lat]` order (not `[lat, lng]`); Leaflet uses `[lat, lng]` — convert at the boundary
- **SQLite WAL on NFS** — WAL mode is unsafe on network filesystems; use local disk only
- **better-sqlite3 is synchronous** — never call it inside an async hot path without a queue; use NestJS interceptor-level serialization for bulk operations
- **Stripe webhook idempotency** — always check `event.id` for duplicates before processing

## Commit & PR Conventions

- Commits: `feat(listings): add GPS precision validator` — conventional commits, scope required
- PRs: one feature or fix per PR; include test coverage; reference GitHub issue
- Branch naming: `feat/<issue>-<slug>`, `fix/<issue>-<slug>`
- PR title must reference issue number: `[#42] feat(search): implement FTS5 query parser`
- Squash merge to main
