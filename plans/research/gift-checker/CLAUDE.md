# CLAUDE.md — gift-checker

## Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 + Quasar + Capacitor (iOS/Android/web) + TypeScript strict |
| State | Pinia stores |
| Local storage | @capacitor-community/sqlite (mobile) + sql.js (web/PWA) |
| Backend | NestJS + better-sqlite3 |
| Auth | JWT + refresh tokens |
| AI | Anthropic Claude Haiku (NestJS backend only) |
| Push notifications | @capacitor/push-notifications (FCM/APNs) |
| Payments | Stripe (subscriptions) |
| Package manager | pnpm |
| Unit tests | Vitest (frontend), Jest (backend) |
| E2E tests | Playwright |
| Lint/Format | ESLint + Prettier |

## Repo Layout

```
gift-checker/
├── app/                              # Quasar + Capacitor app
│   ├── src/
│   │   ├── pages/
│   │   │   ├── WishlistPage.vue         # own wishlist management
│   │   │   ├── GroupPage.vue            # group members + their wishlists
│   │   │   ├── GiverView.vue            # claim/reserve UI (hides claimant from recipient)
│   │   │   ├── GiftLogPage.vue          # gifts given + received history
│   │   │   ├── SuggestionsPage.vue      # AI suggestions (Pro)
│   │   │   └── InvitePage.vue           # group invite link generation
│   │   ├── components/
│   │   │   ├── WishlistItem.vue
│   │   │   ├── ClaimBadge.vue           # shown only to non-recipient group members
│   │   │   └── EventChip.vue
│   │   ├── stores/
│   │   │   ├── auth.store.ts
│   │   │   ├── wishlist.store.ts
│   │   │   ├── groups.store.ts
│   │   │   └── claims.store.ts
│   │   ├── composables/
│   │   │   └── useLocalDb.ts            # abstraction over capacitor-sqlite / sql.js
│   │   └── router/
│   ├── android/
│   ├── ios/
│   └── quasar.config.ts
├── api/                              # NestJS backend
│   ├── src/
│   │   ├── auth/                     # PROTECTED — JWT, refresh tokens
│   │   ├── groups/
│   │   │   ├── visibility.service.ts # PROTECTED — claimed-flag visibility rules
│   │   │   ├── groups.service.ts
│   │   │   └── invite.service.ts
│   │   ├── wishlist/                 # wishlist CRUD
│   │   ├── claims/                   # claim/reserve flag management
│   │   ├── suggestions/              # Claude Haiku gift suggestions (Pro)
│   │   ├── notifications/            # push notification dispatch
│   │   ├── billing/                  # Stripe subscriptions
│   │   └── database/                 # better-sqlite3 setup, migrations
│   ├── test/
│   └── jest.config.ts
├── shared/                           # Shared TypeScript types
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
- All claimed-flag visibility logic is in `api/src/groups/visibility.service.ts` — no visibility decisions in controllers, frontend, or other services
- The API must never return a `claimant_user_id` field to the wishlist owner; `visibility.service.ts` strips it before response
- AI suggestions are returned only to the requesting user and must not include phrases that reveal the requester's intent if that user is the recipient viewing their own profile — enforced in `api/src/suggestions/`
- Local-first: personal wishlist data is stored in device SQLite; claimed-flag state for groups must always come from the backend
- `useLocalDb.ts` abstracts the capacitor-sqlite / sql.js difference

## Storage Rules (SQLite)

**Backend (better-sqlite3):**
- All queries use `prepare()` with bound parameters — no string interpolation
- `claims` table: `id`, `wishlist_item_id`, `group_id`, `claimant_user_id`, `claimed_at` — never joined into responses sent to the wishlist owner
- `group_invites` table: `token_hash` (SHA-256 of raw token), `group_id`, `created_by`, `expires_at` — raw token never stored
- WAL mode enabled on startup: `PRAGMA journal_mode=WAL`
- Free tier limits enforced by counting rows in `groups` and `wishlist_items` tables per user before insert

**Frontend (capacitor-sqlite / sql.js):**
- Personal wishlist drafts and event types stored locally via `useLocalDb.ts`
- Claimed flags are never stored locally — always fetched from the backend

## Environment Variables

| Variable | Location | Description |
|---|---|---|
| `JWT_SECRET` | api | JWT signing secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | api | Refresh token signing secret |
| `ANTHROPIC_API_KEY` | api | Claude Haiku API key for gift suggestions |
| `STRIPE_SECRET_KEY` | api | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | api | Stripe webhook signing secret |
| `FCM_SERVER_KEY` | api | Firebase Cloud Messaging server key |
| `APNS_KEY_ID` | api | APNs key ID |
| `APNS_TEAM_ID` | api | APNs team ID |
| `APNS_PRIVATE_KEY` | api | APNs private key (PEM) |
| `DATABASE_PATH` | api | Absolute path to SQLite file |
| `INVITE_LINK_BASE_URL` | api | Base URL for group invite links |
| `INVITE_EXPIRY_DAYS` | api | Group invite TTL — must be 7, do not change |
| `FREE_TIER_MAX_GROUPS` | api | Max groups for free users — must be 1 |
| `FREE_TIER_MAX_WISHLIST_ITEMS` | api | Max wishlist items for free users — must be 10 |

## Deployment

- Backend: single Node.js process (PM2 or systemd), SQLite on persistent volume
- Frontend: `quasar build` + `cap copy` → native builds; web build to CDN
- A nightly job purges expired group invite rows from the database
- Run `pnpm migrate` before each deploy

## Protected Paths

The following paths require a human-authored GitHub issue and explicit human approval before any agent modifies them:

- `api/src/auth/` — JWT issuance and refresh token logic
- `api/src/groups/visibility.service.ts` — claimed-flag visibility rules (core privacy invariant)

## Known Footguns

- Claimed-flag visibility: always filter at the service layer, not the controller — a future refactor of the controller must not accidentally re-expose claimant IDs.
- Group invite tokens: store only the SHA-256 hash in the database; the raw token is sent once via the invite link and never stored.
- `INVITE_EXPIRY_DAYS` must remain 7 per immutable constraints — do not make it a user-configurable setting.
- sql.js in-memory databases on web: persist to IndexedDB; do not use raw `Database` constructor without the capacitor-sqlite web adapter.
- Free tier limits should be checked with a single `COUNT` query inside a transaction before insert — not with two separate queries (TOCTOU race).
- AI suggestions context must be scoped to the group, not the requester's own wishlist — never pass the recipient's wishlist to the Claude prompt.

## Commit & PR Conventions

- Branch: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`
- Commit: `type(scope): description` (Conventional Commits)
- PRs must reference the GitHub issue number
- PRs must not modify protected paths unless the issue is labeled `human-approved`
