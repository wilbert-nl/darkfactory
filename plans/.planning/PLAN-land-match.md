# PLAN: LandMatch
_Status: Draft — Resolve open questions before starting implementation_

> **For Claude in next session:** Read the open questions below and ask the user to resolve them one at a time before writing any code. Mark each resolved one with ✅.

## Overview
LandMatch is a specialized property marketplace connecting land sellers with land buyers — featuring parcel maps, document verification, and a reverse buyer-intent model. The key opportunity is that all major competitors (LandWatch, Lands of America) are US-only, leaving SEA, LatAm, and Africa entirely unserved by a modern digital land marketplace. Document verification and buyer intent matching are the two moats competitors haven't built.

## Recommended Stack
- **Frontend:** Vue 3 + Quasar (web-first PWA; mobile via Capacitor if needed)
- **Backend:** NestJS + REST API
- **Database:** PostgreSQL (PostGIS extension for geospatial parcel queries)
- **Auth:** Supabase Auth or NestJS + Passport JWT
- **Payments:** Stripe (listing boosts, featured placement); escrow via a licensed payment processor or manual wire + milestone release for v1
- **Maps:** Mapbox GL JS (parcel overlays, boundary drawing, GPS pins)
- **AI:** Claude API — listing description generation from raw inputs, document OCR extraction, buyer-seller match scoring
- **Storage:** AWS S3 or Cloudflare R2 for document and image uploads

## MVP Scope
- Sellers can create and publish land listings with GPS, acreage, zoning, price, and document uploads
- Buyers can search, filter, and view listings on an interactive map
- Verified badge system for listings with uploaded and reviewed title documents
- Buyer intent posts with automated email alerts to matching sellers
- In-app messaging and offer submission between buyer and seller

## Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] Set up NestJS monorepo with PostgreSQL + PostGIS
- [ ] Implement auth (seller/buyer/admin roles)
- [ ] Design and migrate core schema: listings, users, documents, intent-posts
- [ ] Set up Cloudflare R2 for document/image storage
- [ ] Scaffold Vue 3 + Quasar frontend with routing and layout

### Phase 2 — Core Features (Week 3–5)
- [ ] Listing creation form with GPS input, acreage, zoning, price, images
- [ ] Document upload with virus scan and S3 signed URLs
- [ ] Admin verification queue — mark listing as "Verified" after document review
- [ ] Mapbox integration — listing pins, boundary polygon drawing, cluster view
- [ ] Advanced search + filter (size, type, price, region, verified-only toggle)
- [ ] Buyer intent post form + matching query (PostGIS radius or region filter)
- [ ] Email alert system for new listings matching saved searches
- [ ] AI listing description generator (Claude API from raw seller inputs)

### Phase 3 — Launch Prep (Week 6–8)
- [ ] In-app messaging thread between buyer and seller per listing
- [ ] Offer submission flow with status (pending, countered, accepted, declined)
- [ ] Featured/boosted listing placement via Stripe checkout
- [ ] SEO-optimized listing detail pages (SSR or pre-render)
- [ ] Admin dashboard: listing moderation, user management, verification queue
- [ ] Legal pages: disclaimer (marketing only, not legal due diligence), ToS, Privacy Policy
- [ ] Launch on Product Hunt and SEA land/property Facebook groups

## Open Questions ❓
> Resolve these before implementation. Ask one at a time.

- [ ] ❓ **Primary market:** Philippines-first for launch or global/international from day 1?
- [ ] ❓ **Verification model:** Human admin reviews documents manually, or AI-assisted pre-screening with admin final approval?
- [ ] ❓ **Escrow:** Skip escrow entirely in v1 (marketplace only, no money handling), or include a basic escrow flow via a licensed partner?
- [ ] ❓ **Monetization timing:** Paid listings and boosts from day 1, or free to seed supply then monetize at 200+ listings?
- [ ] ❓ **Parcel data:** Source publicly available cadastral data (free but limited) or license a parcel data provider (accurate but costly)?
- [ ] ❓ **Mobile:** Web-only for MVP, or Capacitor wrapper for iOS/Android from the start?

## Top Risks
1. **Low supply at launch** — a marketplace with no listings fails; mitigation: manually onboard 50–100 seed listings via direct outreach to land brokers before public launch
2. **Document verification liability** — if a fraudulent title slips through, the platform could face reputational or legal damage; mitigation: clear "marketing platform only" disclaimers, verified badge means documents were uploaded (not authenticated by a lawyer)
3. **Parcel data costs** — commercial cadastral data licenses can be expensive per country; mitigation: start with user-supplied GPS + boundaries, defer parcel data licensing to series A or regional expansion

## Dark Factory Readiness
**Ready:** Partial
**Notes:** Core marketplace (listings, search, map, messaging) is factory-ready. Document verification workflow needs a defined human review process before building the admin queue. Escrow question must be resolved — if included, requires a licensed payment partner or legal entity structure, which needs founder decision first.
