# PLAN: TrackPx
_Status: Draft — Resolve open questions before starting implementation_

> **For Claude in next session:** Read the open questions below and ask the user to resolve them one at a time before writing any code. Mark each resolved one with ✅.

## Overview
TrackPx is an offline-first lightweight EHR for clinics without reliable internet access. The core opportunity is that 60%+ of global clinics in emerging markets cannot use cloud-only EHRs due to connectivity or cost. No commercially polished offline-first EHR exists at $5–15/mo. OpenMRS proves the demand exists but is too technical for solo clinic owners to deploy. TrackPx bridges the gap with a consumer-grade UX and offline-first architecture.

## Recommended Stack
- **Frontend:** Vue 3 + Quasar (PWA with full offline capability via Service Worker + IndexedDB); Capacitor for Android tablet app build
- **Backend:** NestJS + PostgreSQL + Redis (cloud sync server; optional — app works without it)
- **Database:** PouchDB (client-side, IndexedDB-backed) syncing to CouchDB (server-side) for conflict-resolution; PostgreSQL for cloud-side structured reporting
- **Auth:** Supabase Auth (offline token caching for clinic login without internet)
- **Payments:** Stripe (web billing for clinic admins; in-app purchase not needed for B2B)
- **AI:** Claude API for visit note summarization, ICD-10 code suggestion, and template auto-fill (optional when online)

## MVP Scope
- Offline patient record creation, search, and edit (PouchDB local store)
- Visit notes with customizable templates (general, maternal, pediatric)
- Background sync to cloud when internet becomes available, with conflict resolution
- Appointment scheduling with local calendar view
- Medication log and prescription tracker with allergy flags

## Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] Define sync architecture: PouchDB/CouchDB vs custom SQLite + NestJS sync endpoint
- [ ] NestJS backend scaffold with CouchDB (or PostgreSQL + sync API) and Redis
- [ ] Vue 3 + Quasar PWA scaffold with Service Worker for offline asset caching
- [ ] PouchDB integration on client — create, read, update patient records offline
- [ ] Supabase Auth with offline token persistence (JWT cached in IndexedDB)
- [ ] Android Capacitor build target configured and tested on low-end device

### Phase 2 — Core Features (Week 3–6)
- [ ] Bidirectional sync with conflict resolution (last-write-wins + manual merge UI for conflicts)
- [ ] Visit notes module with template editor (Quasar form builder)
- [ ] Appointment scheduling with local SQLite calendar
- [ ] Medication log with allergy flag warnings
- [ ] Data export — CSV and PDF generation client-side (no server round-trip)
- [ ] Country-specific compliance packs — configurable required fields for PH, Kenya, Indonesia

### Phase 3 — Launch Prep (Week 7–10)
- [ ] Stripe billing integration for clinic admin accounts (freemium to paid upgrade)
- [ ] Data-at-rest encryption on device (Web Crypto API for IndexedDB data)
- [ ] Remote wipe capability for lost/stolen tablets (server-side device deregistration)
- [ ] Claude API integration — ICD-10 autocomplete and visit note summary (online-only feature)
- [ ] Onboarding flow for clinic setup (country, specialty, number of providers)
- [ ] Beta with 5 clinics in target markets (PH preferred for founder proximity)

## Open Questions ❓
> Resolve these before implementation. Ask one at a time.

- [ ] ❓ **Sync architecture:** PouchDB/CouchDB (proven offline-first stack) or custom SQLite + NestJS sync API (more control, more engineering)? This decision drives Phase 1 entirely.
- [ ] ❓ **Primary target market:** Philippines-focused first (founder proximity, regulatory familiarity) or global from day 1?
- [ ] ❓ **Compliance strategy:** Pursue formal HIPAA/GDPR compliance before launch, or launch in PH only under PHIA (Data Privacy Act of 2012) first to reduce early burden?
- [ ] ❓ **Device target:** Android tablet only (lower cost, larger share in emerging markets), or iOS + Android from the start?
- [ ] ❓ **B2B or B2C first:** Target individual solo clinic doctors ($9–15/mo self-serve) or go upmarket to NGO/government clinic chains (white-label, $500–2K/mo contracts) first?
- [ ] ❓ **Grant strategy:** Will you actively pursue WHO / Gates Foundation / USAID grant funding as a primary revenue path for year one, or build purely on SaaS revenue?

## Top Risks
1. **Offline sync conflict resolution bugs** — Split-brain scenarios (same patient record edited on two tablets without sync) can corrupt medical records. Mitigation: Choose PouchDB/CouchDB which provides battle-tested conflict resolution; expose explicit merge UI when conflicts occur; never silently overwrite.
2. **Regulatory complexity across markets** — Building once for PH and then expanding to Kenya and Indonesia means three separate compliance reviews. Mitigation: Launch in one jurisdiction first, design compliance-pack system so new country fields can be added without re-engineering core.

## Dark Factory Readiness
**Ready:** No
**Notes:** The offline-first sync architecture decision (PouchDB/CouchDB vs custom) must be made and validated before any feature coding begins — it is the structural foundation. Additionally, health data compliance legal review for the primary target jurisdiction is required before handling real patient data.
