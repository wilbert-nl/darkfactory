# CLAUDE.md — CommentsReader Technical Specification

## Stack

| Layer | Technology |
|---|---|
| UI Framework | Vue 3 + Quasar (extension mode) |
| Language | TypeScript (strict) |
| Component Style | `<script setup>` + Composition API |
| TTS Engine | Web Speech API (`SpeechSynthesisUtterance`) |
| Storage | `chrome.storage.local` (settings, bookmarks), `localStorage` (fallback for dev) |
| State | Pinia |
| Package Manager | pnpm |
| Testing | Vitest (unit), Playwright (E2E via `chrome` test channel) |
| Lint | ESLint + Prettier + vue-tsc |
| Build Target | Chrome Extension Manifest V3, Firefox MV3-compatible |

## Repo Layout

```
comments-reader/
├── src/
│   ├── background/         # service-worker.ts (MV3 background)
│   ├── content/            # content.ts — injected into youtube.com pages
│   │   ├── dom-reader.ts   # reads comment nodes from YouTube DOM
│   │   ├── sentiment.ts    # lightweight client-side sentiment scoring
│   │   └── injector.ts     # injects play button into comment section
│   ├── popup/              # Vue 3 + Quasar popup UI
│   │   ├── App.vue
│   │   ├── pages/
│   │   │   ├── PlaybackPage.vue
│   │   │   └── SettingsPage.vue
│   │   ├── stores/
│   │   │   ├── playback.store.ts
│   │   │   └── settings.store.ts
│   │   └── main.ts
│   ├── shared/
│   │   ├── types.ts        # shared interfaces
│   │   └── constants.ts
├── public/
│   ├── manifest.json       # MV3 manifest — DO NOT auto-generate
│   └── icons/
├── tests/
│   ├── unit/               # Vitest unit tests
│   └── e2e/                # Playwright extension tests
├── quasar.config.ts
├── tsconfig.json
├── .eslintrc.cjs
├── .prettierrc
└── package.json
```

## Running the App

```bash
# Install dependencies
pnpm install

# Build extension (development, watch mode)
pnpm dev

# Build extension (production)
pnpm build

# Load in Chrome: go to chrome://extensions → Load unpacked → select dist/

# Run popup in browser (dev preview without extension context)
pnpm dev:popup

# Run unit tests
pnpm test

# Run E2E tests (requires Chrome installed)
pnpm test:e2e
```

## Testing

```bash
# Unit tests (Vitest)
pnpm test:unit          # run once
pnpm test:unit --watch  # watch mode

# E2E tests (Playwright with chrome channel)
pnpm test:e2e

# Type check
pnpm type-check
```

Rules:
- Unit tests cover: `dom-reader.ts`, `sentiment.ts`, `playback.store.ts`, `settings.store.ts`
- E2E tests use Playwright's `chrome` channel with `--load-extension` flag
- Every new feature must have a corresponding unit test
- Minimum coverage: 70% line coverage on `src/content/` and `src/popup/stores/`
- Tests must not make network requests

## Lint / Format / Type Check

```bash
pnpm lint          # ESLint
pnpm lint:fix      # ESLint auto-fix
pnpm format        # Prettier
pnpm type-check    # vue-tsc --noEmit
```

All three must pass with zero errors before a PR is merged.

## Code Conventions

- TypeScript strict mode — `noImplicitAny: true`, `strictNullChecks: true`
- All Vue components use `<script setup lang="ts">`
- Pinia stores use `defineStore` with setup-function style (not options API)
- `async/await` over `.then()` chains
- No `any` type — use `unknown` and narrow, or define a proper interface
- DOM reading: always check `element` is not null before accessing properties
- Content script: wrap all DOM access in `try/catch` — YouTube DOM is volatile
- Service worker: keep stateless — all state lives in `chrome.storage.local`
- No inline event handlers in HTML — use Vue's `@event` syntax

## Storage Rules

```typescript
// Settings schema (chrome.storage.local)
interface ExtensionSettings {
  voice: string;          // SpeechSynthesis voice name
  rate: number;           // 0.5–2.0
  pitch: number;          // 0.5–2.0
  sentimentSort: boolean; // group by sentiment
  skipNegative: boolean;  // auto-skip negative comments
}

// Playback queue (in-memory only, not persisted)
interface PlaybackItem {
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  index: number;
}
```

- Use `chrome.storage.local.get/set` with typed wrappers — never raw JSON stringify
- Playback queue is in-memory only and reset on page navigation
- Never store comment text to disk or storage — only settings

## Environment Variables

| Variable | Purpose | Notes |
|---|---|---|
| `VITE_ENV` | `development` or `production` | Controls localStorage fallback in dev |

No API keys. No external services.

## Protected Paths

Agents must never modify these files:

- `MISSION.md`
- `CLAUDE.md`
- `FACTORY_RULES.md`
- `public/manifest.json` — manifest changes require human review
- `public/icons/` — brand assets
- `tsconfig.json` — strict settings must not be loosened

## Known Footguns

- **YouTube DOM is lazy-loaded**: Comment nodes may not exist on page load. Use `MutationObserver` to watch for comment section insertion — do not use `document.querySelector` at page load.
- **MV3 service worker lifespan**: The background service worker can be terminated at any time. Never store critical state there — use `chrome.storage.local`.
- **SpeechSynthesis voice list is async**: `speechSynthesis.getVoices()` returns empty array on first call in many browsers. Listen to `voiceschanged` event.
- **Quasar extension mode quirks**: Quasar's `bex` (browser extension) mode wraps the popup — be careful with `useQuasar()` calls inside content scripts (they run without Quasar context).
- **Firefox MV3 partial support**: Some MV3 APIs behave differently in Firefox. Test both browsers. Background scripts use `browser` namespace — use `webextension-polyfill`.
- **CSP in MV3**: Inline scripts and `eval` are forbidden. No dynamic `import()` from extension pages.

## Commit & PR Conventions

```
type(scope): short description

Closes #N
```

Types: `feat`, `fix`, `test`, `chore`, `docs`, `refactor`, `perf`
Scopes: `content`, `popup`, `background`, `tts`, `sentiment`, `build`

Examples:
- `feat(tts): add speed control slider to popup`
- `fix(content): handle YouTube DOM mutation for comments section`
- `test(sentiment): add edge cases for empty comment strings`

- PRs must reference an issue number (`Closes #N`)
- PR title must match commit convention
- Max 400 lines changed per PR (split large features)
