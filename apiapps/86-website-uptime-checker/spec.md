# Website Uptime Checker for Agencies

## Tagline
Monitor every client site from one dashboard and send downtime alerts before your clients notice.

## Target Market
Digital agencies and managed-service providers with recurring website maintenance contracts for 10–200 clients.

## Problem
Agencies managing many client websites have no centralized uptime view — they rely on clients calling to report outages, which damages the agency's professional reputation. Running separate UptimeRobot accounts per client is expensive, unscalable, and produces no unified reporting agencies can use to demonstrate SLA compliance.

## Solution
A white-label uptime monitoring platform that aggregates monitoring data from UptimeRobot across all client sites into one dashboard, generates monthly SLA reports, and sends branded downtime alerts from the agency's own domain so clients see the agency as proactive rather than reactive.

## Core Features (MVP)
- Bulk add domains; sync monitor status from UptimeRobot API
- Unified dashboard: uptime %, response time, last incident per domain
- Downtime alerts via email and SMS with agency branding
- Monthly automated SLA PDF report per client
- Public-facing client status page with custom subdomain

## API Used
- UptimeRobot API — provides real-time monitor status, uptime ratio, response times, and alert log data for all configured monitors

## Monetization
Per-domain SaaS — $0.50/domain/month, minimum $15/month; Agency plan at $99/month for unlimited domains and white-label reports.

## Tech Stack Suggestion
Next.js + Supabase + Resend + Twilio (SMS) + Puppeteer (PDF reports) + Vercel.

## MVP Scope
Included in v1: domain sync from UptimeRobot, unified dashboard, email/SMS alerts, monthly PDF reports, public status pages.
Out of scope: native monitoring engine (relies on UptimeRobot), multi-region checks, API endpoint monitoring with payload assertions.
