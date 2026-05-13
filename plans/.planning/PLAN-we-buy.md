# PLAN: WeBuy
_Status: Draft — Resolve open questions before starting implementation_

> **For Claude in next session:** Read the open questions below and ask the user to resolve them one at a time before writing any code. Mark each resolved one with ✅.

## Overview
WeBuy is a classifieds buy-and-sell platform with escrow-native checkout and AI-powered condition grading from photos. The opportunity is the massive trust gap in Facebook Marketplace and Craigslist — FTC scam complaints from classifieds increased 72% between 2021–2023, yet no challenger has made safe-by-default checkout the headline feature. The $152B classifieds market growing at 25% CAGR provides a large enough wedge even with a fraction of Facebook's network.

## Recommended Stack
- **Frontend:** Vue 3 + Quasar (PWA-first; mobile camera upload is critical for listing creation)
- **Backend:** NestJS with REST API; Redis for message queue and search caching
- **Database:** PostgreSQL with full-text search (pg_trgm + tsvector for listing search); Typesense or Meilisearch for faceted search in Phase 2
- **Auth:** Clerk with Google/Apple social login
- **Payments:** Stripe — escrow via Payment Intents with manual capture; Stripe Connect for seller payouts; Stripe Radar for fraud detection
- **AI:** Claude API — listing description generation from photos, condition grading (Excellent/Good/Fair/Poor) from image analysis, price intelligence from comparable recent sales, fraud signal detection on new accounts

## MVP Scope
- Photo-first listing creation with Claude AI condition grading and auto-generated description
- Location-based browse with radius filter, category, and price range
- In-app messaging with offer and counter-offer flow
- Escrow checkout: buyer pays into hold, seller ships or arranges pickup, buyer confirms receipt, funds release
- Seller and buyer ratings with transaction history

## Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] NestJS backend with PostgreSQL; schema: users, listings, listing_images, messages, offers, transactions, reviews
- [ ] Clerk auth with Google/Apple; unified user model (same account buys and sells)
- [ ] Stripe escrow setup: Payment Intent with manual capture on listing purchase; capture on buyer confirmation
- [ ] Stripe Connect for seller payouts with identity verification
- [ ] Vue 3 + Quasar PWA scaffold; native camera access for listing photos

### Phase 2 — Core Features (Week 3–5)
- [ ] Listing creation: multi-photo upload → Claude API condition grading + auto-description → price input with AI price range suggestion
- [ ] Full-text listing search with pg_trgm; category browse; location radius filter
- [ ] In-app messaging: offer, counter-offer, accept/decline flow with WebSocket real-time delivery
- [ ] Escrow checkout: pay → confirm shipping/pickup → buyer confirm receipt → release funds; 72h auto-release if buyer silent
- [ ] Stripe Radar fraud rules: flag new accounts with high-value first listings
- [ ] Seller and buyer ratings: prompted after transaction completes

### Phase 3 — Launch Prep (Week 6–8)
- [ ] Promoted listings: $1–5 boost for 7-day top placement; Stripe one-time payment
- [ ] Power seller subscription: $10–20/mo for bulk listing tools, analytics, priority support
- [ ] Price comps dashboard: AI-generated price intelligence panel per listing category using historical sales data
- [ ] Meilisearch or Typesense for faceted search at scale (replace pg_trgm for performance)
- [ ] Push notifications: new offer, message received, item sold, funds released
- [ ] Legal: money transmitter license research per state; ToS fraud indemnification; FOSTA-SESTA compliance review; Section 230 documentation

## Open Questions ❓
> Resolve these before implementation. Ask one at a time.

- [ ] ❓ **Target geography:** Philippines-first (OLX dominates but trust/escrow gap is huge) or US-first (larger but dominated by Facebook Marketplace)?
- [ ] ❓ **Category focus:** Launch as general classifieds (electronics, furniture, everything) or win one category first (e.g., electronics only) to build trust reputation in a tight niche?
- [ ] ❓ **Shipping vs. local pickup only:** Include shipping with label generation (higher complexity) or local pickup only for MVP to avoid logistics overhead?
- [ ] ❓ **Escrow release model:** Manual buyer confirmation required, or auto-release after X days if buyer does not dispute? X = ?
- [ ] ❓ **Money transmitter licensing:** Has legal reviewed whether holding escrow funds triggers MTL requirements in target states/countries?
- [ ] ❓ **Seller payout timing:** Instant payout (higher cost) or standard 2–3 day Stripe payout cycle?

## Top Risks
1. **Money transmitter licensing** — holding buyer funds in escrow may require state MTL licenses in the US; mitigation: legal review before launch; Philippines launch avoids this complexity entirely
2. **Facebook Marketplace network effect** — buyers go where listings are; mitigation: focus on a single city or category to build density before expanding; market escrow safety as the explicit reason to switch

## Dark Factory Readiness
**Ready:** Yes
**Notes:** Core escrow + classifieds architecture is buildable immediately. AI listing generation and condition grading are prompt-only (no fine-tuning). The single open question that gates implementation is target geography — Philippines vs. US determines the payment stack, legal exposure, and go-to-market strategy. Resolve that first, then hand off.
