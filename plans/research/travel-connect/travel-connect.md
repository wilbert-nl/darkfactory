# TravelConnect — Research Brief

## What It Is
A two-sided marketplace where travelers post dream itineraries and travel agencies compete to fulfill them — an Upwork-style reverse RFQ model applied to travel, replacing the current one-way "browse packages" dynamic with demand-driven agency discovery.

## Competitors
| Name | Description |
|------|-------------|
| Travefy | #1 US travel advisor platform; 30K+ brands; itinerary builder + CRM; agency-facing only |
| Tern | VC-backed ($17M raised); 8K+ advisors; $2B annualized bookings; advisor workflow tool |
| mTrip | White-label platform; AI Import Wizard (Feb 2026); B2B focus |
| Sabre Mosaic | Enterprise TMC platform; large corporate travel management; not consumer-facing |

## Market Size
Global OTA market $561.3B (2026) growing to $761.3B by 2031. Independent travel advisor volume is up 30%+ post-COVID. Gen Z and Millennials increasingly prefer curated, expert-guided packages over DIY booking. The key gap: no platform currently lets travelers post open trip requests and receive competing agency proposals — this reverse-RFQ mechanic is entirely unserved.

## MVP Features
1. Traveler profile and dream trip request form (destination, dates, group size, budget, travel vibe/tags)
2. Agency listing with credentials, IATA badge, specializations, and verified reviews
3. Open request feed where credentialed agencies browse and submit proposals
4. Side-by-side proposal comparison view for travelers
5. In-app messaging and negotiation between traveler and shortlisted agencies
6. Booking confirmation and payment escrow with milestone release

## Differentiators
1. Reverse RFQ model — travelers post open requests, agencies compete; no major platform does this for leisure travel
2. Agency trust and vetting — IATA badge verification, license upload, review system with dispute mediation
3. Niche and specialty matching — adventure, wellness, pilgrimage, accessible travel, halal tourism; travelers filter by specialty not just destination

## Profitability
**Model:** Commission 8–12% on confirmed bookings + agency subscription ($99–299/mo for lead access and featured placement)
**Estimate:** 100 agencies × $150/mo + 20 bookings/mo × $2K avg × 10% = $19K MRR at early scale. At 1,000 agencies + 200 bookings/mo = $190K MRR / $2.3M ARR. Commission scales with GMV.

## Build Ease: 4/5
AI handles proposal drafting assistance for agencies, smart itinerary suggestions, match scoring between requests and agency specialties, and review summarization. Hard parts are payment escrow legal complexity, multi-currency settlement, dispute mediation workflows, and chargeback risk on high-value travel transactions.

## Legal Risks
- ATOL / Package Travel Regulations (UK/EU) — platforms that "sell" packages may need licensing; must be structured strictly as a marketplace connecting parties, not as a package seller
- Chargeback and dispute risk — travel is high-value and high-cancellation; escrow release terms must be watertight and legally reviewed
- PCI-DSS and GDPR — handling passport data, payment info, and personal travel details triggers both obligations
- Cancellation liability — platform T&Cs must clearly assign cancellation terms to the agency, not the marketplace; obtain legal review before launch
