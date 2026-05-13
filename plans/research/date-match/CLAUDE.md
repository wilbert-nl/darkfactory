# CLAUDE.md — date-match

## Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 + Quasar + Capacitor (iOS/Android/web) + TypeScript strict |
| State | Pinia stores |
| Local storage | @capacitor-community/sqlite (mobile) + sql.js (web/PWA) |
| Backend | NestJS + better-sqlite3 |
| Auth | JWT + refresh tokens |
| AI | Anthropic Claude Haiku (NestJS backend only) |
| Payments | Stripe (subscriptions) |
| Package manager | pnpm |
| Unit tests | Vitest (frontend), Jest (backend) |
| E2E tests | Playwright |
| Lint/Format | ESLint + Prettier |

## Repo Layout

```
date-match/
├── app/                              # Quasar + Capacitor app
│   ├── src/
│   │   ├── pages/
│   │   │   ├── OnboardingPage.vue       # questionnaire flow
│   │   │   ├── ScorePage.vue            # compatibility score breakdown
│   │   │   ├── CoachingPage.vue         # AI conversation starters (Pro)
│   │   │   ├── DailyPromptPage.vue      # daily couple prompt (Pro)
│   │   │   ├── CouplesLinkPage.vue      # invite link + link status
│   │   │   └── SettingsPage.vue         # account, data deletion
│   │   ├── components/
│   │   │   ├── Disclaimer.vue           # PROTECTED — therapy disclaimer
│   │   │   ├── ScoreWheel.vue
│   │   │   ├── CategoryBar.vue
│   │   │   └── QuestionCard.vue
│   │   ├── stores/
│   │   │   ├── auth.store.ts
│   │   │   ├── questionnaire.store.ts
│   │   │   ├── score.store.ts
│   │   │   └── couples.store.ts
│   │   ├── composables/
│   │   │   └── useLocalDb.ts            # abstraction over capacitor-sqlite / sql.js
│   │   └── router/
│   ├── android/
│   ├── ios/
│   └── quasar.config.ts
├── api/                              # NestJS backend
│   ├── src/
│   │   ├── auth/                     # PROTECTED — JWT, refresh, GDPR delete cascade
│   │   ├── ai/                       # PROTECTED — Claude Haiku coaching content
│   │   ├── questionnaire/            # sync questionnaire data server-side
│   │   ├── score/                    # compatibility score computation
│   │   ├── couples/                  # invite link generation + account linking
│   │   ├── prompts/                  # daily prompt scheduling + delivery
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
- `app/src/components/Disclaimer.vue` is a protected file — it must render on every AI coaching screen; agents must not remove or conditionally hide it
- Questionnaire responses must never be passed as plain strings in error messages or logged at any level
- Local-first: questionnaire data is written to device SQLite first; backend sync happens on couples link or explicit sync action
- `useLocalDb.ts` abstracts the capacitor-sqlite / sql.js difference — all local DB access goes through this composable
- Claude API calls are in `api/src/ai/` only — no Anthropic SDK import in `app/`
- GDPR deletion must call `authService.deleteUserCascade(userId)` which is the single entry point for all cascading deletes

## Storage Rules (SQLite)

**Backend (better-sqlite3):**
- All queries use `prepare()` with bound parameters — no string interpolation
- Questionnaire responses are stored encrypted using AES-256-GCM; key comes from `ENCRYPTION_KEY`
- GDPR delete cascade is implemented as a SQL transaction deleting from all user-linked tables in foreign-key order
- WAL mode enabled on startup: `PRAGMA journal_mode=WAL`

**Frontend (capacitor-sqlite / sql.js):**
- Local questionnaire drafts stored via `useLocalDb.ts`
- Local data is cleared on account deletion confirmation
- Never store JWT tokens in SQLite — use @capacitor/preferences for tokens

## Environment Variables

| Variable | Location | Description |
|---|---|---|
| `JWT_SECRET` | api | JWT signing secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | api | Refresh token signing secret |
| `ANTHROPIC_API_KEY` | api | Claude Haiku API key |
| `ENCRYPTION_KEY` | api | AES-256-GCM key for questionnaire encryption (32 bytes hex) |
| `STRIPE_SECRET_KEY` | api | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | api | Stripe webhook signing secret |
| `DATABASE_PATH` | api | Absolute path to SQLite file |
| `INVITE_LINK_BASE_URL` | api | Base URL for couples invite links |
| `INVITE_EXPIRY_HOURS` | api | Invite link TTL — must be 24, do not change |

## Deployment

- Backend: single Node.js process (PM2 or systemd), SQLite on persistent volume
- Frontend: `quasar build` + `cap copy` → native builds; web build to CDN
- Run `pnpm migrate` before each deploy

## Protected Paths

The following paths require a human-authored GitHub issue and explicit human approval before any agent modifies them:

- `api/src/auth/` — JWT issuance, GDPR cascade deletion
- `api/src/ai/` — Claude Haiku coaching prompts and response handling
- `app/src/components/Disclaimer.vue` — therapy disclaimer component

## Known Footguns

- sql.js databases are in-memory by default on web — persist to IndexedDB using the capacitor-community/sqlite web implementation; do not use raw sql.js `Database` constructor in production.
- Couples invite tokens must be stored hashed in the database — never store the raw token.
- Claude Haiku responses for coaching must not be cached or persisted — generate fresh each session.
- Compatibility score recalculation must be triggered whenever either partner updates their questionnaire — stale scores are a UX failure.
- `INVITE_EXPIRY_HOURS` must remain 24 — do not make it configurable per the immutable constraints.

## Commit & PR Conventions

- Branch: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`
- Commit: `type(scope): description` (Conventional Commits)
- PRs must reference the GitHub issue number
- PRs must not modify protected paths unless the issue is labeled `human-approved`
