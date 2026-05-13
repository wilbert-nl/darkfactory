# CLAUDE.md — OnlineOrganizer Technical Specification

## Stack

| Layer | Technology |
|---|---|
| UI Framework | Vue 3 + Quasar (SPA/PWA mode) |
| Language | TypeScript (strict) |
| Component Style | `<script setup>` + Composition API |
| State | Pinia |
| Storage (Web) | sql.js (SQLite in WebAssembly) |
| Storage (Mobile) | @capacitor-community/sqlite |
| PDF Export | jsPDF + jsPDF-AutoTable |
| Theming | CSS custom properties (no hardcoded colors in component styles) |
| Package Manager | pnpm |
| Testing | Vitest (unit), Playwright (E2E) |
| Lint | ESLint + Prettier + vue-tsc |

## Repo Layout

```
online-organizer/
├── src/
│   ├── modules/
│   │   ├── planner/
│   │   │   ├── pages/PlannerPage.vue       # daily time-block view
│   │   │   ├── components/
│   │   │   │   ├── TimeBlockGrid.vue       # hour-by-hour drag-drop grid
│   │   │   │   ├── TimeBlock.vue           # individual block
│   │   │   │   └── DayNav.vue              # previous/next day navigation
│   │   │   └── stores/planner.store.ts
│   │   ├── tasks/
│   │   │   ├── pages/TasksPage.vue
│   │   │   ├── components/
│   │   │   │   ├── TaskList.vue
│   │   │   │   ├── TaskItem.vue
│   │   │   │   └── ProjectSidebar.vue
│   │   │   └── stores/tasks.store.ts
│   │   └── habits/
│   │       ├── pages/HabitsPage.vue
│   │       ├── components/
│   │       │   ├── HabitRow.vue
│   │       │   ├── StreakBadge.vue
│   │       │   └── HeatmapChart.vue        # contribution heatmap
│   │       └── stores/habits.store.ts
│   ├── composables/
│   │   ├── useDatabase.ts                  # sql.js + Capacitor SQLite wrapper
│   │   ├── usePdfExport.ts                 # jsPDF daily/weekly/monthly layouts
│   │   ├── usePlatform.ts                  # detect web vs Capacitor
│   │   └── useTheme.ts                     # apply CSS custom property theme
│   ├── stores/
│   │   ├── theme.store.ts                  # active theme, custom theme definitions
│   │   └── pro.store.ts                    # free/pro tier state
│   ├── pages/
│   │   ├── DashboardPage.vue
│   │   └── SettingsPage.vue
│   ├── themes/
│   │   ├── minimal.ts                      # CSS custom property token sets
│   │   ├── retro-dark.ts
│   │   ├── paper.ts
│   │   └── dark-academia.ts
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
- `usePdfExport.ts`: unit tests verify layout structure (page dimensions, section headers) — mock jsPDF
- `useTheme.ts`: verify CSS custom properties are applied correctly for each built-in theme
- Habit streak calculation must have 100% line coverage (edge cases: streak reset, leap year, today not yet logged)
- Recurring task generation must have 100% line coverage
- Pro tier gate: test that free tier blocks beyond project 1 and non-minimal themes
- E2E: create a time block, create a task, mark a habit, export PDF (verify download triggered)
- Coverage minimum: ≥80% on all composables and stores

## Lint / Format / Type Check

```bash
pnpm lint
pnpm lint:fix
pnpm format
pnpm type-check   # vue-tsc --noEmit
```

## Code Conventions

- TypeScript strict mode
- All Vue SFCs use `<script setup lang="ts">`
- Pinia stores use setup-function style
- `async/await` throughout — no `.then()` chains
- No `any` type
- No hardcoded hex/rgb colors in Vue component `<style>` blocks — only CSS custom property references (`var(--color-primary)`)
- Theme tokens defined in `src/themes/*.ts` as typed objects, applied via `useTheme.ts`
- Pro tier: always check `proStore.isPro` before enabling paid features — never hardcode `true`
- All SQL queries use parameterized statements

## Storage Rules

```sql
-- Time blocks
CREATE TABLE time_blocks (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,           -- ISO 8601 date (YYYY-MM-DD)
  hour INTEGER NOT NULL,        -- 0–23
  duration INTEGER NOT NULL DEFAULT 1,  -- in hours
  title TEXT NOT NULL,
  note TEXT,
  color TEXT                    -- CSS color token name
);

-- Tasks
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  due_date TEXT,                -- ISO 8601 date or NULL
  priority INTEGER NOT NULL DEFAULT 0,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  tags TEXT,                    -- JSON array
  recurrence TEXT,              -- JSON rule or NULL
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT,
  created_at INTEGER NOT NULL
);

-- Habits
CREATE TABLE habits (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  created_at INTEGER NOT NULL,
  archived INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE habit_logs (
  habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date TEXT NOT NULL,           -- ISO 8601 date
  PRIMARY KEY (habit_id, date)
);
```

- All queries parameterized
- IDs are UUIDs (`crypto.randomUUID()`)
- Dates stored as ISO 8601 strings (not Unix timestamps) for readability
- Habit logs are a simple presence table — a row means "done that day"

## Environment Variables

| Variable | Purpose | Notes |
|---|---|---|
| `VITE_ENV` | `development` or `production` | Enables dev helpers |

No API keys. No external services.

## Protected Paths

```
MISSION.md
CLAUDE.md
FACTORY_RULES.md
public/sql-wasm.wasm
tsconfig.json
src/themes/           # theme token files — changes affect all users; human review required
```

## Known Footguns

- **jsPDF landscape mode**: Weekly and monthly PDF layouts need `orientation: 'landscape'` in jsPDF constructor. Forgetting this makes the table overflow the page.
- **Drag-and-drop time blocks**: Quasar doesn't have a built-in drag-to-resize. Use the HTML5 Drag API with `dragover` + `drop` events. Do not reach for a heavy DnD library.
- **Habit streak calculation edge case**: A streak is broken if a habit is not logged on a calendar day (not a 24-hour window). "Today" is not broken if today hasn't been logged yet — only yesterday and earlier. Get this logic right in `habits.store.ts`.
- **Recurring task generation**: Generate recurring task instances on-demand (when the planner view loads) rather than pre-generating and storing all future instances. Storing thousands of future tasks will bloat the database.
- **CSS custom properties + Quasar**: Quasar uses its own CSS variable namespace (`--q-*`). The theme engine must not conflict with Quasar variables. Use a project-specific prefix like `--oo-color-primary`.
- **sql.js in PWA**: The WASM file must be in the Workbox cache manifest for offline to work. Also: sql.js loads asynchronously — gate any DB call on the boot file's completion promise.

## Commit & PR Conventions

```
type(scope): short description

Closes #N
```

Types: `feat`, `fix`, `test`, `chore`, `docs`, `refactor`, `perf`
Scopes: `planner`, `tasks`, `habits`, `themes`, `pdf`, `db`, `pro`, `ui`

Examples:
- `feat(habits): add contribution heatmap with 12-week view`
- `fix(planner): correct time block overlap detection for duration > 1 hour`
- `test(habits): add streak reset edge cases for missed day and today-not-logged`

- PRs must reference an issue (`Closes #N`)
- Max 400 lines changed per PR
