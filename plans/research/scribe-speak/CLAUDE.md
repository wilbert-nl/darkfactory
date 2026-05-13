# CLAUDE.md — scribe-speak

## Stack

| Layer | Technology |
|---|---|
| Frontend framework | Vue 3 + Quasar (TypeScript, `<script setup>`) |
| Mobile runtime | Capacitor 6 |
| Mobile audio | `@capacitor/microphone` |
| Web audio | `MediaRecorder` API |
| State management | Pinia |
| Backend framework | NestJS (TypeScript strict) |
| Backend database | better-sqlite3 (SQLite) |
| Transcription | Whisper API (OpenAI) or Deepgram — server-side only |
| AI formatting | Anthropic Claude Haiku — server-side only |
| PDF export | PDFKit — server-side |
| DOCX export | `docx` npm package — server-side |
| Payments | Stripe |
| Package manager | pnpm |
| Unit tests | Vitest (frontend), Jest (backend) |
| E2E tests | Playwright |

## Repo Layout

```
scribe-speak/
├── app/                        # Quasar + Capacitor frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── AudioRecorder.vue
│   │   │   ├── TranscriptEditor.vue
│   │   │   ├── TemplateSelector.vue
│   │   │   └── DisclaimerBanner.vue   # PROTECTED — never modify
│   │   ├── pages/
│   │   │   ├── RecordPage.vue
│   │   │   ├── TranscriptsPage.vue
│   │   │   ├── TemplatesPage.vue
│   │   │   └── SettingsPage.vue
│   │   ├── stores/
│   │   │   ├── auth.store.ts
│   │   │   ├── recording.store.ts
│   │   │   └── transcript.store.ts
│   │   ├── composables/
│   │   │   ├── useAudioRecorder.ts
│   │   │   └── useTranscript.ts
│   │   ├── services/
│   │   │   └── api.service.ts         # HTTP client only — no AI calls
│   │   ├── router/
│   │   │   └── index.ts
│   │   └── layouts/
│   │       └── MainLayout.vue
│   ├── capacitor.config.ts
│   ├── quasar.config.ts
│   └── package.json
├── api/                        # NestJS backend
│   ├── src/
│   │   ├── auth/               # PROTECTED PATH
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── jwt.strategy.ts
│   │   ├── transcription/      # PROTECTED PATH
│   │   │   ├── transcription.module.ts
│   │   │   ├── transcription.controller.ts
│   │   │   ├── transcription.service.ts
│   │   │   └── audio-cleanup.service.ts
│   │   ├── export/             # PROTECTED PATH
│   │   │   ├── export.module.ts
│   │   │   ├── export.controller.ts
│   │   │   ├── pdf.service.ts
│   │   │   └── docx.service.ts
│   │   ├── templates/
│   │   │   ├── templates.module.ts
│   │   │   ├── templates.controller.ts
│   │   │   └── templates.service.ts
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   └── users.service.ts
│   │   ├── billing/
│   │   │   ├── billing.module.ts
│   │   │   └── stripe.service.ts
│   │   ├── database/
│   │   │   └── database.service.ts    # better-sqlite3 singleton
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── migrations/
│   ├── jest.config.ts
│   └── package.json
├── e2e/                        # Playwright tests
│   └── tests/
├── .env.example
└── pnpm-workspace.yaml
```

## Running the App

```bash
# Install dependencies
pnpm install

# Run frontend dev server
cd app && pnpm dev

# Run backend dev server
cd api && pnpm dev

# Build native mobile (iOS)
cd app && pnpm build && npx cap sync ios && npx cap open ios

# Build native mobile (Android)
cd app && pnpm build && npx cap sync android && npx cap open android
```

## Testing

```bash
# Frontend unit tests
cd app && pnpm test

# Backend unit + integration tests
cd api && pnpm test

# E2E tests (requires both servers running)
pnpm e2e
```

## Lint / Format / Type Check

```bash
# Frontend
cd app && pnpm lint && pnpm typecheck

# Backend
cd api && pnpm lint && pnpm typecheck

# Format all
pnpm -r format
```

## Code Conventions

- All components use `<script setup lang="ts">` — no Options API
- Props declared with `defineProps<{}>()` — no runtime validators
- Stores use `defineStore` with composition API style
- No `any` types — use `unknown` and narrow explicitly
- All async functions are `async/await` — no raw promise chains
- Backend services are injected via NestJS DI — no manual instantiation
- DTOs validated with `class-validator` decorators on all controller inputs
- Backend responses typed with explicit interface — never `any`
- Disclaimer text is a constant in `DisclaimerBanner.vue` — never interpolated from API or config

## Storage Rules (SQLite)

- All queries use parameterized statements — `db.prepare('SELECT * FROM x WHERE id = ?').get(id)` — never string concatenation
- All transcript content stored encrypted using AES-256 before insert
- `audio_uploads` table has a `deleted_at` column that is set immediately after transcription; a cleanup job verifies and hard-deletes within 60 seconds
- Schema migrations live in `api/migrations/` as numbered SQL files
- No ORM — raw better-sqlite3 with typed wrapper functions in `database.service.ts`

## Environment Variables

| Variable | Service | Description |
|---|---|---|
| `DATABASE_PATH` | API | Absolute path to SQLite database file |
| `JWT_SECRET` | API | JWT signing secret (min 32 chars) |
| `OPENAI_API_KEY` | API | Whisper transcription API key |
| `DEEPGRAM_API_KEY` | API | Deepgram transcription API key (alternative) |
| `ANTHROPIC_API_KEY` | API | Claude Haiku for AI formatting |
| `STRIPE_SECRET_KEY` | API | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | API | Stripe webhook signing secret |
| `TRANSCRIPT_ENCRYPTION_KEY` | API | AES-256 key for transcript encryption at rest |
| `VITE_API_BASE_URL` | App | Backend API base URL |

No API keys other than `VITE_API_BASE_URL` are ever set in the frontend `.env`.

## Deployment

- Frontend: built as PWA + native (Capacitor) — `pnpm build` outputs to `app/dist/`
- Backend: Node.js process — deploy via Docker or PM2 on a VPS
- SQLite database file must be on persistent storage (not ephemeral container storage)
- Audio temp files use `os.tmpdir()` and are cleaned up immediately post-transcription

## Protected Paths

Agents must not modify files in these paths without explicit human approval:

- `api/src/auth/` — JWT auth and guards
- `api/src/transcription/` — Whisper/Deepgram integration and audio cleanup
- `api/src/export/` — PDF and DOCX generation
- `app/src/components/DisclaimerBanner.vue` — disclaimer text and display

## Known Footguns

- `MediaRecorder` outputs vary by browser (WebM on Chrome, OGG on Firefox) — normalize to WAV before sending to Whisper
- `@capacitor/microphone` requires explicit permission prompt on iOS before first use — handle gracefully
- Whisper API has a 25 MB file size limit — chunk long recordings before upload
- better-sqlite3 is synchronous — never call from async NestJS event handlers without wrapping in `runInThread`
- Stripe webhook validation requires the raw request body — do not use `express.json()` globally; exclude the webhook route

## Commit & PR Conventions

- Commits: `feat(transcription): add speaker diarization labels` — `type(scope): description`
- Scopes: `auth`, `transcription`, `export`, `templates`, `billing`, `ui`, `e2e`
- PRs require passing Vitest, Jest, and Playwright suites before merge
- No PR may touch a protected path without a `needs-human` label added by a human reviewer
