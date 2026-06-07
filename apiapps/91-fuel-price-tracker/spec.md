# Fuel Price Tracker for Trucking Companies

## Tagline
Track diesel prices by region in real time and never lose money on fuel surcharges again.

## Target Market
Small and mid-sized trucking companies and freight brokers (5–50 trucks) managing fuel surcharge clauses in carrier contracts.

## Problem
Fuel is the single largest variable cost for trucking companies, and fuel surcharge rates in contracts are pegged to regional diesel price indices that change weekly. Fleet managers manually check pump prices and government indices to recalculate surcharges, losing money when they miss updates and damaging client relationships when they apply them incorrectly.

## Solution
A dashboard that pulls regional diesel prices from the CollectAPI Fuel data feed, automatically calculates the correct fuel surcharge percentage based on each contract's formula, and alerts fleet managers when a surcharge adjustment is due — with a surcharge invoice line item ready to send to clients.

## Core Features (MVP)
- Regional diesel price feed (US, EU regions) via CollectAPI Fuel
- Contract library: store client contracts with their fuel surcharge formulas
- Auto-calculated surcharge % based on current vs. base price
- Weekly alert when surcharge threshold is crossed (email + Slack)
- Surcharge statement PDF ready for client billing

## API Used
- CollectAPI Fuel — provides daily and weekly retail fuel price data by country and region, including diesel, petrol, and LPG prices

## Monetization
Flat SaaS — $29/month for up to 10 contracts; $79/month for unlimited contracts, Slack alerts, and PDF billing statements.

## Tech Stack Suggestion
Next.js + Supabase + CollectAPI Fuel + Inngest (weekly scheduled checks) + Resend + Puppeteer (PDF) + Vercel.

## MVP Scope
Included in v1: regional price feed, contract library, surcharge calculator, threshold alerts, PDF billing statement.
Out of scope: fleet telematics integration, fuel card reconciliation, route optimization, multi-currency support.
