# Gold/Silver Price Alert for Jewelry Shops

## Tagline
Know the moment gold or silver hits your target price — and reprice your inventory before margins slip.

## Target Market
Independent jewelry retailers and small goldsmith workshops that buy precious metal stock and need to manage material cost exposure.

## Problem
Jewelry shops set retail prices based on gold and silver spot prices at time of purchase, but those prices move daily and can swing 2–5% in a week. Without price alerts, shop owners reprice too late, either undercharging on stock bought before a spike or overcharging after a dip — both damaging profitability and customer trust.

## Solution
A lightweight price alert tool that tracks live gold and silver spot prices from the Metals API, lets shop owners set buy and reprice alert levels, and sends immediate SMS and email notifications when a threshold is crossed — with a simple cost-of-stock calculator showing how the current price affects margin on their inventory weight.

## Core Features (MVP)
- Live gold (XAU) and silver (XAG) spot price feed in USD and EUR
- Price alert setup: custom above/below thresholds with per-metal triggers
- Instant SMS + email alert on threshold breach
- Stock margin calculator: enter grams held, see current material cost and suggested retail price
- 30-day price history chart

## API Used
- Metals API — provides real-time and historical precious metals spot prices (XAU, XAG, XPT, XPD) in multiple currencies with minute-level granularity

## Monetization
Flat subscription — $12/month for unlimited alerts on gold and silver; $25/month adds platinum and palladium plus SMS alerts.

## Tech Stack Suggestion
Next.js + Supabase + Metals API + Twilio (SMS) + Resend + Recharts + Vercel.

## MVP Scope
Included in v1: live price feed (gold + silver), price alerts, SMS + email notifications, stock margin calculator, 30-day chart.
Out of scope: inventory management system, POS integration, platinum/palladium on base plan, mobile app.
