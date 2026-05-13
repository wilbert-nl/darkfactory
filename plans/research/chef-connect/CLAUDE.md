# CLAUDE.md — chef-connect

## Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 + Quasar + Capacitor (TypeScript, `<script setup>`, Pinia) |
| Storage (client) | `@capacitor-community/sqlite` (mobile) / `sql.js` (web/PWA) |
| Backend | NestJS + better-sqlite3 |
| Database | SQLite (single file per environment) |
| Payments | Stripe Connect (marketplace split payments) |
| Delivery | DoorDash Drive API |
| File encryption | Node.js `crypto` (AES-256-GCM) for verification docs |
| Package manager | pnpm |
| Testing | Vitest (frontend unit), Jest (backend unit), Playwright (E2E) |
| Language | TypeScript strict throughout |

## Repo Layout

```
chef-connect/
├── app/                                    # Quasar + Vue 3 frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChefCard.vue
│   │   │   ├── MenuItemCard.vue
│   │   │   ├── OrderForm.vue
│   │   │   ├── DeliverySelector.vue        # Pickup vs delivery toggle
│   │   │   ├── FoodSafetyDisclaimer.vue    # Mandatory on all pages
│   │   │   ├── VerificationBadge.vue       # Shown on verified chef profiles
│   │   │   └── AnalyticsDashboard.vue      # Chef Pro only
│   │   ├── pages/
│   │   │   ├── IndexPage.vue               # Browse chefs
│   │   │   ├── ChefProfilePage.vue
│   │   │   ├── CheckoutPage.vue
│   │   │   ├── OrderConfirmPage.vue
│   │   │   ├── ChefDashboardPage.vue
│   │   │   ├── ChefMenuPage.vue
│   │   │   └── AccountPage.vue
│   │   ├── stores/
│   │   │   ├── chef.store.ts
│   │   │   ├── menu.store.ts
│   │   │   ├── order.store.ts
│   │   │   ├── cart.store.ts
│   │   │   └── auth.store.ts
│   │   ├── composables/
│   │   │   ├── useChefSearch.ts
│   │   │   ├── useOrderTracking.ts
│   │   │   └── useCheckout.ts
│   │   └── db/
│   │       ├── client.ts
│   │       └── migrations/
├── api/                                    # NestJS backend
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   ├── auth/                           # PROTECTED — JWT auth, role guards
│   │   │   ├── auth.module.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   └── roles.guard.ts
│   │   ├── users/
│   │   ├── chefs/                          # Chef profile CRUD, featured listing
│   │   ├── menus/                          # Menu items, dietary tags
│   │   ├── orders/                         # Order placement, status, scheduling
│   │   ├── reviews/
│   │   ├── payments/                       # PROTECTED — Stripe Connect, commission
│   │   │   ├── payments.module.ts
│   │   │   ├── stripe.client.ts
│   │   │   ├── commission.service.ts       # PROTECTED — 15% commission logic
│   │   │   ├── payout.service.ts           # PROTECTED — Stripe Connect payout splits
│   │   │   └── webhook.controller.ts
│   │   ├── delivery/                       # PROTECTED — DoorDash Drive API client
│   │   │   ├── delivery.module.ts
│   │   │   ├── doordash.client.ts
│   │   │   └── delivery.service.ts
│   │   ├── verification/                   # PROTECTED — cert upload, encryption, admin review
│   │   │   ├── verification.module.ts
│   │   │   ├── cert-encryption.service.ts
│   │   │   └── verification.service.ts
│   │   ├── billing/                        # Chef Pro Stripe subscription
│   │   ├── analytics/                      # Chef Pro order analytics
│   │   └── common/
│   │       ├── guards/
│   │       │   └── verified-chef.guard.ts  # Blocks unverified chefs from accepting orders
│   │       ├── pipes/
│   │       └── interceptors/
│   ├── test/
│   └── data/
│       └── chef-connect.db
├── e2e/                                    # Playwright tests
├── .env.example
└── pnpm-workspace.yaml
```

## Running the App

```bash
pnpm install
pnpm --filter api dev
pnpm --filter app dev
```

## Testing

```bash
pnpm --filter app test
pnpm --filter api test
pnpm --filter api test:e2e
pnpm --filter e2e test
```

## Lint / Format / Type Check

```bash
pnpm --filter app lint
pnpm --filter api lint
pnpm --filter app typecheck
pnpm --filter api typecheck
pnpm format
```

## Code Conventions

