# CLAUDE.md — Alalarm Technical Specification

## Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Mobile/Web UI | Vue 3 + Quasar Framework + Capacitor | Vue 3.x, Quasar 2.x, Capacitor 6.x |
| Language | TypeScript | 5.x |
| Package manager | pnpm | 9.x |
| Backend API | NestJS | 10.x |
| Database | PostgreSQL + Prisma ORM | PostgreSQL 16, Prisma 5.x |
| Notifications | @capacitor/local-notifications | 6.x |
| Payments | Stripe | stripe-js + stripe Node SDK |
| AI (NL parsing) | Anthropic Claude API (claude-haiku-4-5) | latest |
| Testing (unit) | Vitest (frontend), Jest (backend) | latest |
| Testing (E2E) | Playwright | 1.x |
| Linting | ESLint + @typescript-eslint | latest |
| Formatting | Prettier | 3.x |
| CI | GitHub Actions | — |

## Repo Layout

```
alalarm/
├── app/                          ← Quasar/Capacitor frontend
│   ├── src/
│   │   ├── components/           ← Reusable UI components
│   │   ├── pages/                ← Route-level page components
│   │   ├── layouts/              ← App shell layouts
│   │   ├── composables/          ← Vue 3 composables (useAlarm, useStreak, etc.)
│   │   ├── stores/               ← Pinia stores (alarm.store.ts, subscription.store.ts)
│   │   ├── services/             ← API clients, notification service, AI service
│   │   ├── types/                ← Shared TypeScript types/interfaces
│   │   ├── router/               ← Vue Router config
│   │   └── boot/                 ← Quasar boot files (capacitor, stripe, etc.)
│   ├── test/
│   │   ├── unit/                 ← Vitest unit tests
│   │   └── e2e/                  ← Playwright E2E tests
│   ├── quasar.config.ts
│   ├── capacitor.config.ts
│   ├── package.json
│   └── tsconfig.json
├── api/                          ← NestJS backend
│   ├── src/
│   │   ├── alarms/               ← Alarm sync module (future Pro feature)
│   │   ├── auth/                 ← JWT auth module
│   │   ├── subscriptions/        ← Stripe webhook + subscription management
│   │   ├── ai/                   ← Claude API NL parsing endpoint
│   │   ├── users/                ← User module
│   │   ├── prisma/               ← Prisma service
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── test/
│   │   ├── unit/
│   │   └── integration/
│   ├── package.json
│   └── tsconfig.json
├── MISSION.md                    ← Human-only, never modify via agent
├── CLAUDE.md                     ← Human-only, never modify via agent
├── FACTORY_RULES.md              ← Human-only, never modify via agent
├── .archon/
│   ├── config.yaml
│   ├── workflows/
│   └── commands/
└── .github/
    └── workflows/
```

## Running the App

```bash
# Frontend (Quasar dev server)
cd app && pnpm dev

# Frontend (Capacitor iOS)
cd app && pnpm quasar build -m capacitor -T ios && npx cap open ios

# Frontend (Capacitor Android)
cd app && pnpm quasar build -m capacitor -T android && npx cap open android

# Backend
cd api && pnpm start:dev

# Run all tests
cd app && pnpm test
cd api && pnpm test

# E2E tests
cd app && pnpm test:e2e
```

## Testing

- **Frontend unit tests**: Vitest. Run with `cd app && pnpm test:unit`.
- **Backend unit/integration tests**: Jest. Run with `cd api && pnpm test`.
- **E2E**: Playwright against the Quasar SPA dev server. Run with `cd app && pnpm test:e2e`.
- **No mocking the database** in integration tests — use a real test PostgreSQL instance.
- **Never modify test assertions to make tests pass** — fix the source code.
- Coverage target: 80% for stores and composables, 70% for services.

## Lint / Format / Type Check

