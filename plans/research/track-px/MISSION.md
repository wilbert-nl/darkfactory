# MISSION.md — track-px

## What This Builds

A lightweight offline-first electronic health record (EHR) web PWA for small clinics, solo practitioners, and rural practices with unreliable internet. All health data is stored locally in the browser via sql.js (SQLite in WebAssembly). No server processes health data — optional encrypted cloud backup is entirely client-initiated and end-to-end encrypted before leaving the device.

## Primary Users

- Solo physicians and nurses at rural or under-resourced clinics
- Small private practices without budget for enterprise EHR systems
- Community health workers who operate in areas with unreliable connectivity
- Clinic administrators needing simple appointment and visit tracking

## In Scope

- Patient profile creation and search (fully offline)
- Visit notes with customizable templates (SOAP, general, referral)
- Offline-first architecture — app fully functional with zero network connectivity
- Appointment scheduling with conflict detection
- Medication tracking per patient
- CSV and PDF export of patient records
- Optional E2E-encrypted cloud backup to user's own Dropbox or Google Drive (client-side encryption before upload)
- sql.js (SQLite WASM) for all local storage — no server database
- Free — no payments, no subscriptions in MVP

## Out of Scope

- Any server-side processing or storage of health data
- HIPAA certification or legal compliance attestation
- Integration with hospital or pharmacy systems
- Billing or insurance claims management
- Telemedicine or video consultation
- Multi-user clinic network with shared records
- Native mobile app (PWA only)

## Immutable Constraints

1. **CRITICAL: No plaintext health data is ever transmitted to any server** — this is an absolute, unconditional constraint.
2. **Optional cloud backup is E2E encrypted client-side** before upload using the user's own encryption key — the app never receives or stores the key server-side.
3. **"Not a certified EHR or medical device" disclaimer** must appear prominently in the app header and on every exported document — agents must never remove or soften it.
4. **Patient record deletion is irreversible and immediate** — no soft deletes, no recycle bin, no audit-log retention of deleted health data.
5. **No analytics, no telemetry, no usage tracking** — the app must never phone home with any user or usage data.
6. **Data export must include all patient data in portable format** — never lock a user's own data behind a paywall or gate export behind any condition.
7. **`app/src/services/encryption.service.ts` and `app/src/components/Disclaimer.vue` are protected** — agents must never modify these files.
