# LandMatch — Research Brief

## What It Is
A specialized property marketplace connecting land sellers with land buyers, focused on lot/hectare-scale transactions with parcel maps, document verification, and buyer intent matching — with a deliberate focus on underserved international markets (SEA, LatAm, Africa) where no major player competes.

## Competitors
| Name | Description |
|------|-------------|
| LandWatch / CoStar | Largest US rural land portal; 6.8M engaged buyers; strong broker network |
| Lands of America | 2,040+ broker partners; dominant in US farm/ranch/recreational land |
| Landmodo | Consumer FSBO land listings; US-focused; no document verification |
| AcreTrader | Farmland investment platform; accredited investors only; US only |

## Market Size
US farm real estate valued at $3.67 trillion total; average $4,350/acre (+4.3% YoY). Land.com Network serves 6.8M buyers. The entire SEA/LatAm/Africa land market is effectively undigitized — no dominant marketplace exists outside the US. Philippines, Indonesia, Vietnam, Colombia, and Kenya represent high-growth land transaction markets with zero established digital-first platforms.

## MVP Features
1. Land listing with acreage, zoning, GPS coordinates, and boundary map upload
2. Advanced search and filter (size range, land type, price, region, zoning category)
3. Interactive map view with parcel overlays (Mapbox or Google Maps)
4. Document upload with verified badge (title deed, survey, tax declaration)
5. Buyer-seller in-app messaging and offer submission workflow
6. Saved searches with email alerts for new matching listings
7. Buyer intent posts ("Looking for 2ha agricultural land in Batangas under ₱2M")

## Differentiators
1. Document verification layer — competitors have thin or no quality control on title docs; verified badges build trust
2. International/SEA-first focus — all major competitors are US-only; SEA, LatAm, and Africa are wide open
3. Buyer intent matching — buyers post requirements, sellers get alerted when a match posts; reverse discovery model

## Profitability
**Model:** Freemium listings + boosted/featured placement ($50–500/listing) + optional 1–2% escrow facilitation fee on completed transactions
**Estimate:** 500 listings × $50/mo avg boost = $25K MRR / $300K ARR in year 1. Escrow layer on $1M/mo GMV adds $10K/mo. Path to $500K+ ARR by year 2 with international expansion.

## Build Ease: 4/5
AI accelerates listing description generation from raw inputs, document OCR for title/survey extraction, and map boundary parsing. The hard parts are sourcing parcel data by country (registry APIs differ per jurisdiction), licensing costs for cadastral data overlays, and keeping document verification credible without becoming a legal liability.

## Legal Risks
- Title fraud liability — platform must disclaim it is a marketing tool only, not legal due diligence; include explicit terms
- US broker licensing — structuring as a marketing/listing platform (not a transaction agent) avoids NAR/broker law; do not handle money for US transactions without a license
- Foreign land ownership restrictions — Philippines, Thailand, Vietnam, and Indonesia all restrict foreign freehold ownership; listings must surface this clearly
- GDPR / data privacy — collecting government-issued ID for document verification triggers personal data obligations; implement minimum-data policy and right-to-deletion
