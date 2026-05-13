# GiftChecker — Research Brief

## What It Is
A two-way gift tracking app where users log gifts given and received across events. Groups share wishlists and "already received" registries to prevent duplicate gifting.

## Competitors
| Name | Description |
|------|-------------|
| Giftster | Family-circle registry, 3M+ members; group wishlists but no giver-side tracking |
| Elfster | 17M users, Secret Santa organizer; event-focused but not persistent tracking |
| MyRegistry | Universal registry aggregator; purchase-focused, no history log |
| Amazon Wish List | Ecosystem-locked; no cross-store tracking or group gift history |

## Market Size
$800B+ US gifting industry (2024). No single "gift tracking" software market number exists, but Elfster's 17M users and Giftster's 3M members prove meaningful consumer demand. Adjacent "wishlist app" category growing alongside e-commerce. Affiliate gifting software is a $2B+ adjacent segment.

## MVP Features
1. User profiles with event types (birthday, wedding, holiday, etc.)
2. Wishlist with item links and target price
3. "Already received" marking on wishlist items
4. Group invite system (families, friend circles)
5. Claimed/reserved flag so givers can privately mark intent
6. Gift history log — what you gave, to whom, when

## Differentiators
1. Two-way tracking — logs both what you gave and what you received, not just a wishlist
2. AI gift suggestions based on recipient profile, past gifts, and budget
3. Universal receipt scan/log — snap a receipt or order confirmation to auto-log a gift

## Profitability
**Model:** Freemium ($3–5/mo or $20/yr premium) + affiliate commissions (2–8%) on items purchased via tracked links
**Estimate:** 500K paid users × $20/yr = $10M ARR; affiliate layer can add $2–4M at scale without additional users

## Build Ease: 4/5
Standard CRUD app with a social graph layer; Claude handles AI gift suggestion prompts well. The hardest part is designing airtight privacy controls so givers cannot accidentally see reserved flags for their own gifts.

## Legal Risks
- GDPR/CCPA: storing personal gift preferences and purchase data requires clear consent and deletion workflows
- FTC affiliate disclosure: affiliate links in gift suggestions must be clearly labeled
- Minor risk: group visibility settings — accidental spoiling if privacy model has gaps
