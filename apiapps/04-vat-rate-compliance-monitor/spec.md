# VAT Rate Compliance Monitor

## Tagline
Stay automatically compliant when VAT rates change — no more manual spreadsheet updates.

## Target Market
SaaS companies, digital product sellers, and small e-commerce businesses selling to EU customers.

## Problem
VAT rates across EU member states change more often than businesses realize, and failing to apply the correct rate leads to compliance risk and potential penalties. Manually tracking rate changes across 27+ countries is error-prone and time-consuming. Most SMBs only find out about a change after their accountant flags it.

## Solution
The app monitors VAT rates for selected countries and sends an immediate alert whenever a rate change is detected. Users maintain a rate history per country and can export current rates for use in invoicing tools.

## Core Features (MVP)
- Country VAT rate dashboard showing standard, reduced, and super-reduced rates
- Change detection with historical diff view (old rate vs new rate + date)
- Email alerts on rate changes for subscribed countries
- Exportable rate table (CSV/JSON) compatible with invoicing tools
- Rate validity calendar showing upcoming known changes

## API Used
- VAT Rates API (vatcomply.com or apilayer VAT) — provides current VAT rates, validation, and historical data for EU + non-EU countries

## Monetization
Flat subscription — $29/month for up to 10 countries monitored; $59/month for unlimited countries with API access for direct integration.

## Tech Stack Suggestion
Next.js + Supabase + Resend

## MVP Scope
Included in v1: country rate dashboard, change detection, email alerts, CSV export.
Out of scope: direct integration with Stripe Tax or accounting software, VAT number validation, invoice generation.
