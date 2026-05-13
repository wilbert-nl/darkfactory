# PLAN: SongVote
_Status: Draft — Resolve open questions before starting implementation_

> **For Claude in next session:** Read the open questions below and ask the user to resolve them one at a time before writing any code. Mark each resolved one with ✅.

## Overview
SongVote (working title — rename required) is a real-time audience song-request and voting platform for DJs, bar hosts, and live streamers. Guests join via QR code with no app download. DJs get a live approval dashboard and optional tip-to-boost revenue. The opportunity is a fragmented DJ tools market with no dominant platform, strong willingness to pay for monetization-enabled tools, and a straightforward technical build achievable in 4–6 weeks.

## Recommended Stack
- **Frontend:** Vue 3 + Quasar (DJ dashboard as web app; guest voting UI as mobile-optimized PWA, no app download required)
- **Backend:** NestJS + PostgreSQL + Redis (Redis Pub/Sub for real-time vote broadcasting; PostgreSQL for event history and analytics)
- **Database:** PostgreSQL (events, songs, votes, tips); Redis (live vote state per active event)
- **Auth:** Supabase Auth for DJ accounts; guests are anonymous (session token only, no account required)
- **Payments:** Stripe (Pro subscription billing + Stripe Connect for tip-to-boost pass-through to DJ)
- **AI:** Minimal — Claude used for song metadata enrichment and optional auto-approve rules ("auto-approve songs in Top 40")

## MVP Scope
- DJ creates event, gets unique QR code and shareable URL
- Guest PWA: search songs via YouTube Data API, submit request, upvote others
- Live public queue visible to guests on screen
- DJ dashboard: approve / skip / pin songs, view vote counts
- Tip-to-boost: guest pays via Stripe to move song up queue; DJ receives payout via Stripe Connect

## Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] Confirm product name — trademark search, verify no conflict with Songvote.club domain/trademark
- [ ] NestJS project scaffold with PostgreSQL and Redis
- [ ] Supabase Auth for DJ accounts; anonymous session tokens for guests
- [ ] Event creation model — event, songs, votes, tips schema in PostgreSQL
- [ ] WebSocket gateway (NestJS + Socket.io) for real-time vote sync
- [ ] Basic Vue 3 + Quasar DJ dashboard scaffold

### Phase 2 — Core Features (Week 3–5)
- [ ] Guest PWA — song search (YouTube Data API v3), request submission, upvote queue
- [ ] Live public queue page with real-time vote updates via WebSocket
- [ ] DJ dashboard — approve, skip, pin, view live votes, manually add songs
- [ ] QR code generation per event (qrcode.js)
- [ ] Stripe subscription billing for Pro plan (DJ accounts)
- [ ] Stripe Connect integration for tip-to-boost — guest payment → DJ payout with platform fee retained

### Phase 3 — Launch Prep (Week 6–8)
- [ ] Streamer mode — overlay URL with vote tally widget for Twitch/YouTube Live OBS browser source
- [ ] Event analytics dashboard — most requested, most tipped, crowd hype score
- [ ] White-label event branding (venue logo, custom colors) for venue chain upsell
- [ ] Rate limiting and abuse prevention on votes (1 vote per guest per song)
- [ ] Mobile-responsive DJ dashboard for managing events from phone
- [ ] Beta with 10 DJs; gather testimonials before public launch

## Open Questions ❓
> Resolve these before implementation. Ask one at a time.

- [ ] ❓ **Name decision:** What is the new product name? Must be confirmed before any branding, domain registration, or code repository naming.
- [ ] ❓ **YouTube API strategy:** Use YouTube Data API for song search only (no audio preview) to stay within ToS, or attempt 15-second preview (higher legal risk, stronger UX)?
- [ ] ❓ **Tip-to-boost model:** 0% platform fee (DJ keeps all, platform earns only on subscription) or 5–8% transaction fee on top of subscription revenue?
- [ ] ❓ **Target market:** Mobile DJs (solo performers at events) or bar/venue-resident DJs or Twitch/YouTube streamers — which segment to prioritize for launch marketing?
- [ ] ❓ **Guest accounts:** Fully anonymous (no sign-up ever) or optional guest account for vote history and tip receipts?

## Top Risks
1. **Name/trademark conflict with Songvote.club** — Building on a name that collides with an existing product risks cease-and-desist, brand confusion, and wasted marketing spend. Mitigation: Do a full trademark search and competitor review before committing to any name; this is the single blocker before Phase 1 can start.
2. **YouTube API quota and ToS limits** — YouTube Data API has 10,000 units/day free quota; a popular event can exhaust this quickly. Mitigation: Cache song search results aggressively in Redis; apply for quota increase early; review commercial use clause before launch.

## Dark Factory Readiness
**Ready:** Partial
**Notes:** Technically ready to build — the stack is straightforward. Blocked on: (1) product rename and trademark clearance, and (2) YouTube API ToS review for the tip-to-boost monetized context. Once those are resolved, the factory can build the full MVP without further input.
