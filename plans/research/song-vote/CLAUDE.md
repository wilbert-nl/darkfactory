# CLAUDE.md — song-vote

## Stack

| Layer | Technology |
|---|---|
| Frontend framework | Vue 3 + Quasar (TypeScript, `<script setup>`) |
| State management | Pinia |
| Real-time client | Socket.IO client |
| Backend framework | NestJS (TypeScript strict) |
| Backend database | better-sqlite3 (SQLite) |
| Real-time server | `@nestjs/websockets` + Socket.IO |
| Song search | Spotify Web API or YouTube Data API — server-side proxy |
| Payments | Stripe (tip-to-boost) |
| QR generation | `qrcode` npm package |
| Package manager | pnpm |
| Unit tests | Vitest (frontend), Jest (backend) |
| E2E tests | Playwright |

## Repo Layout

```
song-vote/
├── app/                        # Quasar frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── GuestRequestForm.vue
│   │   │   ├── LiveQueue.vue
│   │   │   ├── SongSearchBox.vue
│   │   │   ├── TipModal.vue
│   │   │   └── QrCodeDisplay.vue
│   │   ├── pages/
│   │   │   ├── GuestPage.vue          # No auth required
│   │   │   ├── BigScreenPage.vue      # Public queue display
│   │   │   ├── DjDashboardPage.vue    # Auth required
│   │   │   ├── EventsPage.vue
│   │   │   └── LoginPage.vue
│   │   ├── stores/
│   │   │   ├── auth.store.ts
│   │   │   ├── queue.store.ts
│   │   │   └── event.store.ts
│   │   ├── composables/
│   │   │   ├── useSocket.ts
│   │   │   └── useGuestSession.ts
│   │   ├── services/
│   │   │   └── api.service.ts
│   │   └── router/
│   │       └── index.ts               # Auth guard on DJ routes only
│   ├── quasar.config.ts
│   └── package.json
├── api/                        # NestJS backend
│   ├── src/
│   │   ├── auth/               # PROTECTED PATH
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── jwt.strategy.ts
│   │   ├── payments/           # PROTECTED PATH
│   │   │   ├── payments.module.ts
│   │   │   ├── stripe.service.ts
│   │   │   └── tip.controller.ts
│   │   ├── events/
│   │   │   ├── events.module.ts
│   │   │   ├── events.controller.ts
│   │   │   ├── events.service.ts
│   │   │   └── rate-limit.service.ts  # PROTECTED FILE
│   │   ├── queue/
│   │   │   ├── queue.module.ts
│   │   │   ├── queue.gateway.ts       # WebSocket gateway
│   │   │   └── queue.service.ts
│   │   ├── songs/
│   │   │   ├── songs.module.ts
│   │   │   ├── songs.controller.ts
│   │   │   └── spotify-proxy.service.ts
│   │   ├── database/
│   │   │   └── database.service.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── migrations/
│   ├── jest.config.ts
│   └── package.json
├── e2e/
│   └── tests/
├── .env.example
└── pnpm-workspace.yaml
```

## Running the App

```bash
pnpm install

# Frontend dev server
cd app && pnpm dev

# Backend dev server (includes WebSocket server)
cd api && pnpm dev
```

## Testing

```bash
cd app && pnpm test          # Vitest
cd api && pnpm test          # Jest
pnpm e2e                     # Playwright
```

## Lint / Format / Type Check

```bash
pnpm -r lint && pnpm -r typecheck && pnpm -r format
```

## Code Conventions

- Guest session ID is a UUID generated client-side and stored in `sessionStorage` — never in a cookie with `HttpOnly` (guests must be anonymous)
- DJ auth uses JWT stored in `localStorage` with 7-day expiry
- WebSocket gateway authenticates DJ connections via JWT in handshake `auth` object; guest connections are unauthenticated
- All Spotify/YouTube search calls go through `songs.controller.ts` — never called from frontend directly
- Guest request form never collects name, email, or any PII
- `rate-limit.service.ts` enforces max 500 concurrent guests — this is the only file that manages the cap

## Storage Rules (SQLite)

- All queries use parameterized `db.prepare()` statements — never string interpolation
- Guest session IDs stored as UUIDs — no linkage to any identity
- Event passcodes stored as bcrypt hashes — never plaintext
- Schema migrations in `api/migrations/` as numbered SQL files

## Environment Variables

| Variable | Service | Description |
|---|---|---|
| `DATABASE_PATH` | API | Absolute path to SQLite file |
| `JWT_SECRET` | API | DJ JWT signing secret |
| `SPOTIFY_CLIENT_ID` | API | Spotify API client ID |
| `SPOTIFY_CLIENT_SECRET` | API | Spotify API client secret |
| `YOUTUBE_API_KEY` | API | YouTube Data API key (alternative) |
| `STRIPE_SECRET_KEY` | API | Stripe secret for tip payments |
| `STRIPE_WEBHOOK_SECRET` | API | Stripe webhook signing secret |
| `VITE_API_BASE_URL` | App | Backend HTTP URL |
| `VITE_WS_URL` | App | WebSocket server URL |

No Spotify, YouTube, or Stripe keys are ever set in the frontend `.env`.

## Deployment

- Stateless NestJS process — SQLite file on persistent volume
- WebSocket server runs on the same NestJS port — no separate process
- Frontend built as SPA — deploy to Cloudflare Pages or similar CDN

## Protected Paths

- `api/src/auth/` — DJ authentication and JWT
- `api/src/payments/` — Stripe tip processing
- `api/src/events/rate-limit.service.ts` — 500-guest hard cap

## Known Footguns

- Socket.IO CORS must be explicitly configured to match the frontend origin — do not use `origin: '*'` in production
- Spotify access tokens expire in 3600s — use client credentials flow with auto-refresh in `spotify-proxy.service.ts`
- `db.prepare()` results are synchronous — wrap in a worker thread if query volume spikes under WebSocket load
- Stripe tip webhooks arrive after the client payment — queue updates are applied after webhook confirmation, not after client payment intent creation

## Commit & PR Conventions

- Commits: `feat(queue): add pin-to-top DJ action`
- Scopes: `auth`, `payments`, `queue`, `events`, `songs`, `ui`, `e2e`
- PRs touching protected paths require `needs-human` label before merge
