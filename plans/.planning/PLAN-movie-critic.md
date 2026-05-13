# PLAN: MovieCritic
_Status: Draft — Resolve open questions before starting implementation_

> **For Claude in next session:** Read the open questions below and ask the user to resolve them one at a time before writing any code. Mark each resolved one with ✅.

## Overview
MovieCritic is a two-sided marketplace where indie filmmakers book vetted professional critics for pre-release paid reviews. No direct competitor exists — FilmFreeway handles submissions, not critic booking. The opportunity is 50K+ indie films annually seeking credible coverage outside traditional press gatekeepers, with a $75–250/review price point that fits indie marketing budgets. The hard part is supply-side: acquiring and vetting the first critics before filmmakers show up.

## Recommended Stack
- **Frontend:** Vue 3 + Quasar (web app; no mobile app needed at launch — desktop-first workflow for filmmakers and critics)
- **Backend:** NestJS + PostgreSQL + Redis (job queue for review deadline reminders; Redis for session caching)
- **Database:** PostgreSQL (filmmaker profiles, critic profiles, bookings, reviews, payments)
- **Auth:** Supabase Auth (two user types: filmmaker and critic; role-based access)
- **Payments:** Stripe (escrow-style payment hold on booking; release to critic on review delivery + platform commission retained)
- **AI:** Claude API for filmmaker-to-critic matching by genre/style, automated critique quality scoring, draft review scaffolding suggestions for critics

## MVP Scope
- Critic profile pages with bio, sample reviews, genres, and verified publication history badge
- Filmmaker brief form with screener link (Vimeo password-protected), genre, runtime, target audience
- Booking flow with Stripe upfront payment and escrow hold
- Secure screener delivery and access tracking
- Published review page + private feedback report PDF delivered to filmmaker

## Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] NestJS scaffold with PostgreSQL and Supabase Auth (filmmaker and critic roles)
- [ ] Critic profile model — bio, genres, publication credits, verification status, sample review links
- [ ] Filmmaker project model — title, genre, runtime, logline, screener URL, review brief
- [ ] Basic Vue 3 + Quasar critic profile page and filmmaker brief form
- [ ] Stripe payment integration — upfront charge held in escrow (Stripe Payment Intents)
- [ ] Manual critic onboarding flow (admin reviews credentials, approves listing)

### Phase 2 — Core Features (Week 3–5)
- [ ] Booking flow — filmmaker browses critics, selects, submits brief, pays
- [ ] Screener delivery — encrypted Vimeo Review link stored per booking; watermark reminder in UI
- [ ] Review submission UI for critics — structured format (story, performance, cinematography, marketability scores + prose)
- [ ] Automated deadline reminders via Redis job queue (email at 7 days, 3 days, 1 day)
- [ ] Review publish flow — filmmaker gets public review URL + private PDF report; Stripe escrow released
- [ ] FTC disclosure badge automatically displayed on every published review

### Phase 3 — Launch Prep (Week 6–8)
- [ ] Claude API matching — suggest top 3 critics for a filmmaker brief based on genre and style alignment
- [ ] Claude quality scoring — flag reviews that are too short, lack structured criteria, or appear templated
- [ ] Distribution intelligence add-on — critic recommends festivals, streaming platforms, distributors (premium review tier)
- [ ] Critic pro listing ($20/mo) for promoted placement in search results
- [ ] Editorial independence clause and defamation disclaimer in ToS (requires legal review)
- [ ] Seed launch: manually recruit 20 vetted critics before public filmmaker sign-up opens

## Open Questions ❓
> Resolve these before implementation. Ask one at a time.

- [ ] ❓ **Critic vetting process:** What is the minimum bar for a critic to be listed? (e.g., 3+ published reviews in a recognized outlet, editorial board review, or something else?) This must be designed before critic onboarding is built.
- [ ] ❓ **Escrow model:** Full Stripe escrow (hold then release) or simple upfront charge with refund policy? Stripe Connect Marketplace (complex) vs standard charge + manual payout (simpler)?
- [ ] ❓ **Review visibility:** Are all reviews public by default, or can filmmakers choose to keep negative reviews private (paid-for suppression raises FTC issues)?
- [ ] ❓ **Target filmmaker segment:** Film festival circuit (no distribution yet) or filmmakers with existing distribution seeking additional coverage?
- [ ] ❓ **Supply-side acquisition:** Will you personally recruit the first 20 critics manually (email outreach to film publications) or run a paid critic acquisition campaign?

## Top Risks
1. **Cold-start supply problem** — Filmmakers will not pay if there are fewer than 20–30 credible critics listed. Mitigation: Do not open filmmaker sign-up until 20 verified critics are live on the platform; founder-led outreach to film publications and film school faculty is the fastest path.
2. **FTC pay-for-review liability** — Publishing paid reviews without clear disclosure triggers FTC enforcement risk. Mitigation: Mandatory disclosure badge on every review is non-negotiable; legal counsel must review disclosure language before any review goes public.

## Dark Factory Readiness
**Ready:** Partial
**Notes:** The technical build is straightforward. Blocked on: (1) the critic vetting process must be human-designed before the onboarding flow can be built, and (2) FTC disclosure language and editorial independence clause need legal review before any review is published. Once the vetting rubric exists, the factory can automate the rest.
