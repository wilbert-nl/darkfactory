# Artist Tour Date Notifier

## Tagline
Get ahead of ticket resale opportunities by knowing tour dates the moment they're announced.

## Target Market
Independent ticket resellers and small ticket broker businesses that rely on speed-to-market to acquire inventory before prices surge.

## Problem
Ticket resellers manually monitor dozens of artist pages and venue sites for tour announcements, missing early windows when face-value tickets are available in quantity. Being even a few hours late on a major announcement means losing access to the best inventory at the best prices. There is no automated monitoring tool designed specifically for resellers who track large artist portfolios.

## Solution
Resellers build a watchlist of artists and the app monitors Bandsintown for new tour date announcements, sending instant alerts via email and SMS with event details, venue capacity hints, and direct ticket purchase links — giving them a head start on acquisition.

## Core Features (MVP)
- Artist watchlist (add/remove artists by name)
- Bandsintown API polling for new event announcements
- Instant email and SMS alert on new tour date detection
- Alert includes: artist, venue, city, date, ticket link
- Event history log per artist with alert timestamps

## API Used
- Bandsintown API — artist event data, tour dates, venue info, and ticket purchase links

## Monetization
SaaS subscription — $39/month (up to 50 artists tracked); $99/month (unlimited artists + SMS alerts + priority polling).

## Tech Stack Suggestion
Next.js + Supabase + Resend (email) + Twilio (SMS) + Vercel Cron.

## MVP Scope
Included in v1: artist watchlist, Bandsintown polling, email + SMS alerts, event detail view, alert history log.
Out of scope: automated ticket purchasing, price tracking, secondary market data, team seat sharing, mobile app.
