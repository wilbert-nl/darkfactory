# PLAN: CrowdShot
_Status: Draft — Resolve open questions before starting implementation_

> **For Claude in next session:** Read the open questions below and ask the user to resolve them one at a time before writing any code. Mark each resolved one with ✅.

## Overview
CrowdShot is a gig marketplace where users request GPS-stamped real-time photos or videos of any location from someone physically present there. The opportunity is the trust gap in travel, real estate, and insurance — where people need ground truth about a location right now, not stock photos from 2019. The consumer travel use case (see that beach before booking) is completely untapped by existing B2B-only competitors.

## Recommended Stack
- **Frontend:** Vue 3 + Quasar with Capacitor (native camera access and GPS are essential; PWA camera APIs are unreliable on iOS)
- **Backend:** NestJS with WebSocket for real-time request alerts to nearby photographers; Redis pub/sub for geofenced push routing
- **Database:** PostgreSQL with PostGIS extension for geographic queries (find photographers within X km of request pin)
- **Auth:** Clerk with Google/Apple social login
- **Payments:** Stripe Connect — requester pays upfront, held in escrow; photographer paid on approval
- **AI:** Claude API — photo quality validation from submission metadata, content moderation flagging, auto-tagging of submitted images

## MVP Scope
- Request creation with map pin, description, reward amount, photo/video spec, and expiry timer
- Geofenced push notifications to photographers within configurable radius of request pin
- GPS-stamped and timestamped submission upload from native camera
- Requester approval and escrowed payment release
- Photographer payout via Stripe Connect
- Dispute resolution flow (requester rejects; photographer appeals)

## Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] NestJS backend with PostgreSQL + PostGIS; schema: users, requests, submissions, payments
- [ ] PostGIS geographic indexing: query photographers within radius of a lat/lng point
- [ ] Clerk auth with Google/Apple sign-in; role model: requester vs. photographer (same user can be both)
- [ ] Stripe Connect setup: escrow hold on request creation, release on approval
- [ ] Vue 3 + Quasar + Capacitor scaffold with native camera and GPS permissions

### Phase 2 — Core Features (Week 3–5)
- [ ] Request creation UI: map pin selector, reward input, description, photo vs. video toggle, expiry
- [ ] Redis pub/sub geofenced alert: broadcast request to all photographers within radius in real time
- [ ] Photographer submission flow: native camera capture, GPS metadata embed, upload with progress
- [ ] Submission review UI for requesters: approve, reject with reason, or request revision
- [ ] Escrow payment release on approval; auto-release after 24h if requester does not respond
- [ ] Dispute resolution: photographer appeals rejection; 48h manual review window
- [ ] Claude API content moderation on every submitted image before requester sees it

### Phase 3 — Launch Prep (Week 6–8)
- [ ] B2B API endpoint: authenticated bulk request submission for real estate or insurance integrations
- [ ] Photographer reputation score: approval rate, response time, submission quality
- [ ] Push notification delivery via OneSignal (request alerts, payment received, dispute update)
- [ ] Geofenced cold start strategy: seed photographer profiles in target launch city before going live
- [ ] Privacy controls: requester must acknowledge public-space-only policy before submitting requests
- [ ] Legal review: terms of service covering trespass liability, privacy policy, CSAM policy, DMCA

## Open Questions ❓
> Resolve these before implementation. Ask one at a time.

- [ ] ❓ **Primary audience:** Consumer travel (B2C) or real estate/insurance (B2B API) as the initial focus? Each has a very different sales motion.
- [ ] ❓ **Video support in MVP:** Include 15–30s video requests in v1, or ship photo-only first and add video in v2?
- [ ] ❓ **Pricing model:** Fixed reward tiers ($5, $10, $20) that requesters choose, or fully open bidding where photographers counter-offer?
- [ ] ❓ **Launch city:** Which city to seed photographers in first? Dense tourist market (NYC, Miami) or a smaller city where supply is easier to acquire?
- [ ] ❓ **Photographer minimum age:** 18+ ID verification required, or honor-system age confirmation to reduce onboarding friction?
- [ ] ❓ **Live stream feature:** Include in MVP or later? Requires significantly more infrastructure (WebRTC or Agora.io) than photo/video upload.

## Top Risks
1. **Geographic cold start** — requests go unanswered if no photographers are nearby; mitigation: pre-recruit photographers in one launch city via targeted social media before opening to requesters
2. **Privacy and trespass liability** — a photographer enters private property to fulfill a request; mitigation: mandatory public-space-only policy acknowledgment, clear ToS indemnification, and geo-restriction options per request

## Dark Factory Readiness
**Ready:** Partial
**Notes:** PostGIS geofencing and native Capacitor camera access add non-trivial complexity beyond standard CRUD. Founder must decide B2C vs. B2B focus and launch city before the factory can scope the cold-start seeding plan. Content moderation pipeline must be fully specced before any user-submitted media is accepted.
