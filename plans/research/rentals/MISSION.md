# MISSION.md — rentals

## What This Builds

A peer-to-peer rental marketplace where individuals list personal items and equipment for rent by the day or week. Stripe Payment Intents with capture-later holds deposits at booking; deposits release only after lister confirmation of safe return. Renters must complete ID verification (Stripe Identity) before their first booking. Damage claims trigger a human-reviewed workflow with photo evidence — no automated resolution. Late return fees are calculated server-side on a hardcoded formula.

## Primary Users

- **Listers** — item owners who list gear, tools, vehicles, or equipment with photos, pricing, and availability calendar
- **Renters** — individuals who browse, book, and rent items; must pass ID verification before first booking
- **Platform admins (human)** — review damage claims, resolve disputes, approve large deposit captures
- **Platform system** — manages Stripe deposit holds, availability conflict detection, late return fee calculation

## In Scope

- Item listing with photo uploads, category tags, daily/weekly pricing, and availability calendar
- Browse by location (city/radius) and category; search with SQLite FTS5
- Booking flow: renter selects dates, system checks availability conflict in SQLite, Stripe Payment Intent created with capture-later for deposit hold
- ID verification via Stripe Identity — required for all renters before first booking (hardcoded)
- Rental lifecycle: pending → confirmed → active → returned → completed
- Damage claim workflow: renter or lister uploads photo evidence, claim escalates to human admin
- Deposit release: lister confirms safe return → platform captures/cancels hold via Stripe
- Late return fee calculation server-side using hardcoded per-day formula
- 10% service fee on each rental (hardcoded); shown transparently at checkout
- Lister and renter dashboards with booking history, earnings, and active rental tracking

## Out of Scope

- Automated damage claim resolution — human moderation always required
- Auto-release of deposit without lister confirmation — never implemented
- Rental insurance underwriting or brokerage
- In-app messaging beyond booking status notifications in MVP
- Physical pickup coordination (address shared post-booking only)
- Mobile native app
- Multi-language / internationalization in MVP
- Vehicle-specific regulatory compliance (CDW, state licensing)

## Immutable Constraints

1. **Service fee hardcoded at 10%** — agents must never change this value
2. **Deposit release requires explicit lister confirmation** — auto-release without confirmation is permanently forbidden
3. **ID verification required before first booking** — agents must never bypass or make this optional
4. **Stripe deposit hold logic is protected** — `api/src/payments/deposit.service.ts` and `api/src/payments/capture.service.ts` are off-limits to agent modification
5. **Late return fee formula is server-side and hardcoded** — agents must never change the formula or move calculation to the client
6. **Damage claims escalate to human moderation** — no automated resolution path may be introduced
7. **Availability conflict detection must be atomic** — SQLite transaction with exclusive lock; agents must not weaken this constraint
8. **Protected paths are human-only** — `api/src/auth/`, `api/src/payments/deposit.service.ts`, `api/src/payments/capture.service.ts`, `api/src/verification/` are off-limits to agent modification