- All Vue components use `<script setup lang="ts">` — no Options API
- Pinia stores use `defineStore` with setup function syntax
- NestJS services hold all business logic — controllers are thin
- DTOs use `class-validator`; all inputs validated at controller boundary
- No `any` type — use `unknown` with explicit narrowing
- File naming: `kebab-case.ts` for modules, `PascalCase.vue` for components
- Commission calculation is the sole responsibility of `commission.service.ts` — no other service computes commission
- All DoorDash Drive calls go through `doordash.client.ts` only
- Chef verification status checked via `verified-chef.guard.ts` — never inline in controllers
- `FoodSafetyDisclaimer.vue` included in `app/src/layouts/MainLayout.vue` — always rendered

## Storage Rules

- **Client-side:** `sql.js` (web/PWA) or `@capacitor-community/sqlite`. Stores cached chef list, menu items, and order history for offline browsing. No payment or verification data on client.
- **Server-side:** `better-sqlite3` via NestJS service. WAL mode enabled. Single `chef-connect.db` file.
- Chef verification documents (food handler certs): stored encrypted using AES-256-GCM. Key from `CERT_ENCRYPTION_KEY` env var. Never stored plaintext.
- Payment records retained for 7 years (financial compliance).
- Order records retained for 2 years.
- Chef profile photos stored in `storage/chef-photos/` (public CDN or local).
- Never store binary certificate files in SQLite — file paths only.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_PATH` | Yes | Absolute path to SQLite `.db` file |
| `JWT_SECRET` | Yes | JWT signing secret |
| `CERT_ENCRYPTION_KEY` | Yes | AES-256-GCM key for encrypting verification documents |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook endpoint secret |
| `STRIPE_PRO_PRICE_ID` | Yes | Stripe Price ID for Chef Pro $9.99/mo — hardcoded |
| `STRIPE_CONNECT_CLIENT_ID` | Yes | Stripe Connect platform client ID |
| `COMMISSION_RATE` | Yes | Must be `0.15` — never changed by agents |
| `DOORDASH_DEVELOPER_ID` | Yes | DoorDash Drive developer ID |
| `DOORDASH_KEY_ID` | Yes | DoorDash Drive API key ID |
| `DOORDASH_SIGNING_SECRET` | Yes | DoorDash Drive signing secret |
| `STORAGE_PATH` | Yes | Absolute path to local file storage root |
| `PORT` | Yes | NestJS listen port (default: `3000`) |
| `CORS_ORIGIN` | Yes | Frontend origin for CORS |
| `ADMIN_SECRET` | Yes | Secret for admin verification review endpoints |

## Deployment

- Backend: Docker container (NestJS process)
- Frontend: Static build on Cloudflare Pages or Netlify
- SQLite DB mounted as persistent volume
- Verification document storage: encrypted files on persistent volume or S3-compatible with server-side encryption

## Protected Paths

Agents must **never** modify files under these paths without explicit human approval:

- `api/src/auth/` — JWT auth and role guards
- `api/src/payments/commission.service.ts` — 15% commission calculation
- `api/src/payments/` — all Stripe Connect and payout logic
- `api/src/delivery/` — DoorDash Drive API client and delivery dispatch
- `api/src/verification/` — chef verification documents and encryption

## Known Footguns

- `commission.service.ts` is the single source of truth for the 15% rate. Any attempt to compute commission elsewhere — even as a "helper" — is prohibited.
- DoorDash Drive JWTs expire quickly — ensure the `doordash.client.ts` refreshes tokens before each request, not on a global timer.
- Stripe Connect: chefs must complete onboarding (`charges_enabled: true`) before any payout can be made. Guard against this state.
- `verified-chef.guard.ts` must query the DB for live verification status — never trust a JWT claim for verification state.
- AES-256-GCM requires a unique IV per encryption — ensure `cert-encryption.service.ts` generates a fresh IV for each document and stores it alongside the ciphertext.
- `FoodSafetyDisclaimer.vue` must be in the layout, not individual pages — so it cannot be forgotten on new pages.
- `better-sqlite3` is synchronous — keep DB operations in dedicated service methods, never in guards or interceptors directly.

## Commit & PR Conventions

- Commits: `type(scope): message` — types: `feat`, `fix`, `chore`, `test`, `docs`, `refactor`
- Scope examples: `chef`, `menu`, `order`, `delivery`, `payments`, `verification`, `analytics`
- PRs must reference a GitHub issue number
- PR titles must not exceed 72 characters
- Every PR touching `api/src/` must include at least one Jest test
- Every PR touching `app/src/` must include at least one Vitest test