```bash
# Frontend
cd app && pnpm lint          # ESLint
cd app && pnpm format        # Prettier
cd app && pnpm type-check    # vue-tsc --noEmit

# Backend
cd api && pnpm lint
cd api && pnpm format
cd api && pnpm type-check    # tsc --noEmit
```

All checks must pass before a PR can merge.

## Code Conventions

- **TypeScript**: strict mode enabled in both app and api. No `any`.
- **Vue 3**: Composition API only. `<script setup>` syntax. No Options API.
- **Pinia stores**: one store per domain (alarm, subscription, auth, streak). No cross-store direct mutation.
- **Async**: always `async/await`, never `.then()` chains.
- **Error handling**: use `try/catch` at service boundaries; never swallow errors silently.
- **Imports**: path aliases (`@/`) for internal imports. No relative `../../` beyond 1 level.
- **Naming**: PascalCase for components/types, camelCase for functions/variables, SCREAMING_SNAKE for constants.
- **No barrel exports** (`index.ts` re-exports) — import directly from source files.
- **No inline styles** — use Quasar classes or scoped CSS only.

## Database Rules

- **ORM**: Prisma only. No raw SQL except in migrations.
- **Queries**: all DB access through `PrismaService`, never directly in controllers.
- **Migrations**: never edit existing migrations — create new ones.
- **Multi-tenancy**: none in MVP. Single schema, userId foreign key on all user-owned rows.
- **Soft deletes**: use `deletedAt: DateTime?` pattern for user alarms and subscriptions.

## Environment Variables

### Frontend (`app/.env`)
| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_API_BASE_URL` | Required | NestJS API base URL |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Required | Stripe public key |
| `VITE_ANTHROPIC_API_KEY` | Optional (dev only) | Direct Claude API (use backend proxy in prod) |

### Backend (`api/.env`)
| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Required | PostgreSQL connection string |
| `JWT_SECRET` | Required | Auth token signing key |
| `STRIPE_SECRET_KEY` | Required | Stripe server key |
| `STRIPE_WEBHOOK_SECRET` | Required | Stripe webhook verification |
| `ANTHROPIC_API_KEY` | Required | Claude API for NL alarm parsing |
| `PORT` | Optional | Server port (default 3000) |

## Deployment

- **Frontend**: built as SPA + Capacitor; deployed to App Store / Play Store. Web version deployed to Vercel.
- **Backend**: Docker container to Railway (or Fly.io). CI builds and pushes image.
- **Database**: Railway PostgreSQL or Supabase.
- **Agents never touch**: `.env` files, production secrets, deployment configs, CI secrets.

## Protected Paths (Auto-Reject if Touched)

```
MISSION.md
CLAUDE.md
FACTORY_RULES.md
.archon/workflows/
.archon/commands/
.github/workflows/factory-orchestrator.yml
api/src/auth/
api/src/subscriptions/stripe-webhook.controller.ts
api/prisma/schema.prisma         ← schema changes require human review
app/src/boot/stripe.ts
```

## Known Footguns

- Capacitor Local Notifications requires explicit permissions on iOS — always call `requestPermissions()` before scheduling.
- Quasar's `$q.notify` is not the same as push notifications — do not confuse them.
- Stripe webhook events must be verified with `stripe.webhooks.constructEvent()` before processing.
- Prisma migrations are irreversible in production — always review before applying.
- Claude API calls for NL parsing must go through the NestJS backend in production (never expose `ANTHROPIC_API_KEY` in the frontend bundle).
- The free tier cap (3 alarms) is enforced server-side AND client-side — both checks are required.

## Commit & PR Conventions

- Commit format: `type(scope): short description` — types: `feat`, `fix`, `test`, `chore`, `docs`, `refactor`
- PR body must include: linked issue number (`Closes #N`), summary of changes, test plan
- One issue per PR — no bundling unrelated changes
- PR size limit: 500 lines changed (excluding generated files)
- Branch naming: `feat/issue-N-short-slug` or `fix/issue-N-short-slug`
