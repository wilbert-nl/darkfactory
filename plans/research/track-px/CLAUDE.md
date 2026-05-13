# CLAUDE.md — track-px

## Stack

| Layer | Technology |
|---|---|
| Frontend framework | Vue 3 + Quasar (TypeScript, `<script setup>`) |
| State management | Pinia |
| Local database | sql.js (SQLite WASM) — all data stays in browser |
| Encryption | Web Crypto API (AES-GCM) — client-side only |
| Cloud backup target | User's own Dropbox or Google Drive (OAuth, client-side) |
| PDF export | jsPDF (client-side) |
| CSV export | Native JS serialization |
| Backend | NONE — no server, no API |
| Package manager | pnpm |
| Unit tests | Vitest |
| E2E tests | Playwright |

## Repo Layout

```
track-px/
├── app/                        # Quasar PWA (no backend)
│   ├── src/
│   │   ├── components/
│   │   │   ├── PatientCard.vue
│   │   │   ├── VisitNoteEditor.vue
│   │   │   ├── MedicationList.vue
│   │   │   ├── AppointmentCalendar.vue
│   │   │   ├── ExportDialog.vue
│   │   │   ├── BackupDialog.vue
│   │   │   └── Disclaimer.vue         # PROTECTED — never modify
│   │   ├── pages/
│   │   │   ├── PatientsPage.vue
│   │   │   ├── PatientDetailPage.vue
│   │   │   ├── NewVisitPage.vue
│   │   │   ├── AppointmentsPage.vue
│   │   │   └── SettingsPage.vue
│   │   ├── stores/
│   │   │   ├── patients.store.ts
│   │   │   ├── visits.store.ts
│   │   │   ├── appointments.store.ts
│   │   │   └── medications.store.ts
│   │   ├── services/
│   │   │   ├── encryption.service.ts  # PROTECTED — never modify
│   │   │   ├── db.service.ts          # sql.js wrapper
│   │   │   ├── export.service.ts
│   │   │   └── backup.service.ts      # Dropbox/Drive OAuth — client only
│   │   ├── composables/
│   │   │   ├── usePatientSearch.ts
│   │   │   └── useOfflineSync.ts
│   │   ├── db/
│   │   │   └── schema.sql             # Applied on first load
│   │   └── router/
│   │       └── index.ts
│   ├── public/
│   │   └── sql-wasm.wasm              # sql.js WASM binary
│   ├── quasar.config.ts
│   └── package.json
├── e2e/
│   └── tests/
├── .env.example
└── package.json
```

## Running the App

```bash
pnpm install
cd app && pnpm dev        # PWA on port 9000 — no backend needed
```

## Testing

```bash
cd app && pnpm test       # Vitest (all logic is in services/stores)
pnpm e2e                  # Playwright
```

## Lint / Format / Type Check

```bash
cd app && pnpm lint && pnpm typecheck && pnpm format
```

## Code Conventions

- `db.service.ts` is the only file allowed to call `sql.js` APIs — all other files go through it
- `encryption.service.ts` uses Web Crypto `AES-GCM` with 256-bit keys derived from a user passphrase via PBKDF2 — this is the only file that handles encryption keys
- All data written to sql.js is encrypted first via `encryption.service.ts` — no plaintext health data in the WASM database
- The `backup.service.ts` serializes, encrypts, and uploads the entire database blob — it never sends individual records
- Patient delete: calls `db.prepare('DELETE FROM patients WHERE id = ?').run(id)` immediately — no `deleted_at` column
- Disclaimer in `Disclaimer.vue` is a hardcoded string — never fetched from any external source
- No `fetch()` or `XMLHttpRequest` calls anywhere in the codebase except `backup.service.ts` (Dropbox/Drive OAuth only)
- No analytics libraries, no Sentry, no logging SDKs — zero network calls in normal operation

## Storage Rules (SQLite via sql.js)

- All patient data columns are encrypted at the application layer before insert
- All queries use sql.js parameterized API: `db.prepare('SELECT * FROM patients WHERE id = ?').getAsObject([id])`
- Schema is defined once in `app/src/db/schema.sql` and applied on first app load
- Database is serialized to `Uint8Array` for backup; deserialized on restore
- No foreign key cascade deletes that leave orphaned encrypted blobs — delete child records first, then parent

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_DROPBOX_APP_KEY` | Dropbox OAuth app key (public — no secret needed for PKCE) |
| `VITE_GDRIVE_CLIENT_ID` | Google Drive OAuth client ID (public) |

No secrets in environment variables — this is a client-only app. Dropbox and Google Drive use PKCE OAuth flows that require no client secret.

## Deployment

- Built as a PWA: `cd app && pnpm build` outputs to `app/dist/`
- Deployed as static files — no server required
- `sql-wasm.wasm` must be served with `Content-Type: application/wasm` header
- Service worker (`quasar.config.ts` PWA preset) enables full offline operation

## Protected Paths

- `app/src/services/encryption.service.ts` — all crypto logic
- `app/src/components/Disclaimer.vue` — EHR disclaimer display

## Known Footguns

- `sql.js` database lives in memory — must persist to `localStorage` or `IndexedDB` on every write, or data is lost on page reload. Use `db.service.ts`'s `persist()` method after every mutation
- `localStorage` has a 5 MB limit — use `IndexedDB` via `localforage` for the serialized DB blob
- Web Crypto `AES-GCM` requires a unique IV per encryption call — `encryption.service.ts` generates and prepends the IV to every ciphertext
- PBKDF2 is slow by design — run key derivation in a Web Worker to avoid blocking the UI
- Dropbox OAuth PKCE redirect must match an approved redirect URI in the Dropbox app settings

## Commit & PR Conventions

- Commits: `feat(patients): add offline patient search with encrypted index`
- Scopes: `patients`, `visits`, `appointments`, `medications`, `encryption`, `export`, `backup`, `ui`, `e2e`
- PRs modifying protected files are auto-rejected — require human override
