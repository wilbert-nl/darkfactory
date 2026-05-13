# CLAUDE.md — calendr

## Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 + Quasar + Capacitor (TypeScript, `<script setup>`, Pinia) |
| Storage (client) | `@capacitor-community/sqlite` (mobile) / `sql.js` (web/PWA) |
| Backend | NestJS + better-sqlite3 |
| Database | SQLite (single file per environment) |
| Calendar sync | google-auth-library (Google), Microsoft Graph SDK (Outlook) |
| Messaging | Twilio SDK (SMS + WhatsApp) |
| AI | Anthropic Claude Haiku (post-appointment follow-ups, backend only) |
| Payments | Stripe (Checkout + Billing Portal) |
| Package manager | pnpm |
| Testing | Vitest (frontend unit), Jest (backend unit), Playwright (E2E) |
| Language | TypeScript strict throughout |

## Repo Layout

```
calendr/
├── app/                                  # Quasar + Vue 3 frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── BookingPage.vue           # Public-facing bookable page
│   │   │   ├── ServiceCard.vue
│   │   │   ├── AvailabilityCalendar.vue
│   │   │   ├── BrandingEditor.vue        # Logo, colors, headline customization
│   │   │   └── ReminderOptOut.vue        # Always-visible opt-out control
│   │   ├── pages/
│   │   │   ├── DashboardPage.vue
│   │   │   ├── ServicesPage.vue
│   │   │   ├── BookingsPage.vue
│   │   │   ├── SettingsPage.vue
│   │   │   └── [slug]/BookPage.vue       # Dynamic public booking page
│   │   ├── stores/
│   │   │   ├── provider.store.ts
│   │   │   ├── booking.store.ts
│   │   │   ├── calendar.store.ts
│   │   │   └── auth.store.ts
│   │   ├── composables/
│   │   │   ├── useAvailability.ts
│   │   │   └── useBookingFlow.ts
│   │   └── db/
│   │       ├── client.ts
│   │       └── migrations/
├── api/                                  # NestJS backend
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   ├── auth/                         # PROTECTED — OAuth flows, token encryption
│   │   │   ├── google.auth.service.ts
│   │   │   ├── microsoft.auth.service.ts
│   │   │   ├── token-encryption.service.ts
│   │   │   └── jwt.strategy.ts
│   │   ├── users/
│   │   ├── providers/                    # Provider profile, branding, availability
│   │   ├── services/                     # Service catalog (name, duration, price, buffer)
│   │   ├── bookings/                     # Booking logic, conflict detection
│   │   ├── calendar-sync/               # PROTECTED — Google + Outlook webhook + polling
│   │   │   ├── google-calendar.service.ts
│   │   │   ├── microsoft-calendar.service.ts
│   │   │   └── sync-scheduler.service.ts
│   │   ├── reminders/                    # PROTECTED — Twilio SMS/WhatsApp, opt-out
│   │   │   ├── reminders.service.ts
│   │   │   ├── opt-out.service.ts
│   │   │   └── twilio.client.ts
│   │   ├── ai-followup/                  # Claude Haiku post-appointment messages
│   │   ├── billing/
│   │   ├── gdpr/                         # Account deletion handler
│   │   └── common/
│   │       ├── guards/
│   │       ├── pipes/
│   │       └── interceptors/
│   ├── test/
│   └── data/
│       └── calendr.db
├── e2e/                                  # Playwright tests
├── .env.example
└── pnpm-workspace.yaml
```

## Running the App

```bash
pnpm install

# Backend
pnpm --filter api dev

# Frontend
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
- OAuth tokens must be encrypted before writing to SQLite and decrypted after reading — never stored plaintext
- Buffer time validation: max 4 hours (14400 seconds) enforced in `services/` DTO
- All Claude API calls made through `ai-followup/` module only

## Storage Rules

- **Client-side:** `sql.js` (web/PWA) or `@capacitor-community/sqlite`. Stores cached booking list and provider settings for offline read. No OAuth tokens on client.
- **Server-side:** `better-sqlite3` via NestJS service. WAL mode enabled. Single `calendr.db` file.
- OAuth tokens (Google, Microsoft): stored encrypted using AES-256-GCM. Encryption key from `OAUTH_ENCRYPTION_KEY` env var.
- Client booking data retained for 2 years unless GDPR deletion requested.
- GDPR deletion: cascade delete all provider data, bookings, calendar tokens, Twilio opt-out records within 30 days.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_PATH` | Yes | Absolute path to SQLite `.db` file |
| `JWT_SECRET` | Yes | JWT signing secret |
| `OAUTH_ENCRYPTION_KEY` | Yes | AES-256-GCM key for encrypting OAuth tokens at rest |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | Yes | Google OAuth redirect URI |
| `MICROSOFT_CLIENT_ID` | Yes | Microsoft Azure app client ID |
| `MICROSOFT_CLIENT_SECRET` | Yes | Microsoft Azure app client secret |
| `MICROSOFT_REDIRECT_URI` | Yes | Microsoft OAuth redirect URI |
| `TWILIO_ACCOUNT_SID` | Yes | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Yes | Twilio auth token |
| `TWILIO_FROM_PHONE` | Yes | Twilio SMS sender phone number |
| `TWILIO_WHATSAPP_FROM` | Yes | Twilio WhatsApp sender number |
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for Claude Haiku follow-ups |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook endpoint secret |
| `STRIPE_PRO_PRICE_ID` | Yes | Stripe Price ID for $12/mo Pro plan — hardcoded |
| `MAX_BUFFER_SECONDS` | Yes | Must be `14400` (4 hours) — never changed by agents |
| `PORT` | Yes | NestJS listen port (default: `3000`) |
| `CORS_ORIGIN` | Yes | Frontend origin for CORS |

## Deployment

- Backend: Docker container (single NestJS process)
- Frontend: Static build on Cloudflare Pages or Netlify
- SQLite DB mounted as persistent volume
- Custom domain support: Cloudflare for proxy routing to provider slug pages

## Protected Paths

Agents must **never** modify files under these paths without explicit human approval:

- `api/src/auth/` — OAuth flows and token encryption
- `api/src/calendar-sync/` — Google and Outlook calendar sync logic
- `api/src/reminders/` — Twilio SMS/WhatsApp and opt-out handling

## Known Footguns

- Google Calendar webhooks expire after 7 days — `sync-scheduler.service.ts` must renew them before expiry. Do not remove the renewal cron.
- Microsoft Graph subscriptions expire after 3 days for calendar events — same renewal requirement.
- OAuth tokens encrypted in SQLite: always decrypt after read, re-encrypt if token is refreshed. Never log decrypted tokens.
- `better-sqlite3` is synchronous — token encryption/decryption calls should be isolated to dedicated service methods, not inlined in controllers.
- Twilio opt-out records must be checked before every reminder send — even if the booking record has no opt-out flag, query the opt-out table.
- Buffer time is stored in seconds internally — UI shows hours/minutes. Always convert before persisting.
- Claude Haiku calls should use prompt caching for system prompt to reduce cost.

## Commit & PR Conventions

- Commits: `type(scope): message` — types: `feat`, `fix`, `chore`, `test`, `docs`, `refactor`
- Scope examples: `booking`, `calendar`, `reminders`, `billing`, `auth`, `gdpr`
- PRs must reference a GitHub issue number
- PR titles must not exceed 72 characters
- Every PR touching `api/src/` must include at least one Jest test
- Every PR touching `app/src/` must include at least one Vitest test
