# Mission

## What This Builds

A privacy-first local utility suite that combines notes, todos, and bookmarks into a single PWA. All data lives in the browser's SQLite database (sql.js) with no account required. Users who want their data on multiple devices can opt into an encrypted cloud backup using their own Dropbox or Google Drive account — the app encrypts data client-side with a key that never leaves the device, so the cloud provider and the app itself never see plaintext. A real-time audit log tracks every action for user transparency.

## Primary Users

Privacy-conscious individuals who want a personal productivity suite without handing their data to a third-party SaaS. Also useful for professionals handling sensitive notes (lawyers, journalists, therapists) who cannot use cloud-based tools. Solves the problem of productivity tools requiring an account and storing your data on someone else's servers.

## In Scope (Factory Can Build)

- Notes module: rich-text notes, folders/tags, full-text search, pinning
- Todos module: tasks with due dates, priority, projects, subtasks, recurring tasks
- Bookmarks module: save URLs with title/description/tags, favicon fetch, search
- Full local SQLite storage (sql.js for web, @capacitor-community/sqlite for mobile)
- JSON and CSV export for each module
- E2E encrypted cloud backup via user's own Dropbox or Google Drive (OAuth, client-side encrypt before upload)
- Encryption: AES-256-GCM, key derived from user passphrase via PBKDF2, key stored in `localStorage` (never transmitted)
- Real-time audit log: every create/update/delete action logged with timestamp
- PWA (offline-first, service worker, installable)
- Bug fixes, tests, documentation

## Out of Scope (Never Build)

- Backend server of any kind
- User accounts managed by this app (OAuth is only for the user's own cloud provider)
- Storing plaintext data on any server — ever
- Real-time sync or collaboration
- Sharing notes/todos with other users
- Mobile app via app stores (PWA only for web; Capacitor build is a stretch goal, not factory scope)
- AI features of any kind
- Payment processing

## Immutable Constraints (Cannot Change, Ever)

- Governance files (MISSION.md, CLAUDE.md, FACTORY_RULES.md) are human-only — agents must never modify them
- Zero telemetry — no analytics, no error reporting to external services, no beacons
- No account required for core features — app must be fully functional without any OAuth
- Encryption key must never leave the device — never transmitted in any request
- Plaintext data must never be sent to any server — only ciphertext to user's own cloud provider
- AES-256-GCM with PBKDF2 key derivation is the required encryption standard — agents must not use weaker algorithms
- All cloud backup operations must be opt-in and reversible
