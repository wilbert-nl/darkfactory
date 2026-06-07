# Government Tender Alert for Consultants

## Tagline
Never miss a government contract opportunity that fits your practice — get matched tenders in your inbox daily.

## Target Market
Independent management consultants, small consulting firms, and boutique advisory practices (1–20 consultants) pursuing government contracts in the US and UK.

## Problem
Government contracting opportunities are published across fragmented portals (SAM.gov, Contracts Finder, state procurement sites) and disappear fast — most consultants only hear about tenders through networks or chance, missing opportunities that are a perfect fit. Manually scanning these portals daily is impractical for a small firm without dedicated BD staff.

## Solution
A tender intelligence platform that continuously monitors SAM.gov and Contracts Finder for new procurement notices matching the consultant's practice area keywords, NAICS/CPV codes, and budget range — delivering a curated daily digest with one-click save, deadline tracking, and a simple bid/no-bid decision log.

## Core Features (MVP)
- Profile setup: practice areas, NAICS codes (US) or CPV codes (UK), budget range, geographic preference
- Daily automated scan of SAM.gov and Contracts Finder for matching tenders
- Email digest with matched tenders ranked by relevance score
- Tender detail page: description, agency, deadline, value, documents link
- Bid/no-bid log with deadline reminders

## API Used
- SAM.gov Opportunities API — provides US federal contract opportunities, solicitations, and award notices with full search and filter capabilities; Contracts Finder API — provides UK government procurement notices from all public sector buyers

## Monetization
Tiered SaaS — Starter: $29/month (US or UK only, 3 keyword profiles); Pro: $79/month (US + UK, unlimited profiles, Slack alerts, bid log).

## Tech Stack Suggestion
Next.js + Supabase + SAM.gov API + Contracts Finder API + Inngest (daily scheduled scan) + Resend + Vercel.

## MVP Scope
Included in v1: profile setup, daily SAM.gov and Contracts Finder scan, email digest, tender detail page, bid/no-bid log, deadline reminders.
Out of scope: state/local government portals, EU TED database, automated proposal drafting, CRM integration.
