# CLAUDE.md — ShelfLife Technical Specification

## Stack

| Layer | Technology |
|---|---|
| UI Framework | Vue 3 + Quasar (PWA mode) |
| Language | TypeScript (strict) |
| Component Style | `<script setup>` + Composition API |
| State | Pinia (setup-store style) |
| Storage | localStorage (JSON-serialized, versioned keys) |
| Notifications | Web Notifications API |
| Dates | date-fns |
| Build | Vite |
| Package Manager | pnpm |
| Testing | Vitest (unit), Playwright (E2E) |
| Lint | ESLint + Prettier + vue-tsc |
| Build Targets | Web / installable PWA |

## Repo Layout

```
shelf-life/
└── app/
    ├── src/
    │   ├── pages/
    │   │   ├── IndexPage.vue            # pantry list, urgency-sorted
    │   │   ├── AddItemPage.vue          # add / edit a food item
    │   │   ├── UseItUpPage.vue          # recipe suggestions for urgent items
    │   │   ├── DashboardPage.vue        # waste & savings analytics
    │   │   └── SettingsPage.vue         # reminder lead time, export/import, disclaimer
    │   ├── components/
    │   │   ├── ItemCard.vue             # one pantry item, with Used/Wasted actions
    │   │   ├── UrgencyBadge.vue         # expired / expiring / fresh chip
    │   │   ├── ItemForm.vue             # shared add/edit form
    │   │   ├── RecipeCard.vue
    │   │   └── StatTile.vue             # dashboard metric tile
    │   ├── stores/
    │   │   ├── pantry.store.ts          # items CRUD + urgency + use/waste log
    │   │   └── settings.store.ts        # reminder lead time, notification prefs
    │   ├── composables/
    │   │   ├── useExpiry.ts             # days-to-expiry + urgency classification
    │   │   ├── useNotifications.ts      # Web Notifications wrapper + permission flow
    │   │   ├── useRecipeMatch.ts        # match urgent items against bundled recipes
    │   │   └── useStorage.ts            # versioned localStorage read/write
    │   ├── data/
    │   │   └── recipes.ts               # bundled local recipe set (original content)
    │   ├── router/
    │   │   └── index.ts
    │   └── types/
    │       └── index.ts
    ├── tests/
    │   ├── unit/
    │   └── e2e/
    ├── quasar.config.ts
    ├── tsconfig.json
    └── package.json
```

## Running the App

```bash
pnpm install        # install dependencies
pnpm dev            # dev server on port 9038
pnpm build          # production PWA build
pnpm preview        # preview the production build
```

## Testing

```bash
pnpm test:unit             # Vitest
pnpm test:unit --watch
pnpm test:e2e              # Playwright
pnpm test:unit --coverage
```

Rules:
- `useExpiry.ts` (days-to-expiry + urgency classification) must have 100% line coverage — the core of the product
- `useNotifications.ts` must be tested with a mocked `Notification` global
- No test may make a network request — there is no network surface to mock
- Coverage minimum: ≥80% on all composables and stores

## Lint / Format / Type Check

```bash
pnpm lint
pnpm lint:fix
pnpm format
pnpm type-check   # vue-tsc --noEmit
```

## Code Conventions

- TypeScript strict mode — `noImplicitAny`, `strictNullChecks`
- All Vue SFCs use `<script setup lang="ts">`
- Pinia stores use setup-function style
- `async/await` throughout — no `.then()` chains
- No `any` type
- Date math (days-to-expiry, urgency buckets) lives exclusively in `useExpiry.ts` — never inline date comparisons in components
- All dates stored as ISO `YYYY-MM-DD` strings (date-only, no time component) — compare in local time, never with raw `Date` subtraction across DST boundaries
- Notification permission must be requested only after a user gesture, with an explanation shown first; a denied permission must never break the UI
- Money and weight values are user-entered estimates — never hardcode or fetch prices

## Storage Rules

localStorage keys (all prefixed `shelflife:` and version-suffixed):

```
shelflife:items:v1        # PantryItem[]
shelflife:settings:v1     # { reminderLeadDays: number, notificationsEnabled: boolean }
```

```ts
interface PantryItem {
  id: string            // crypto.randomUUID()
  name: string
  category: string      // produce | dairy | meat | bakery | pantry | frozen | other
  quantity: number
  unit: string          // pcs | g | kg | ml | l
  location: string      // fridge | freezer | pantry
  bestBefore: string    // ISO YYYY-MM-DD
  addedAt: string       // ISO datetime
  status: 'active' | 'used' | 'wasted'
  resolvedAt?: string   // ISO datetime when marked used/wasted
  estValue?: number     // optional user estimate, currency-agnostic number
}
```

- IDs are UUIDs (`crypto.randomUUID()`)
- Every write goes through `useStorage.ts` — never call `localStorage` directly from a component or store body
- A failed JSON parse must fall back to an empty collection, never throw
- Bumping a schema requires a new version suffix and a migration — never silently overwrite `v1`

## Environment Variables

| Variable | Purpose | Notes |
|---|---|---|
| `VITE_ENV` | `development` or `production` | Cosmetic only |

No API keys. No backend. No third-party services.

## Protected Paths

```
MISSION.md
CLAUDE.md
FACTORY_RULES.md
tsconfig.json
quasar.config.ts
src/composables/useExpiry.ts        # core logic — human review required
src/composables/useStorage.ts       # storage integrity — human review required
```

## Known Footguns

- **Date-only comparisons**: `bestBefore` is a date, not a timestamp. Subtracting raw `Date` objects across a DST change gives off-by-one results. Use date-fns `differenceInCalendarDays` against the start of the local day.
- **Notification permission**: `Notification.requestPermission()` must follow a user gesture. Calling it on page load is ignored by some browsers and is a poor UX. Gate it behind a Settings toggle.
- **localStorage quota**: localStorage can throw `QuotaExceededError`. `useStorage.ts` must catch write failures and surface a user-facing message rather than crashing.
- **JSON import trust**: imported pantry JSON is untrusted input — validate shape and types before merging; never `eval` or spread it blindly into the store.
- **Quasar PWA caching**: a stale service worker can serve old JS after a deploy. Keep the Quasar PWA `cacheVersioning` defaults; do not hand-roll the service worker.
- **Empty-state math**: the dashboard divides by counts (e.g. % wasted). Guard every denominator — an empty pantry must render zeros, not `NaN`.

## Commit & PR Conventions

```
type(scope): short description

Closes #N
```

Types: `feat`, `fix`, `test`, `chore`, `docs`, `refactor`, `perf`
Scopes: `pantry`, `expiry`, `notifications`, `recipes`, `dashboard`, `settings`, `storage`, `ui`

Examples:
- `feat(expiry): add expiring-soon bucket with configurable lead time`
- `fix(storage): fall back to empty array on corrupt localStorage payload`
- `test(expiry): cover days-to-expiry across a DST boundary`

- PRs must reference an issue (`Closes #N`)
- Max 400 lines changed per PR
</content>
