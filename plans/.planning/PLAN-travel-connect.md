# PLAN: TravelConnect
_Status: Draft — Resolve open questions before starting implementation_

> **For Claude in next session:** Read the open questions below and ask the user to resolve them one at a time before writing any code. Mark each resolved one with ✅.

## Overview
TravelConnect is a two-sided marketplace using a reverse RFQ model: travelers post dream trip requests and verified travel agencies submit competing proposals. This Upwork-for-travel mechanic is entirely unserved — all major platforms (Travefy, Tern) are agency-facing workflow tools, not traveler-facing discovery platforms. The opportunity is capturing demand-side intent at the moment of travel inspiration.

## Recommended Stack
- **Frontend:** Vue 3 + Quasar (web-first; mobile via Capacitor for traveler app if needed)
- **Backend:** NestJS + REST API
- **Database:** PostgreSQL
- **Auth:** Supabase Auth or NestJS + Passport JWT (separate roles: traveler, agency, admin)
- **Payments:** Stripe Connect (marketplace payments with platform fee, escrow via Stripe's payment holds or manual milestone release)
- **AI:** Claude API — agency proposal drafting assistant, itinerary suggestion engine, traveler-agency match scoring, review summarization
- **Storage:** Cloudflare R2 for agency credential documents and itinerary PDFs

## MVP Scope
- Travelers post trip requests with destination, dates, group size, budget, and vibe tags
- Verified agencies browse the open request feed and submit structured proposals
- Travelers compare proposals side-by-side and shortlist
- In-app messaging between traveler and shortlisted agencies
- Booking confirmation with Stripe payment and platform commission deduction

## Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] Set up NestJS with PostgreSQL; design schema: users, trip-requests, proposals, agencies, bookings
- [ ] Implement three-role auth: traveler, agency, admin
- [ ] Agency onboarding flow: credentials upload (IATA, business license), profile, specializations
- [ ] Admin vetting queue for agency approval
- [ ] Scaffold Vue 3 + Quasar frontend with role-based routing

### Phase 2 — Core Features (Week 3–5)
- [ ] Trip request form: destination, dates, group, budget, vibe/tags, special requirements
- [ ] Open request feed for agencies with filter by specialty and destination
- [ ] Proposal submission form for agencies (itinerary outline, inclusions, price, validity)
- [ ] AI proposal drafting assistant (Claude API — generates proposal draft from agency notes + request details)
- [ ] Side-by-side proposal comparison view for travelers
- [ ] In-app messaging threads: traveler ↔ agency per proposal
- [ ] Traveler review and rating system post-trip

### Phase 3 — Launch Prep (Week 6–8)
- [ ] Stripe Connect integration: platform fee deduction on confirmed bookings
- [ ] Booking confirmation flow with payment hold and milestone release
- [ ] Agency subscription billing ($99–299/mo for proposal access tiers)
- [ ] Dispute and cancellation workflow (define T&Cs and resolution process)
- [ ] Legal pages: marketplace-only disclaimer, cancellation policy, T&Cs, Privacy Policy
- [ ] SEO landing pages by destination niche (e.g., "Find a Japan travel agency")
- [ ] Seed launch: manually recruit 20–30 verified agencies before opening to travelers

## Open Questions ❓
> Resolve these before implementation. Ask one at a time.

- [ ] ❓ **Legal structure review:** Has a travel/marketplace lawyer confirmed the platform can operate without ATOL/Package Travel Directive licensing in target markets?
- [ ] ❓ **Payment escrow model:** Stripe Connect with payment holds, or a third-party escrow service (e.g., Escrow.com), or manual milestone release for v1?
- [ ] ❓ **Primary geography:** Philippines/SEA agencies first, or targeting English-speaking agencies globally from day 1?
- [ ] ❓ **Agency monetization timing:** Charge agencies from day 1 (subscription), or free access until 50+ agencies are onboarded then introduce pricing?
- [ ] ❓ **Dispute resolution:** Define who arbitrates disputes — founder manually for v1, or a defined policy with automatic partial refund triggers?
- [ ] ❓ **Mobile app:** Traveler-facing Capacitor mobile app in MVP, or web-only and defer mobile to post-launch?

## Top Risks
1. **Legal exposure on payment escrow** — handling travel payments without proper licensing in UK/EU could trigger Package Travel Regulations; mitigation: get a legal opinion before any real money flows through the platform; structure v1 as "introduce only" with payment off-platform until legal structure is confirmed
2. **Chicken-and-egg marketplace problem** — travelers won't post without agencies, agencies won't join without requests; mitigation: manually seed both sides; use founder network to recruit 20+ agencies and post 10–20 sample requests before launch
3. **Chargeback risk on high-value travel** — a $3,000 trip that gets disputed can wipe out months of commission revenue; mitigation: clear refund policy, milestone payment release, and agency vetting to screen out low-quality operators

## Dark Factory Readiness
**Ready:** No
**Notes:** The payment/escrow architecture and legal structure must be resolved before the factory builds anything involving money movement. The two-sided marketplace logic and proposal flow are factory-ready once roles and payment model are decided. Do not build Stripe Connect integration until the legal question about marketplace vs. package seller is answered.
