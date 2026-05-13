# Rentals — Research Brief

## What It Is
A peer-to-peer rental marketplace where individuals list items, equipment, or short-term property for rent, with integrated payments, deposit holds, and damage claim workflows.

## Competitors
| Name | Description |
|------|-------------|
| Fat Llama | Leading P2P item rental platform in US and UK; broad category coverage |
| Turo | $1.5B valuation; P2P car rental; dominant in its vertical |
| Spinlister | Bikes, surfboards, and sports gear rentals; niche but established |
| Neighbor | $53M raised; P2P storage space rental; vertical-specific playbook |

## Market Size
P2P rental apps market: $19.6B (2025) growing at 10.9% CAGR to 2034. Consumers represent 66.4% of user base. The category is broad enough that winning one vertical (e.g., power tools, event equipment, outdoor gear) before expanding is a proven go-to-market strategy, as evidenced by Turo and Neighbor.

## MVP Features
1. Item listing with photos, description, pricing (hourly/daily/weekly), and availability calendar
2. Browse by location radius and category
3. Booking request + payment with deposit hold via Stripe
4. ID verification for renters (Stripe Identity or similar)
5. Damage claim workflow with photo evidence and deposit release/dispute
6. Mutual review system post-rental

## Differentiators
1. Win one vertical first — power tools, event gear, or outdoor equipment — before going broad
2. Embedded per-transaction insurance (via Stripe or dedicated provider) removing the #1 trust barrier
3. Hyperlocal neighborhood-level aggregation (block-level supply visibility vs. city-level)

## Profitability
**Model:** 15–25% commission on GMV + insurance upsell (5–10% of rental value) + power lister subscription ($20–50/mo for frequent listers)
**Estimate:** $50M GMV × 20% take rate = $10M ARR; insurance upsell adds ~$2.5M on top

## Build Ease: 3/5
Marketplace architecture is well understood; AI helps with listing descriptions, pricing suggestions, and fraud detection. Hard parts: trust and safety infrastructure, insurance partnership negotiations, ID verification integration, and the classic marketplace cold start on the supply side.

## Legal Risks
- Liability for damage or injury involving rented items; platform indemnification clauses required
- Insurance regulatory compliance: offering insurance as a product may trigger state insurance licensing requirements
- Fraud and item theft: renter takes item and disappears; deposit holds and ID verification reduce but do not eliminate this
- Local zoning for property rentals: short-term property rental listings may conflict with local ordinances (Airbnb-style regulation creep)
