# CLAUDE.md — LocalFirst Technical Specification

## Stack

| Layer | Technology |
|---|---|
| UI Framework | Vue 3 + Quasar (SPA/PWA mode) |
| Language | TypeScript (strict) |
| Component Style | `<script setup>` + Composition API |
| State | Pinia |
| Storage (Web) | sql.js (SQLite in WebAssembly) |
| Storage (Mobile) | @capacitor-community/sqlite |
| Encryption | Web Crypto API — AES-256-GCM + PBKDF2 |
| Cloud Backup | Dropbox SDK / Google Drive REST API (user-authenticated, user's own account) |
| Export | Native JSON + CSV serialization (no library needed) |
| Package Manager | pnpm |
| Testing | Vitest (unit), Playwright (E2E) |
| Lint | ESLint + Prettier + vue-tsc |

## Repo Layout

```
local-first/
├── src/
│   ├── modules/
│   │   ├── notes/
│   │   │   ├── pages/NotesPage.vue
│   │   │   ├── components/NoteEditor.vue
│   │   │   ├── components/NotesList.vue
│   │   │   └── stores/notes.store.ts
│   │   ├── todos/
│   │   │   ├── pages/TodosPage.vue
│   │   │   ├── components/TaskItem.vue
│   │   │   ├── components/ProjectView.vue
│   │   │   └── stores/todos.store.ts
│   │   └── bookmarks/
│   │       ├── pages/BookmarksPage.vue
│   │       ├── components/BookmarkCard.vue
│   │       └── stores/bookmarks.store.ts
│   ├── composables/
│   │   ├── useDatabase.ts       # sql.js init + query wrapper
│   │   ├── useEncryption.ts     # AES-256-GCM encrypt/decrypt via Web Crypto
│   │   ├── useAuditLog.ts       # write audit events to audit_log table
│   │   ├── useCloudBackup.ts    # encrypt-then-upload to Dropbox or Drive
│   │   ├── useExport.ts         # JSON + CSV export
│   │   └── usePlatform.ts       # detect web vs Capacitor, route to right db
│   ├── stores/
│   │   ├── audit.store.ts
│   │   └── settings.store.ts    # backup provider, last backup time, theme
│   ├── pages/
│   │   ├── DashboardPage.vue
│   │   ├── AuditLogPage.vue
│   │   └── SettingsPage.vue
│   ├── router/
│   │   └── index.ts
│   ├── boot/
│   │   └── db.ts               # database init boot file
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
pnpm test:unit          # Vitest
pnpm test:unit --watch
pnpm test:e2e           # Playwright
pnpm test:unit --coverage
```

Rules:
- `useEncryption.ts` must have 100% line coverage — cryptography code must be fully tested
- `useDatabase.ts` must have ≥80% line coverage
- Encryption tests must use known test vectors — verify encrypt/decrypt round-trips
- Cloud backup tests must mock the Dropbox/Drive API — never call real APIs in tests
- Audit log tests must verify every store action produces an audit entry
- E2E tests cover: create note, create task, create bookmark, export JSON, audit log view

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
- All database queries use parameterized statements — no string interpolation
- Encryption: always use `useEncryption.ts` composable — never call `crypto.subtle` directly from stores or components
- Audit log: every state-mutating action in every store must call `useAuditLog().log(action, entityType, entityId)`
- Platform detection: use `usePlatform()` to route between sql.js (web) and @capacitor-community/sqlite (mobile) — never check `Capacitor.isNativePlatform()` inline in stores

## Storage Rules

```sql
-- Notes
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  folder TEXT,
  tags TEXT,           -- JSON array of strings
  pinned INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Todos
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  due_date INTEGER,    -- Unix timestamp
  priority INTEGER NOT NULL DEFAULT 0,  -- 0=none, 1=low, 2=med, 3=high
  project_id TEXT,
  parent_id TEXT,      -- for subtasks
  recurrence TEXT,     -- JSON recurrence rule or NULL
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT,
  created_at INTEGER NOT NULL
);

-- Bookmarks
CREATE TABLE bookmarks (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT,           -- JSON array
  favicon_url TEXT,
  created_at INTEGER NOT NULL
);

-- Audit Log
CREATE TABLE audit_log (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,    -- 'create' | 'update' | 'delete'
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  detail TEXT              -- JSON blob of changed fields
);
```

- All queries use parameterized placeholders — never string concatenation in SQL
- IDs are UUIDs (`crypto.randomUUID()`)
- Tags stored as JSON string arrays
- Audit log is append-only — never update or delete audit records

## Environment Variables

| Variable | Purpose | Notes |
|---|---|---|
| `VITE_DROPBOX_APP_KEY` | Dropbox OAuth app key | User's own account; no user data stored by app |
| `VITE_GDRIVE_CLIENT_ID` | Google Drive OAuth client ID | Same — user authenticates to their own Drive |

No server-side secrets. Encryption key is derived from user passphrase and stored in `localStorage` only.

## Protected Paths

```
MISSION.md
CLAUDE.md
FACTORY_RULES.md
public/sql-wasm.wasm
tsconfig.json
src/composables/useEncryption.ts   # cryptography — human review required for changes
```

## Known Footguns

- **Web Crypto API is async**: All `crypto.subtle` operations return Promises. Never block on encryption. Use `await` properly and handle errors — a failed decrypt must surface as a user-visible error, not a silent empty string.
- **PBKDF2 iteration count**: Use minimum 600,000 iterations (OWASP 2023 recommendation). Do not reduce this for performance.
- **sql.js persistence**: sql.js stores the database in memory. To persist, serialize to `Uint8Array` and save to `localStorage` (small DBs) or `IndexedDB` (larger). Use `indexedDB` for anything over ~1MB.
- **Audit log growth**: The audit log table is append-only and will grow unbounded. Add a cleanup job that archives entries older than 90 days to a separate JSON export before deleting.
- **Dropbox/Google Drive OAuth PKCE**: Use PKCE flow (not implicit) for OAuth in the browser. Never use the implicit grant.
- **Cloud backup atomicity**: Encrypt the entire database export as one blob before uploading. Never upload individual records — it creates a partial plaintext attack surface.

## Commit & PR Conventions

```
type(scope): short description

Closes #N
```

Types: `feat`, `fix`, `test`, `chore`, `docs`, `refactor`, `perf`
Scopes: `notes`, `todos`, `bookmarks`, `crypto`, `backup`, `audit`, `db`, `export`, `ui`

Examples:
- `feat(notes): add folder and tag filtering to notes list`
- `fix(crypto): handle PBKDF2 key derivation failure with user-visible error`
- `test(audit): verify every store mutation produces an audit log entry`

- PRs must reference an issue (`Closes #N`)
- Max 400 lines changed per PR
