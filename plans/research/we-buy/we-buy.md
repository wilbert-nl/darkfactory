# WeBuy — Research Brief

## What It Is
A classifieds buy-and-sell platform with escrow-native checkout and AI-powered condition grading from photos, targeting the trust gap that plagues Facebook Marketplace and Craigslist.

## Competitors
| Name | Description |
|------|-------------|
| Facebook Marketplace | 1.1B MAU; dominant network effect but zero buyer protection and rampant scams |
| OfferUp | 20M MAU US; has some trust features but escrow still optional |
| Mercari | 20M+ MAU; shipping-first, flat fees, but no local-first experience |
| Craigslist | $302M revenue (2024, declining); cash-only, no safety features, aging product |

## Market Size
Online classifieds: $152B (2025) growing to $1.4T by 2035 at 25% CAGR. North America holds 62.59% share. The market is massive but dominated by Facebook's network. The wedge is trust: scam complaints on Facebook Marketplace increased 72% between 2021–2023 (FTC data), creating a real opening for a safer alternative.

## MVP Features
1. Photo-first listing with AI condition grading (Excellent / Good / Fair / Poor) and auto-generated description
2. Location-based browse with radius filter and category search
3. In-app messaging with offer and counter-offer flow
4. Seller and buyer ratings with transaction history
5. Escrow checkout — payment held until buyer confirms receipt
6. Price intelligence: AI-suggested price range based on comparable recent sales

## Differentiators
1. Escrow-native checkout as the default, not an option — solves the #1 consumer complaint about classifieds
2. AI condition grading from photos reduces friction for sellers and sets honest buyer expectations
3. Price intelligence from comparable sales helps sellers price right and buyers bid confidently

## Profitability
**Model:** 5–10% transaction fee on escrow checkouts + promoted listings ($1–5/listing) + power seller subscription ($10–20/mo)
**Estimate:** $100M GMV × 8% = $8M ARR; promoted listings add $1–2M at scale

## Build Ease: 4/5
AI provides the core differentiator — listing generation from photos, condition assessment, fraud signal detection, and price comps. Backend is standard marketplace CRUD. Hard part is geographic density: escrow only works if there are enough buyers per city to make listings sell; cold start is the real risk.

## Legal Risks
- Fraud is the #1 operational risk: escrow reduces it but adds money transmission liability; may require state MTL licenses
- FOSTA-SESTA: classifieds platforms have been misused for trafficking; requires active content moderation
- Section 230 protections narrow when a platform processes payments — increased liability exposure
- Escrow regulation: holding buyer funds in transit may trigger money transmitter licensing in some states
