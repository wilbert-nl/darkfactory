# PLAN: LocalFirst
_Status: Draft — Resolve open questions before starting implementation_

> **For Claude in next session:** Read the open questions below and ask the user to resolve them one at a time before writing any code. Mark each resolved one with ✅.

## Overview
LocalFirst is a suite of privacy-first utility apps where all data lives on the user's device by default, with no account required for the free tier. The paid tier adds zero-knowledge E2E encrypted cloud sync. The opportunity is a growing "cloud fatigue" audience that trusts Obsidian and Standard Notes but has no equivalent for tasks or budgeting. The "no account, ever" positioning and open-source crypto layer are trust signals that word-of-mouth communities convert on reliably.

## Recommended Stack
- **Frontend:** Vue 3 + Quasar (PWA with offline-first via Workbox; Capacitor for mobile if needed)
- **Backend:** NestJS (minimal — only handles encrypted sync relay; never sees plaintext data)
- **Database:** IndexedDB via Dexie.js (local, all platforms) + PostgreSQL (server-side encrypted blob storage only)
- **Auth:** Optional — email + passphrase for sync only; no account required for free tier
- **Payments:** Stripe (Premium $4/mo, $29/yr; Lifetime $49; Enterprise annual invoice)
- **Encryption:** libsodium (XSalsa20-Poly1305 + Argon2id key derivation); DO NOT use custom crypto
- **Sync:** Automerge or Yjs CRDTs for conflict-free encrypted document sync
- **AI:** Claude API (local natural language query over local data; suggestions stay client-side where possible)

## MVP Scope
- Single utility module for v1 (notes OR tasks — resolve in open questions)
- Fully offline, zero-account, data stored in IndexedDB only
- Full JSON/CSV export in one click
- Optional E2E encrypted backup to server (passphrase-derived key, server sees only ciphertext)
- Transparent privacy page with audit log and delete-all-data button

## Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] Vue 3 + Quasar project with Dexie.js local storage; verify full offline operation
- [ ] Core data schema for chosen utility (notes or tasks) in IndexedDB
- [ ] "Your data stays here" onboarding screen with storage size indicator
- [ ] One-click JSON + CSV export of all local data
- [ ] libsodium integration: key derivation from passphrase (Argon2id), encrypt/decrypt local data blob
- [ ] Privacy page: what data exists, where it lives, how to delete everything

### Phase 2 — Core Features (Week 3–5)
- [ ] Full utility feature set for chosen module (notes: rich-text, folders, tags, search; tasks: projects, due dates, recurring, priorities)
- [ ] E2E encrypted backup: encrypted blob upload to NestJS relay server
- [ ] Passphrase-based account: derive key client-side, never send passphrase to server
- [ ] Restore from encrypted backup (enter passphrase → decrypt → restore to IndexedDB)
- [ ] Multi-device sync: encrypted CRDT sync via server relay (no plaintext on server)
- [ ] Open-source encryption module published to GitHub with README explaining the scheme

### Phase 3 — Launch Prep (Week 6–8)
- [ ] Stripe billing: Premium subscription + Lifetime deal purchase flow
- [ ] Second utility module (add tasks or budget tracker as module 2)
- [ ] Bundle subscription: both modules under one Premium price
- [ ] AI natural language query (Claude API, client-side where possible: "show notes from last week mentioning budget")
- [ ] Self-hosting documentation and Docker Compose config for the sync relay server
- [ ] Enterprise licensing page and inquiry form
- [ ] Legal pages: Privacy Policy (data minimization proof), Terms of Service, encryption disclaimer, export control notice
- [ ] Launch: Hacker News Show HN, r/privacy, r/selfhosted, Obsidian community forums

## Open Questions ❓
> Resolve these before implementation. Ask one at a time.

- [ ] ❓ **First module:** Notes, tasks, or budget tracker — which single module ships in v1?
- [ ] ❓ **Encryption scope:** Encrypt only the sync/backup blobs, or also encrypt IndexedDB at rest locally (adds complexity but stronger privacy claim)?
- [ ] ❓ **Mobile distribution:** PWA only (avoids App Store 30% cut), or Capacitor iOS/Android app (more reach, but Apple's cut and review delays)?
- [ ] ❓ **Passphrase recovery:** Offer a recovery code (reduces security slightly) or strict no-recovery (user loses data if passphrase forgotten — stronger but risky for mass market)?
- [ ] ❓ **Lifetime deal at launch:** Offer $49 lifetime deal on launch day to seed revenue and community, or subscription-only from day 1?
- [ ] ❓ **Second module timing:** Ship second utility in v1 bundle or validate first module has 500+ active users before building module 2?

## Top Risks
1. **Incorrect E2E encryption implementation** — a subtle crypto bug can expose user data while the marketing claims privacy; mitigation: use libsodium exclusively (never custom crypto), have the GitHub implementation reviewed by at least one security community member before launch, and include a clear "beta — encryption not yet audited" disclaimer until reviewed
2. **Passphrase loss = data loss** — if a user forgets their sync passphrase and has no local backup, data is unrecoverable; mitigation: prominent warnings at passphrase setup, encourage local export before enabling sync, and decide on recovery code policy in open questions above

## Dark Factory Readiness
**Ready:** Partial
**Notes:** The utility app UI, local storage, export, and Stripe billing are factory-ready. The E2E encryption and CRDT sync implementation requires careful architecture decisions — the factory should not improvise the crypto layer. Resolve the first module, encryption scope, and passphrase recovery questions before handing off. Provide the libsodium integration approach explicitly in the handoff brief.
