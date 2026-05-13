# CLAUDE.md — CompareTable Technical Specification

## Stack

| Layer | Technology |
|---|---|
| UI Framework | Vue 3 + Quasar (SPA/PWA mode) |
| Language | TypeScript (strict) |
| Component Style | `<script setup>` + Composition API |
| State | Pinia |
| Storage | sql.js (SQLite in WebAssembly, browser) |
| AI | Claude API (Anthropic SDK, direct from frontend — dev only) |
| PDF Export | jsPDF + jsPDF-AutoTable |
| Share | URL fragment encoding (LZ-string compression + base64) |
| Package Manager | pnpm |
| Testing | Vitest (unit), Playwright (E2E) |
| Lint | ESLint + Prettier + vue-tsc |

## Repo Layout

```
compare-table/
├── src/
│   ├── pages/
│   │   ├── IndexPage.vue         # dashboard — list of comparisons
│   │   ├── ComparisonPage.vue    # main editor (items × criteria table)
│   │   ├── SharedPage.vue        # read-only view from shared URL
│   │   └── TemplatesPage.vue     # pre-built templates browser
│   ├── components/
│   │   ├── ComparisonTable/
│   │   │   ├── TableGrid.vue     # items × criteria grid
│   │   │   ├── WeightSlider.vue  # per-criterion weight control
│   │   │   ├── ScoreCell.vue     # individual cell with score input
│   │   │   └── TotalRow.vue      # weighted score totals
│   │   ├── AiCriteriaPanel.vue   # AI suggestions panel
│   │   └── ShareDialog.vue
│   ├── stores/
│   │   ├── comparisons.store.ts  # all comparison CRUD + active state
│   │   ├── ui.store.ts           # modal state, loading flags
│   │   └── pro.store.ts          # free/pro tier state
│   ├── composables/
│   │   ├── useDatabase.ts        # sql.js init + query wrapper
│   │   ├── useAiCriteria.ts      # Claude API call for criteria suggestions
│   │   ├── useShareLink.ts       # encode/decode URL fragment
│   │   └── usePdfExport.ts       # jsPDF export logic
│   ├── data/
│   │   └── templates.ts          # pre-built comparison templates
│   ├── types/
│   │   └── index.ts              # shared TypeScript interfaces
│   ├── router/
│   │   └── index.ts
│   └── boot/
│       └── db.ts                 # sql.js database init boot file
├── public/
│   └── sql-wasm.wasm             # sql.js WASM binary (copy from node_modules)
├── tests/
│   ├── unit/
│   └── e2e/
├── quasar.config.ts
├── tsconfig.json
├── .env.example
└── package.json
```

## Running the App

```bash
# Install dependencies
pnpm install

# Copy WASM binary (required after install)
pnpm postinstall  # or: cp node_modules/sql.js/dist/sql-wasm.wasm public/

# Dev server
pnpm dev         # http://localhost:9000

# Build PWA
pnpm build

# Preview production build
pnpm preview
```

## Testing

```bash
pnpm test:unit          # Vitest unit tests
pnpm test:unit --watch  # watch mode
pnpm test:e2e           # Playwright E2E

# Coverage
pnpm test:unit --coverage
```

Rules:
- Unit tests required for: all composables, all stores, `templates.ts`, `useShareLink.ts` encode/decode
- E2E tests cover: creating a comparison, adding items/criteria, scoring, share link round-trip, PDF export button
- AI criteria tests must mock the Claude API — never call the real API in tests
- Coverage minimum: 75% line coverage on `src/composables/` and `src/stores/`

## Lint / Format / Type Check

```bash
pnpm lint          # ESLint
pnpm lint:fix      # auto-fix
pnpm format        # Prettier
pnpm type-check    # vue-tsc --noEmit
```

## Code Conventions

- TypeScript strict mode — `noImplicitAny`, `strictNullChecks`
- All Vue SFCs use `<script setup lang="ts">`
- Pinia stores use setup-function style (not options API)
- `async/await` throughout — no `.then()` chains
- No `any` type — use `unknown` + narrowing or define interfaces
- All database queries use parameterized statements — no string interpolation in SQL
- AI calls are wrapped in `useAiCriteria.ts` composable — never call `Anthropic` client directly from components
- Share link data must be URL fragment (`#data=...`) — never use `?data=` query params
- Pro tier check: always call `proStore.isPro` before unlocking features — never hardcode `true`

## Storage Rules

```sql
-- comparisons table
CREATE TABLE comparisons (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- items (columns)
CREATE TABLE items (
  id TEXT PRIMARY KEY,
  comparison_id TEXT NOT NULL REFERENCES comparisons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER NOT NULL
);

-- criteria (rows)
CREATE TABLE criteria (
  id TEXT PRIMARY KEY,
  comparison_id TEXT NOT NULL REFERENCES comparisons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  weight REAL NOT NULL DEFAULT 1.0,
  position INTEGER NOT NULL
);

-- scores (cells)
CREATE TABLE scores (
  item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  criterion_id TEXT NOT NULL REFERENCES criteria(id) ON DELETE CASCADE,
  score REAL,
  PRIMARY KEY (item_id, criterion_id)
);
```

- All queries use parameterized placeholders — never string concatenation
- IDs are UUIDs (use `crypto.randomUUID()`)
- Weights stored as `REAL` (0.1–5.0)
- Scores stored as `REAL` (0–10), nullable (empty cell)
- Database initialized in `src/boot/db.ts`, accessed via `useDatabase()` composable

## Environment Variables

| Variable | Purpose | Notes |
|---|---|---|
| `VITE_ANTHROPIC_API_KEY` | Claude API key for AI criteria suggestions | Dev only — never expose in prod; use backend proxy in production |
| `VITE_ENV` | `development` or `production` | Gates direct API key usage |

## Protected Paths

Agents must never modify:

- `MISSION.md`
- `CLAUDE.md`
- `FACTORY_RULES.md`
- `public/sql-wasm.wasm`
- `tsconfig.json` (strict settings)
- `.env` / `.env.local` (never commit)

## Known Footguns

- **sql.js WASM loading**: The `.wasm` file must be served as a static asset from `/public/`. If the WASM binary is missing, the database will silently fail to initialize. Always run the postinstall copy step.
- **sql.js is synchronous**: Unlike native SQLite, sql.js runs synchronously in the main thread. For large datasets, move to a Web Worker. Current data size is expected to be small, so main-thread is acceptable for MVP.
- **LZ-string share links**: Very large comparisons will exceed URL length limits (~2000 chars for safe cross-browser). Limit: 10 items × 20 criteria. Warn the user if the comparison exceeds this.
- **jsPDF table layout**: jsPDF-AutoTable requires explicit column widths for wide tables. Tables wider than 10 columns need landscape orientation.
- **Claude API CORS**: Direct browser calls to the Anthropic API require the API key in the frontend bundle — only acceptable in dev. Always add the `TODO: use proxy in prod` comment.
- **Quasar PWA caching**: The WASM file must be included in the PWA's Workbox cache manifest — otherwise offline mode breaks.

## Commit & PR Conventions

```
type(scope): short description

Closes #N
```

Types: `feat`, `fix`, `test`, `chore`, `docs`, `refactor`, `perf`
Scopes: `table`, `ai`, `share`, `pdf`, `db`, `templates`, `pro`, `ui`

Examples:
- `feat(table): add weighted score total row with rank highlighting`
- `fix(share): handle URL decode failure gracefully with error state`
- `test(db): add parameterized query tests for score CRUD`

- PRs must reference an issue (`Closes #N`)
- Max 400 lines changed per PR
