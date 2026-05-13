# PLAN: Rentals
_Status: Draft — Resolve open questions before starting implementation_

> **For Claude in next session:** Read the open questions below and ask the user to resolve them one at a time before writing any code. Mark each resolved one with ✅.

## Overview
Rentals is a peer-to-peer rental marketplace where individuals list items, equipment, or short-term space for rent. The opportunity is the $19.6B P2P rental market where no single platform dominates outside of cars (Turo) and storage (Neighbor) — winning one vertical with embedded insurance and hyperlocal supply is the proven playbook. The trust gap (damage liability, ID verification) is the problem to solve.

## Recommended Stack
- **Frontend:** Vue 3 + Quasar (PWA-first with Capacitor option for mobile if vertical demands it)
- **Backend:** NestJS with REST API; Redis for availability calendar locking during booking flow
- **Database:** PostgreSQL (users, listings, bookings, availability, reviews, damage_claims)
- **Auth:** Clerk with Google/Apple social login
- **Payments:** Stripe — booking payment + deposit hold; Stripe Connect for lister payouts; Stripe Identity for ID verification
- **AI:** Claude API — listing description generation from photos + item name, AI-assisted pricing suggestions from comparable local listings, fraud signal detection on new accounts

## MVP Scope
- Item listing with photos, description, category, hourly/daily pricing, and availability calendar
- Location-based browse with category filter and radius
- Booking flow with Stripe payment and deposit hold
- ID verification for renters via Stripe Identity
- Damage claim workflow with photo evidence upload and deposit release or dispute
- Mutual reviews after rental completes

## Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] NestJS backend with PostgreSQL; schema: users, listings, listing_images, availability_blocks, bookings, reviews, damage_claims
- [ ] Clerk auth with Google/Apple; unified user model (same account can list and rent)
- [ ] Stripe Connect onboarding for listers; Stripe Identity for renter verification
- [ ] Redis-based availability locking: prevent double-booking during concurrent checkout attempts
- [ ] Vue 3 + Quasar PWA scaffold with mobile-responsive layout

### Phase 2 — Core Features (Week 3–5)
- [ ] Listing creation: photo upload (up to 8 images), Claude API description generation, category, pricing tiers (hourly/daily/weekly), deposit amount
- [ ] AI pricing suggestion: Claude API prompt comparing item category and condition to recent local bookings
- [ ] Browse UI: map view + list view, radius filter, category filter, date availability filter
- [ ] Booking flow: date/time selection, price summary, deposit hold via Stripe Payment Intents
- [ ] Stripe Identity integration: renter verification gated before first booking
- [ ] Booking lifecycle: pending → confirmed → active → completed; SMS/push status updates
- [ ] Mutual review system: triggered 24h after booking end

### Phase 3 — Launch Prep (Week 6–8)
- [ ] Damage claim workflow: renter or lister initiates; photo evidence upload; deposit held until resolved or released
- [ ] Insurance upsell: per-transaction coverage offer at checkout (integrate with Marble, Obie, or similar API-first insurance provider)
- [ ] Power lister subscription: $20–50/mo tier for high-volume listers (priority listing, bulk calendar management, analytics)
- [ ] Lister income dashboard: earnings, booking history, payout schedule
- [ ] Push notifications via OneSignal: booking request, booking confirmed, rental reminder, review request
- [ ] Legal: ToS damage and liability clauses, insurance regulatory review, zoning disclaimer for property listings

## Open Questions ❓
> Resolve these before implementation. Ask one at a time.

- [ ] ❓ **Vertical focus:** Launch as one-category vertical (e.g., power tools only) or broad marketplace from day 1? Single vertical is easier to supply-seed but slower to grow.
- [ ] ❓ **Target market:** Philippines-first (high peer economy adoption, lower competition) or US-first (larger market, harder cold start)?
- [ ] ❓ **Insurance model:** Partner with an API-first insurance provider (per-transaction coverage) or use Stripe's damage protection features only? Insurance partnership requires significant lead time.
- [ ] ❓ **Property rentals included:** Include short-term space/storage rental in MVP, or restrict to items and equipment only to avoid Airbnb-style regulatory complexity?
- [ ] ❓ **Minimum viable supply:** How many listings per city before opening to renters? Define the target before launch.
- [ ] ❓ **ID verification gating:** Require Stripe Identity verification before any booking, or allow a first booking without verification to reduce friction?

## Top Risks
1. **Trust and safety infrastructure complexity** — damage claims, ID verification, and deposit disputes are operationally intensive for a solo founder; mitigation: use Stripe's tooling maximally and delay insurance partnerships until post-validation
2. **Local supply cold start** — no listings means no renters; mitigation: personally recruit 50–100 listers in one city before launch; 0% commission for first 6 months

## Dark Factory Readiness
**Ready:** Partial
**Notes:** Marketplace architecture and Stripe Connect are well understood, but insurance partnership and ID verification gating decisions must be resolved first. Vertical focus and target market answers will determine the entire supply acquisition strategy. Factory can build the core booking flow immediately; damage claims and insurance are Phase 3 and can be scoped separately.
