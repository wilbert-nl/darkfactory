# MISSION.md — we-buy

## What This Builds

A classifieds buy-and-sell platform with escrow-native checkout and AI-powered condition grading from listing photos. Sellers upload photos, Claude Haiku grades item condition and generates a draft description. Buyers browse by location, message sellers, and pay through escrow. The platform takes a 3% transaction fee.

## Primary Users

- Individual sellers clearing out household items, electronics, and clothing
- Buyers looking for quality secondhand goods with protection against fraud
- Small resellers and vintage traders who list frequently (Pro tier)
- Local community members who prefer in-person handoff over shipping

## In Scope

- Photo-first listing creation with AI condition grading (Claude Haiku vision)
- AI-generated draft listing description with price suggestion
- Location-based listing browse and search (SQLite geospatial queries)
- In-app messaging with offer and counter-offer flow
- Seller and buyer rating system (immutable after submission)
- Escrow checkout via Stripe Payment Intents
- Escrow release on buyer confirmation OR 7-day auto-release (hardcoded)
- 3% platform transaction fee on all escrow transactions
- Photo uploads to Cloudflare R2
- Free tier: 5 active listings, 5 photos per listing
- Pro seller ($4.99/mo): unlimited listings, featured placement, AI grading, 20 photos per listing

## Out of Scope

- Shipping integration or label generation (local handoff only in MVP)
- Auction-style time-limited listings
- Business or storefront accounts
- Category-specific compliance (firearms, pharmaceuticals, etc.)
- Payment methods other than Stripe escrow
- Native mobile app (web-only in MVP)

## Immutable Constraints

1. **Platform transaction fee (3%) is hardcoded** — agents must never alter this value under any circumstances.
2. **Escrow auto-release is hardcoded at 7 days** — agents must never shorten or remove this safeguard.
3. **"AI condition grades are AI-generated and not a guarantee of condition" disclaimer** must appear on every listing and in the checkout flow — agents must never remove or soften it.
4. **Seller and buyer ratings are immutable after submission** — agents must never implement edit or delete functionality for submitted ratings.
5. **Photo limits are hardcoded**: free users 5 photos per listing, Pro users 20 photos per listing — agents must never alter these values.
6. **Pro pricing ($4.99/mo) and free listing limit (5 active) are hardcoded** — agents must never alter these values.
