# Interest Rate Tracker for Mortgage Brokers

## Tagline
Stop refreshing Fed announcements — get instant rate change alerts and client-ready summaries automatically.

## Target Market
Independent mortgage brokers and small mortgage advisory firms (1–10 brokers) advising residential and commercial clients on loan timing.

## Problem
Mortgage brokers need to stay ahead of interest rate changes to advise clients on whether to lock rates or wait, but monitoring Federal Reserve announcements, treasury yields, and historic rate trends requires constant manual research. Missing a rate shift by even a day can cost clients thousands of dollars in unnecessary interest.

## Solution
A dashboard that tracks key interest rate indicators (Fed Funds Rate, 10Y and 30Y treasury yields, prime rate) from the FRED API in real time, alerts brokers the moment a rate changes, and auto-generates a plain-English client briefing email they can send with one click.

## Core Features (MVP)
- Live dashboard of Fed Funds Rate, 10Y/30Y treasury yields, and prime rate
- Historical rate chart (1Y, 5Y, 10Y view)
- Instant email + SMS alert on any rate change
- Auto-generated client briefing email (plain English summary of what changed and what it means for mortgages)
- FOMC meeting calendar with countdown timer

## API Used
- FRED (Federal Reserve Economic Data) API — provides official U.S. interest rate series including Fed Funds Rate, treasury yields, prime rate, and SOFR with real-time and historical data

## Monetization
Flat SaaS — $29/month per broker; team plan at $79/month for up to 5 brokers with shared client briefing templates.

## Tech Stack Suggestion
Next.js + Supabase + FRED API + Inngest (scheduled rate checks) + Resend + Twilio + Recharts + Vercel.

## MVP Scope
Included in v1: rate dashboard, historical charts, change alerts, auto-generated client briefings, FOMC calendar.
Out of scope: mortgage rate comparison from lenders, client CRM, loan application tracking, compliance archiving.
