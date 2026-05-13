# MISSION.md — point-system

## What This Builds

A white-label, embeddable gamified points platform for online communities — Discord servers, creator newsletters, forums, and membership sites. Community admins configure a custom points engine (point names, activity triggers, rewards catalog), then embed leaderboards and profile widgets as iframe-safe snippets. Activity events are ingested via signed webhooks or direct API calls. Zapier/Make.com integration available on Pro. Points balances are maintained as an append-only ledger — balances are never directly mutated.

## Primary Users

- **Community admins** — Discord mods, creators, forum owners who configure point rules and rewards
- **Community members** — end users who earn points, redeem rewards, and view leaderboards
- **Integrators** — developers using the API or Zapier to trigger point events from external platforms
- **Platform operators (human)** — handle Enterprise white-label contracts, abuse escalations, pricing

## In Scope

- Multi-community SaaS: each admin workspace is isolated with its own points engine config
- Configurable point names (e.g., "coins", "karma", "gems"), multipliers, and activity trigger rules
- Webhook ingestion endpoint with HMAC-SHA256 signature verification
- Direct REST API for point grants and queries (API key auth, rate-limited to 1000 req/hr per community)
- Rewards catalog: digital rewards (codes, files), physical rewards (address capture), tier unlocks
- Reward redemption as idempotent operations — no double-spend possible
- Embeddable leaderboard and member profile widgets (iframe-safe, no cookies, GDPR compliant)
- Zapier / Make.com integration via NestJS webhook endpoint (Pro tier)
- Leaderboard updates via polling — no real-time WebSocket in MVP
- Stripe billing: Free (1 community, 100 members), Pro $29/mo (unlimited, custom branding, Zapier), Enterprise (white-label + API SLA)

## Out of Scope

- Real-time WebSocket leaderboard in MVP (polling only)
- Point transfers between members (no peer-to-peer in MVP)
- In-app currency exchange or crypto integration
- Negative point balances (hardcoded floor at 0)
- Physical reward fulfillment (address capture only; fulfillment is manual)
- Mobile native app
- Multi-language / internationalization in MVP

## Immutable Constraints

1. **Webhook HMAC verification must never be modified by agents** — `api/src/webhooks/hmac.service.ts` is protected
2. **Points ledger is append-only** — agents must never INSERT UPDATE or DELETE on balance rows; only INSERT into the transactions table is permitted
3. **Negative balances hardcoded to 0** — no code path may allow a member's effective balance to go below zero
4. **Reward redemption must be idempotent** — agents must maintain idempotency keys on all redemption paths; `api/src/rewards/redemption.service.ts` is protected
5. **API rate limit hardcoded at 1000 req/hr per community** — agents must never raise this ceiling
6. **Pro/Enterprise pricing hardcoded** — Pro $29/mo; agents must never change these values
7. **Widget embeds must be cookie-free** — no cookies or localStorage in embed snippets (GDPR)
8. **Protected paths are human-only** — `api/src/auth/`, `api/src/webhooks/hmac.service.ts`, `api/src/points/ledger.service.ts`, `api/src/rewards/redemption.service.ts` are off-limits to agent modification
