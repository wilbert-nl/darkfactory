# PointSystem — Research Brief

## What It Is
A white-label gamified points platform that any indie community, Discord server, newsletter, or creator can embed to reward member engagement — positioned as the self-serve alternative to enterprise loyalty tools.

## Competitors
| Name | Description |
|------|-------------|
| Antavo | Enterprise AI-powered loyalty and gamification suite; clients include KFC and Skims; mid-market to enterprise pricing |
| Gameball | SMB-focused gamification, loyalty, and referral tool; more affordable with self-serve onboarding |
| Open Loyalty | Open-source headless loyalty engine powering $4B+ in revenue; white-label capable but requires engineering resources |
| Kangaroo Rewards | SMB loyalty with white-label option at $299/mo |
| Zinrelo | Points and tiers loyalty SaaS; mid-market focused |

## Market Size
Gamification market at $19.4B–$29.1B in 2025, projected $92.5B by 2030 (26% CAGR). Loyalty management market at $10.5B in 2025, projected $22.8B by 2030. 70%+ of Global 2000 companies already use gamification. Key gap: enterprise tools like Antavo and Open Loyalty are too complex and expensive for indie communities, Discord servers, and creator platforms — the long tail is underserved.

## MVP Features
1. White-label points engine with configurable point names, earn actions, daily and period caps
2. Activity triggers via webhook or API (post, comment, referral, purchase, custom events)
3. Rewards catalog supporting digital, physical, and status tier redemptions
4. Leaderboard and member profile pages as embeddable widgets
5. Admin dashboard for community managers
6. API plus Zapier and Make.com integration for no-code setup
7. Embeddable badge and level widget for external sites

## Differentiators
1. Community-first, not retail-first: Antavo and Gameball are designed for e-commerce; PointSystem is built for Discord servers, newsletters, forums, and creator platforms — a gap no current tool fills well
2. No-code setup in under 30 minutes: Stripe-style self-serve onboarding vs multi-week enterprise sales process
3. Radical transparency: public live activity log so members can verify point awards are fair — trust is a product feature

## Profitability
**Model:** SaaS by active member count. Free: up to 100 members. Starter: $29/mo up to 1K members. Growth: $99/mo up to 10K members. Scale: $299/mo unlimited plus white-label. Enterprise: custom. Additional revenue from transaction fees on physical reward fulfillment.
**Estimate:** 500 communities × $79/mo avg = $39.5K MRR / $474K ARR. At 5K communities = $5M ARR.

## Build Ease: 5/5
Standard SaaS CRUD at its core. Gamification logic (points math, cooldowns, leaderboard ranking) is deterministic and straightforward to implement. Claude and AI are useful for suggesting activity-to-points rule configurations, reward catalog copy, API documentation generation, and a support chatbot. No complex AI or ML required for v1. The hardest engineering challenge is scaling the webhook and event ingestion system for large communities with high activity volume.

## Legal Risks
- Points as currency risk: if points become redeemable for cash or cash equivalents at significant scale, a money transmission license (US) or e-money license (EU) may be required — keep redemptions to non-cash rewards and platform credits to avoid this
- Sweepstakes law: if points are used for prize draws, US sweepstakes law requires a "no purchase necessary" alternative entry method
- GDPR and CCPA as data processor: acting as data processor for client communities requires a Data Processing Agreement (DPA) with each client
- Bot and fraud risk: bad actors gaming points systems is an operational and reputational hazard requiring rate limiting and anomaly detection
