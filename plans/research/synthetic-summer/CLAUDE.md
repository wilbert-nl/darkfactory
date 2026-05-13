# CLAUDE.md — synthetic-summer

## Stack

| Layer | Technology |
|---|---|
| Frontend framework | Vue 3 + Quasar (TypeScript, `<script setup>`) |
| State management | Pinia |
| Music (Spotify) | Spotify Web Playback SDK (frontend) + PKCE OAuth (backend token exchange) |
| Music (Apple) | MusicKit JS (frontend) + developer token from backend |
| Backend framework | NestJS (TypeScript strict) |
| Backend database | better-sqlite3 (SQLite) |
| Payments | Stripe |
| Package manager | pnpm |
| Unit tests | Vitest (frontend), Jest (backend) |
| E2E tests | Playwright |

## Repo Layout

```
synthetic-summer/
├── app/                        # Quasar frontend (web only)
│   ├── src/
│   │   ├── components/
│   │   │   ├── SoundscapePlayer.vue
│   │   │   ├── LightOverlay.vue       # CSS warm-light overlay
│   │   │   ├── MoodLogger.vue
│   │   │   ├── PomodoroTimer.vue
│   │   │   ├── ContentFeed.vue
│   │   │   ├── WellnessPlan.vue
│   │   │   └── DisclaimerBanner.vue   # PROTECTED — never modify
│   │   ├── pages/
│   │   │   ├── HomePage.vue
│   │   │   ├── SoundscapesPage.vue
│   │   │   ├── MoodPage.vue
│   │   │   ├── WellnessPage.vue
│   │   │   ├── PomodoroPage.vue
│   │   │   └── SettingsPage.vue
│   │   ├── stores/
│   │   │   ├── auth.store.ts
│   │   │   ├── soundscape.store.ts
│   │   │   ├── mood.store.ts          # Local-first; sync for Pro
│   │   │   ├── spotify.store.ts
│   │   │   └── wellness.store.ts
│   │   ├── composables/
│   │   │   ├── useSoundscape.ts
│   │   │   ├── useMoodSync.ts
│   │   │   └── useSpotify.ts
│   │   ├── services/
│   │   │   └── api.service.ts
│   │   ├── assets/
│   │   │   └── audio/                 # Static soundscape files
│   │   └── router/
│   │       └── index.ts
│   ├── quasar.config.ts
│   └── package.json
├── api/                        # NestJS backend
│   ├── src/
│   │   ├── auth/               # PROTECTED PATH
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── jwt.strategy.ts
│   │   ├── spotify/            # PROTECTED PATH
│   │   │   ├── spotify.module.ts
│   │   │   ├── spotify.controller.ts  # PKCE callback + token exchange
│   │   │   └── spotify.service.ts
│   │   ├── apple-music/        # PROTECTED PATH
│   │   │   ├── apple-music.module.ts
│   │   │   └── apple-music.service.ts # Developer token generation
│   │   ├── mood/
│   │   │   ├── mood.module.ts
│   │   │   ├── mood.controller.ts
│   │   │   └── mood.service.ts        # Sync endpoint for Pro users
│   │   ├── wellness/
│   │   │   ├── wellness.module.ts
│   │   │   └── wellness.service.ts
│   │   ├── billing/
│   │   │   ├── billing.module.ts
│   │   │   └── stripe.service.ts
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
cd app && pnpm dev       # Frontend on port 9000
cd api && pnpm dev       # Backend on port 3000
```

## Testing

```bash
cd app && pnpm test
cd api && pnpm test
pnpm e2e
```

## Lint / Format / Type Check

```bash
pnpm -r lint && pnpm -r typecheck && pnpm -r format
```

## Code Conventions

- Mood data is stored in IndexedDB locally via a Pinia plugin — synced to backend only for Pro users on explicit user action
- Spotify PKCE flow: frontend generates code verifier/challenge, redirects to Spotify, backend handles callback and stores tokens encrypted — frontend never sees client secret
- Apple Music developer token is fetched from `/api/apple-music/developer-token` on app load — never bundled
- Soundscape `<audio>` elements use `preload="none"` to avoid unnecessary bandwidth
- `LightOverlay.vue` uses CSS `mix-blend-mode: multiply` with warm amber color — no canvas or WebGL
- Disclaimer in `DisclaimerBanner.vue` is a static string constant — never fetched from config or API

## Storage Rules (SQLite)

- Mood entries stored with `user_id` FK — encrypted content column (AES-256)
- All queries use `db.prepare()` parameterized statements
- Spotify and Apple Music tokens stored encrypted in `oauth_tokens` table
- Schema migrations in `api/migrations/`

## Environment Variables

| Variable | Service | Description |
|---|---|---|
| `DATABASE_PATH` | API | Absolute path to SQLite file |
| `JWT_SECRET` | API | JWT signing secret |
| `SPOTIFY_CLIENT_ID` | API | Spotify app client ID |
| `SPOTIFY_CLIENT_SECRET` | API | Spotify app client secret |
| `SPOTIFY_REDIRECT_URI` | API | PKCE OAuth callback URL |
| `APPLE_MUSIC_TEAM_ID` | API | Apple developer team ID |
| `APPLE_MUSIC_KEY_ID` | API | MusicKit key ID |
| `APPLE_MUSIC_PRIVATE_KEY` | API | MusicKit private key (PEM) |
| `MOOD_ENCRYPTION_KEY` | API | AES-256 key for mood data |
| `STRIPE_SECRET_KEY` | API | Stripe secret |
| `STRIPE_WEBHOOK_SECRET` | API | Stripe webhook secret |
| `VITE_API_BASE_URL` | App | Backend URL |

No Spotify client secret, Apple Music private key, or Stripe keys appear in the frontend `.env`.

## Deployment

- SPA deployed to CDN (Cloudflare Pages)
- Static audio files served from the same CDN path (`/assets/audio/`)
- NestJS on VPS or Docker with persistent SQLite volume

## Protected Paths

- `api/src/auth/` — JWT auth
- `api/src/spotify/` — PKCE OAuth token exchange
- `api/src/apple-music/` — developer token generation
- `app/src/components/DisclaimerBanner.vue` — wellness disclaimer

## Known Footguns

- Spotify Web Playback SDK requires a Spotify Premium account — display a clear error for non-Premium users rather than a silent failure
- Apple MusicKit JS must be loaded from Apple's CDN — do not bundle it
- PKCE code verifier must be stored in `sessionStorage` (not `localStorage`) and cleared after token exchange
- Mood sync must be idempotent — use `INSERT OR REPLACE` with client-generated UUIDs to handle offline-first duplicates

## Commit & PR Conventions

- Commits: `feat(mood): add local-first mood log with Pro sync`
- Scopes: `auth`, `spotify`, `apple-music`, `mood`, `wellness`, `soundscape`, `ui`, `billing`, `e2e`
- PRs touching protected paths require `needs-human` label
