# Trail Condition Aggregator for Hiking Tour Companies

## Tagline
Know before you go — real-time trail condition data so your guides lead safe, memorable hikes every time.

## Target Market
Small hiking tour operators and outdoor adventure companies running guided day hikes and multi-day trips in national parks.

## Problem
Hiking tour operators must verify trail conditions before every trip to ensure guest safety and prevent legal liability, but official condition updates are scattered across NPS park pages, ranger station calls, and social media. Aggregating this manually for multiple trails across multiple parks is time-consuming and inconsistent. A single outdated condition assessment can ruin a trip or endanger guests.

## Solution
A trail planning dashboard that pulls official trail alerts, closures, and condition notices from the NPS API for a company's frequently-used trails. Guides see a consolidated status board each morning and receive immediate alerts when a monitored trail is newly closed or flagged.

## Core Features (MVP)
- Trail watchlist management — add trails by NPS park and trail name
- Current trail alerts and closure notices pulled from NPS API
- Morning condition digest email sent to guide team each day
- Immediate alert when a watched trail changes to closed or hazard status
- Per-trip trail condition snapshot for liability record-keeping

## API Used
- NPS (National Park Service) API — provides park alerts, trail closures, conditions, visitor center hours, and amenity data for US national parks

## Monetization
SaaS subscription — $39/month for up to 10 watched trails; $89/month for unlimited trails and multi-park coverage.

## Tech Stack Suggestion
Next.js + Supabase + Resend

## MVP Scope
**Included in v1:** Trail watchlist, NPS alert and closure data display, morning digest email, real-time closure alert, per-trip condition snapshot PDF.
**Out of scope:** User-submitted trail reports, weather overlay, booking or reservation management, permit availability tracking.
