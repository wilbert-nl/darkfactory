# Airport Delay Notifier for Logistics Firms

## Tagline
Instant airport delay intelligence so logistics teams never scramble to recover a late shipment again.

## Target Market
Small and mid-size freight forwarders and logistics companies managing time-sensitive air cargo shipments.

## Problem
Air cargo delays cascade into missed customs windows, idle warehouse crews, and broken delivery promises to end clients. Logistics coordinators have no single source of truth for airport-wide delay trends and rely on carrier calls that often come too late. Reactive rescheduling is expensive and erodes client trust.

## Solution
A monitoring tool that tracks real-time departure and arrival delay data across watched airports and automatically alerts logistics coordinators via email or Slack when average delays exceed configurable thresholds. Teams can pre-empt disruptions rather than react to them.

## Core Features (MVP)
- Watchlist of airports with configurable delay-threshold alerts
- Real-time delay data display per airport and airline
- Email and Slack webhook notifications when thresholds are breached
- Daily digest report summarizing delay trends for watched airports
- Simple dashboard showing current delay status across all watched airports

## API Used
- Aviation Stack API — provides real-time flight status, departure/arrival delay data, and airport information for commercial flights worldwide

## Monetization
SaaS subscription — $79/month per team (up to 10 watched airports and 5 users); $149/month for unlimited airports and users.

## Tech Stack Suggestion
Next.js + Supabase + Resend + Slack Webhooks

## MVP Scope
**Included in v1:** Airport watchlist management, threshold-based alerting, email and Slack notifications, daily digest emails, delay status dashboard.
**Out of scope:** Cargo tracking integration, customs system hooks, route optimization suggestions, historical trend analytics.
