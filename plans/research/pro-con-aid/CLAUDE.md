# CLAUDE.md — ProConAid Technical Specification

## Stack

| Layer | Technology |
|---|---|
| UI Framework | Vue 3 + Quasar (SPA/PWA mode) |
| Language | TypeScript (strict) |
| Component Style | `<script setup>` + Composition API |
| State | Pinia |
| Storage | sql.js (SQLite in WebAssembly) |
| AI | Claude API (Anthropic SDK, direct from frontend — dev only) |
| PDF Export | jsPDF + jsPDF-AutoTable |
| Share | URL fragment encoding (LZ-string + base64) |
| Package Manager | pnpm |
| Testing | Vitest (unit), Playwright (E2E) |
| Lint | ESLint + Prettier + vue-tsc |

## Repo Layout

```
pro-con-aid/
├── src/
│   ├── pages/
│   │   ├── IndexPage.vue              # dashboard — list of decisions
│   │   ├── DecisionPage.vue           # main canvas (options × criteria)
│   │   ├── SharedPage.vue             # read-only view from shared URL
│   │   └── JournalPage.vue            # decision outcome journal
│   ├── components/
│   │   ├── DecisionCanvas/
│   │   │   ├── OptionsGrid.vue        # options × criteria matrix
│   │   │   ├── CriterionRow.vue       # criterion + weight + scores
│   │   │   ├── ScoreCell.vue
│   │   │   ├── WeightControl.vue
│   │   │   └── TotalBar.vue           # weighted score bar chart per option
│   │   ├── DevilsAdvocatePanel.vue    # AI critique panel
│   │   ├── ShareDialog.vue
│   │   └── JournalEntry.vue
│   ├── stores/
│   │   ├── decisions.store.ts         # all decision CRUD + active canvas state
│   │   ├── journal.store.ts           # outcome journal entries
│   │   ├── ui.store.ts
│   │   └── pro.store.ts              # free/pro tier state
│   ├── composables/
│   │   ├── useDatabase.ts            # sql.js init + query wrapper
│   │   ├── useDevilsAdvocate.ts      # Claude API call for critique
│   │   ├── useShareLink.ts           # encode/decode URL fragment
│   │   └── usePdfExport.ts           # jsPDF decision report
│   ├── router/
│   │   └── index.ts
│   ├── boot/
│   │   └── db.ts
│   └── types/
│       └── index.ts
├── public/
│   └── sql-wasm.wasm
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

# Copy WASM binary
cp node_modules/sql.js/dist/sql-wasm.wasm public/

# Dev server
pnpm dev         # http://localhost:9000

# Build PWA
pnpm build

# Preview
pnpm preview
```

## Testing

```bash
pnpm test:unit           # Vitest
pnpm test:unit --watch
pnpm test:e2e            # Playwright
pnpm test:unit --coverage
```

Rules:
- Weighted score calculation must have 100% line coverage — core scoring logic is safety-critical for correctness
- `useShareLink.ts` encode/decode must be tested with round-trip assertions
- `useDevilsAdvocate.ts` must mock the Claude API — never call the real API in tests
- Pro tier gate must be tested: free tier blocks decisions #4+, blocks AI Devil's Advocate
- E2E: create decision, add options, add criteria, score, view totals, generate share link, open share link in new tab
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
- `async/await` throughout
- No `any` type
- All SQL queries use parameterized statements — no string interpolation
- AI calls isolated in `useDevilsAdvocate.ts` — never call `Anthropic` directly from components
- Share link must use `#data=` URL fragment — never `?data=` query params
- Pro tier: always check `proStore.isPro` — never hardcode `true`
- Devil's Advocate must be user-triggered only — never call on load or on score change automatically

## Storage Rules

```sql
-- Decisions
CREATE TABLE decisions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',  -- 'active' | 'made' | 'archived'
  chosen_option_id TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Options (columns)
CREATE TABLE options (
  id TEXT PRIMARY KEY,
  decision_id TEXT NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER NOT NULL
);

-- Criteria (rows)
CREATE TABLE criteria (
  id TEXT PRIMARY KEY,
  decision_id TEXT NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  weight REAL NOT NULL DEFAULT 1.0,   -- importance weight 0.1–5.0
  position INTEGER NOT NULL
);

-- Scores (cells)
CREATE TABLE scores (
  option_id TEXT NOT NULL REFERENCES options(id) ON DELETE CASCADE,
  criterion_id TEXT NOT NULL REFERENCES criteria(id) ON DELETE CASCADE,
  score REAL,                          -- 0–10, nullable = not yet scored
  PRIMARY KEY (option_id, criterion_id)
);

-- Outcome journal
CREATE TABLE journal_entries (
  id TEXT PRIMARY KEY,
  decision_id TEXT NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  logged_at INTEGER NOT NULL,
  what_happened TEXT NOT NULL,
  satisfaction INTEGER,               -- 1–5 rating of outcome quality
  lessons TEXT
);
```

- All queries use parameterized placeholders
- IDs are UUIDs (`crypto.randomUUID()`)
- Weights: REAL 0.1–5.0; Scores: REAL 0–10, nullable

## Environment Variables

| Variable | Purpose | Notes |
|---|---|---|
| `VITE_ANTHROPIC_API_KEY` | Claude API key for Devil's Advocate | Dev only — TODO: use proxy in prod |
| `VITE_ENV` | `development` or `production` | Gates direct API key usage |

## Protected Paths

```
MISSION.md
CLAUDE.md
FACTORY_RULES.md
public/sql-wasm.wasm
tsconfig.json
.env
.env.local
```

## Known Footguns

- **sql.js WASM**: Must be copied to `public/` after `pnpm install`. If missing, DB init silently fails. Add to `postinstall` script.
- **LZ-string URL length**: Large decisions (10 options × 20 criteria) will approach URL length limits. Show a warning to the user if compressed payload exceeds 1800 chars. Suggest PDF export instead of share link for very large decisions.
- **Weighted score formula**: `totalScore = sum(criterion.weight * cell.score) / sum(criterion.weight)`. Do not divide by count — weights are relative, not absolute. Document and test this formula explicitly.
- **Devil's Advocate prompt**: Send the decision title, the leading option's name and scores, and the criteria list. Do not send all options' raw scores — it makes the prompt unnecessarily long and may bias the response.
- **Claude API in browser**: The Anthropic SDK works in browser environments but exposes the API key in the bundle. This is acceptable in dev only. The `VITE_ENV` check must gate the key — if `production`, throw an error directing users to configure a proxy.
- **jsPDF table for wide matrices**: Matrices wider than 8 options need landscape PDF orientation. Detect column count and switch automatically.

## Commit & PR Conventions

```
type(scope): short description

Closes #N
```

Types: `feat`, `fix`, `test`, `chore`, `docs`, `refactor`, `perf`
Scopes: `canvas`, `scoring`, `ai`, `share`, `pdf`, `journal`, `db`, `pro`, `ui`

Examples:
- `feat(ai): implement Devil's Advocate panel with Claude API critique`
- `fix(scoring): correct weighted average formula to normalize by weight sum`
- `test(share): add round-trip encode/decode tests with unicode decision titles`

- PRs must reference an issue (`Closes #N`)
- Max 400 lines changed per PR
