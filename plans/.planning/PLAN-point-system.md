# PLAN: PointSystem
_Status: Draft — Resolve open questions before starting implementation_

> **For Claude in next session:** Read the open questions below and ask the user to resolve them one at a time before writing any code. Mark each resolved one with ✅.

## Overview
PointSystem is a white-label gamified points platform that any indie community, Discord server, newsletter, or creator can embed in under 30 minutes — filling the gap between complex enterprise tools (Antavo, Open Loyalty) and nothing. The gamification market is $29B growing at 26% CAGR with no self-serve, community-first option at the SMB level. This is a standard SaaS CRUD product with a clear monetization model and no legal blockers, making it the most immediately buildable idea in the batch.

## Recommended Stack
- **Frontend:** Vue 3 + Quasar (SPA admin dashboard + embeddable leaderboard/badge widgets via iframe or web component)
- **Backend:** NestJS (REST API + webhook event ingestion + BullMQ for async event processing)
- **Database:** PostgreSQL (communities, members, point ledger, rewards catalog, redemptions) + Redis (leaderboard caching, webhook deduplication, rate limiting)
- **Auth:** Email + password for community admins; API key auth for webhook integrations; optional member SSO via OAuth
- **Payments:** Stripe (SaaS subscription tiers billed by active member count)
- **AI:** Claude API for activity-to-points rule suggestions ("Based on your community type, here are recommended point values"), reward catalog copy generation, and API documentation generation; no AI required for core points engine

## MVP Scope
- Points engine: configurable earn actions via webhook or API, daily/period caps, configurable point name
- Leaderboard and member profile pages as embeddable widgets
- Rewards catalog with digital reward types (discount codes, exclusive content access, status tiers)
- Admin dashboard for managing members, rules, and rewards
- Zapier and Make.com integration for no-code trigger setup

## Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] Scaffold NestJS project with multi-tenant PostgreSQL schema (communities, members, point_ledger, rules, rewards)
- [ ] Build points engine: rule evaluation, earn action processing, daily/period cap enforcement
- [ ] Webhook endpoint for external event ingestion with signature verification and Redis deduplication
- [ ] API key issuance and authentication per community
- [ ] Scaffold Vue 3 + Quasar admin dashboard shell with community onboarding flow

### Phase 2 — Core Features (Week 3–5)
- [ ] Leaderboard widget (embeddable via iframe and web component) with real-time Redis-cached rankings
- [ ] Member profile page showing point balance, earn history, and current tier/badge
- [ ] Rewards catalog: admin creates rewards; members redeem points for rewards; redemption approval flow
- [ ] Status tiers: configurable tier thresholds with automatic tier assignment on point milestones
- [ ] Zapier and Make.com webhook triggers (point earned, tier changed, reward redeemed events)
- [ ] Stripe subscription checkout (Free / Starter / Growth / Scale tiers by active member count)

### Phase 3 — Launch Prep (Week 6–8)
- [ ] Public live activity log (transparent feed of recent point awards for community trust)
- [ ] Claude-powered rule suggestion wizard during onboarding ("What kind of community is this?")
- [ ] Embeddable badge widget (HTML snippet for newsletters, forum signatures, external sites)
- [ ] Bot and fraud detection: anomaly flagging for unusual point accumulation patterns (Redis rate limiter + admin alert)
- [ ] GDPR Data Processing Agreement (DPA) template for client communities
- [ ] API documentation auto-generated and hosted (Claude generates; Swagger UI serves it)

## Open Questions ❓
> Resolve these before implementation. Ask one at a time.

- [ ] ❓ **Primary integration target:** Discord-first (bot integration via Discord API for automatic action tracking) or platform-agnostic webhook-first from day 1?
- [ ] ❓ **Target market:** Indie creators and Discord communities (self-serve, low ARPU, high volume) or SMB SaaS companies adding loyalty to their product (higher ARPU, longer sales cycle)?
- [ ] ❓ **Monetization timing:** Free tier open with no credit card on signup to drive community adoption, or require credit card at signup to filter serious operators?
- [ ] ❓ **Physical reward fulfillment:** Integrate a fulfillment partner (Printful, Printify for merch rewards) in MVP, or limit rewards to digital-only at launch to avoid operational complexity?
- [ ] ❓ **White-label depth:** Custom domain + logo only (easy), or full custom CSS skinning + remove all PointSystem branding (harder) — which is the minimum for the Scale tier?
- [ ] ❓ **Cash redemption:** Allow point redemption for PayPal or gift card cash equivalents (triggers money transmission licensing risk) or restrict to non-cash rewards only at launch?

## Top Risks
1. **Webhook reliability at scale:** Large communities (100K+ members) generate high event volumes that can overwhelm a naive webhook queue. Mitigation: BullMQ with Redis-backed queue, rate limiting per community, dead letter queue for failed events, and per-community processing isolation from day 1.
2. **Points as currency regulatory creep:** If the platform grows and introduces cash-equivalent redemptions, US money transmission or EU e-money licensing may be required. Mitigation: explicitly restrict redemptions to non-cash rewards and platform credits; document this decision and revisit only with legal counsel.

## Dark Factory Readiness
**Ready:** Yes
**Notes:** Standard SaaS CRUD with deterministic gamification logic. The stack (NestJS + Vue 3 + PostgreSQL + Redis) is a natural fit. No legal blockers before implementation — just avoid cash-equivalent redemptions. The webhook event system is the only engineering challenge worth planning carefully before sprint 1.
