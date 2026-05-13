# CLAUDE.md — cf4-autofill

## Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 + Quasar + Capacitor (TypeScript, `<script setup>`, Pinia) |
| Storage (client) | `@capacitor-community/sqlite` (mobile) / `sql.js` (web/PWA) |
| Backend | NestJS + better-sqlite3 |
| Database | SQLite (single file per environment) |
| PDF generation | PDFKit or Puppeteer (server-side, NestJS) |
| AI | Anthropic Claude Haiku (HS code lookup, backend only) |
| Payments | Stripe (Checkout + Billing Portal) |
| Package manager | pnpm |
| Testing | Vitest (frontend unit), Jest (backend unit), Playwright (E2E) |
| Language | TypeScript strict throughout |

## Repo Layout

```
cf4-autofill/
├── app/                                  # Quasar + Vue 3 frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── CF4Form.vue               # PROTECTED — official BOC CF4 field layout
│   │   │   ├── ProfileSelector.vue
│   │   │   ├── LineItemTable.vue
│   │   │   ├── HsCodeSuggestor.vue       # Shows AI suggestion + mandatory disclaimer
│   │   │   └── ExportButton.vue
│   │   ├── pages/
│   │   │   ├── IndexPage.vue
│   │   │   ├── ProfilesPage.vue
│   │   │   ├── FormPage.vue
│   │   │   └── AccountPage.vue
│   │   ├── stores/
│   │   │   ├── profile.store.ts
│   │   │   ├── form.store.ts
│   │   │   ├── hsCode.store.ts
│   │   │   └── auth.store.ts
│   │   ├── composables/
│   │   │   ├── useProfileAutofill.ts
│   │   │   └── useHsCodeLookup.ts
│   │   └── db/
│   │       ├── client.ts
│   │       └── migrations/
├── api/                                  # NestJS backend
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   ├── auth/
│   │   ├── users/
│   │   ├── profiles/                     # Importer/exporter profile CRUD
│   │   ├── forms/                        # Form session storage, line items
│   │   ├── exports/                      # Export tracking, quota enforcement
│   │   ├── hs-code/                      # Claude Haiku HS code lookup service
│   │   ├── pdf/                          # PROTECTED — PDF generation, CF4 template rendering
│   │   │   ├── pdf.service.ts
│   │   │   └── pdf.generator.ts
│   │   ├── cf4-template/                 # PROTECTED — CF4 field definitions, layout constants
│   │   │   ├── cf4-fields.const.ts       # Official BOC CF4 field names and order
│   │   │   └── cf4-layout.ts             # PDF layout coordinates matching official form
│   │   ├── billing/
│   │   ├── cleanup/                      # 90-day retention cron for free-tier manifests
│   │   └── common/
│   │       ├── guards/
│   │       ├── pipes/
│   │       └── interceptors/
│   ├── test/
│   └── data/
│       └── cf4-autofill.db
├── e2e/                                  # Playwright tests
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
- All Claude API calls go through `api/src/hs-code/` service only
- PDF is always generated server-side in `api/src/pdf/` — never in browser
- HS code disclaimer text constant must be sourced from `api/src/hs-code/disclaimer.const.ts` — never hardcoded inline in components

## Storage Rules

- **Client-side:** `sql.js` (web/PWA) or `@capacitor-community/sqlite`. Stores draft form state and cached profile list for offline editing. No sensitive business data.
- **Server-side:** `better-sqlite3` via NestJS service. WAL mode enabled. Single `cf4-autofill.db` file.
- Free tier: form/manifest data older than 90 days deleted by `cleanup/` cron.
- Pro tier: unlimited retention.
- Generated PDFs stored temporarily in `storage/exports/` and deleted after 24 hours.
- Never store HS code AI responses permanently — treat them as ephemeral suggestions.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_PATH` | Yes | Absolute path to SQLite `.db` file |
| `JWT_SECRET` | Yes | JWT signing secret |
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for Claude Haiku HS code lookup |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook endpoint secret |
| `STRIPE_PRO_PRICE_ID` | Yes | Stripe Price ID for $4.99/mo Pro plan — hardcoded |
| `FREE_TIER_MAX_PROFILES` | Yes | Must be `3` — never changed by agents |
| `FREE_TIER_MAX_EXPORTS_PER_MONTH` | Yes | Must be `10` — never changed by agents |
| `MANIFEST_RETENTION_DAYS_FREE` | Yes | Must be `90` — never changed by agents |
| `STORAGE_PATH` | Yes | Absolute path to local file storage root |
| `PDF_EXPORT_TTL_HOURS` | Yes | Must be `24` — generated PDF deletion window |
| `PORT` | Yes | NestJS listen port (default: `3000`) |
| `CORS_ORIGIN` | Yes | Frontend origin for CORS |

## Deployment

- Backend: Docker container (NestJS process)
- Frontend: Static build on Cloudflare Pages or Netlify
- SQLite DB mounted as persistent volume
- No Redis or external queue required

## Protected Paths

Agents must **never** modify files under these paths without explicit human approval:

- `api/src/pdf/` — PDF generation and CF4 template rendering
- `api/src/cf4-template/` — official CF4 field definitions and layout constants
- `app/src/components/CF4Form.vue` — official BOC CF4 form field layout

## Known Footguns

- Claude Haiku HS code responses are probabilistic — always show the disclaimer. Never suppress it based on confidence score or any other heuristic.
- `CF4Form.vue` field order must match the official BOC CF4 paper form exactly — do not reorder fields for UX convenience without human approval.
- PDFKit coordinate system starts from top-left — test PDF output against a physical CF4 form scan before any layout change.
- Free-tier quota (3 profiles, 10 exports/mo) must be enforced server-side in guards — never rely on frontend-only checks.
- Puppeteer (if used for PDF) requires `--no-sandbox` in Docker — ensure this is documented and security-reviewed before deployment.
- `better-sqlite3` is synchronous — keep DB operations in dedicated service methods.

## Commit & PR Conventions

- Commits: `type(scope): message` — types: `feat`, `fix`, `chore`, `test`, `docs`, `refactor`
- Scope examples: `profiles`, `form`, `hs-code`, `pdf`, `billing`, `cleanup`
- PRs must reference a GitHub issue number
- PR titles must not exceed 72 characters
- Every PR touching `api/src/` must include at least one Jest test
- Every PR touching `app/src/` must include at least one Vitest test
