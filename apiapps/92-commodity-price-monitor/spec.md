# Commodity Price Monitor for Wholesalers

## Tagline
Get daily commodity price alerts so you buy and sell at the right moment — not the wrong one.

## Target Market
Small wholesale distributors and trading companies dealing in agricultural, energy, or industrial commodities who lack a Bloomberg terminal but need price intelligence.

## Problem
Wholesale commodity buyers make purchasing and pricing decisions based on spot prices that fluctuate daily, but tracking multiple commodities across different sources manually is time-consuming and error-prone. Missing a significant price move by even a day can erase margin on large purchase orders.

## Solution
A commodity price monitoring dashboard that pulls real-time and historical spot prices from Alpha Vantage Commodities for the user's tracked commodity list, lets them set price alert thresholds, and sends instant notifications when a price crosses a defined buy or sell level — with a 90-day chart for trend context.

## Core Features (MVP)
- Commodity watchlist (oil, natural gas, wheat, corn, copper, coffee, sugar, etc.)
- Live and end-of-day spot price feed via Alpha Vantage
- Price alert setup: above/below threshold triggers per commodity
- 90-day historical price chart per commodity
- Daily morning briefing email with all tracked commodity prices

## API Used
- Alpha Vantage Commodities API — provides real-time and historical spot prices for global commodities including energy, metals, grains, and soft commodities

## Monetization
Tiered SaaS — Free: 3 commodities, daily prices; Starter: $19/month for 15 commodities, alerts; Pro: $49/month for unlimited commodities, intraday prices, API access.

## Tech Stack Suggestion
Next.js + Supabase + Alpha Vantage API + Inngest + Resend + Recharts + Vercel.

## MVP Scope
Included in v1: commodity watchlist, live prices, price alerts, 90-day chart, daily email briefing.
Out of scope: futures contract tracking, portfolio P&L calculation, trading execution, mobile app.
