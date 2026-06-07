# SSL Certificate Expiry Monitor

## Tagline
Never let a client's SSL certificate expire — get alerted weeks before it happens.

## Target Market
Web agencies and freelance developers managing maintenance contracts for 5–100 client websites.

## Problem
An expired SSL certificate instantly breaks a client website and destroys trust, but agencies managing dozens of sites have no centralized view of certificate expiry across their portfolio. Calendar reminders get lost, and most hosting control panels only alert for the agency's own domains — not client-owned certificates on external hosts.

## Solution
A monitoring dashboard where agencies add client domains and receive graded alerts (30, 14, 7, and 1 day before expiry) via email and Slack, with a single-glance health grid showing certificate issuer, grade, and days remaining for every domain under management.

## Core Features (MVP)
- Add unlimited domains to monitor
- SSL Labs API scan for certificate grade (A+, A, B, F) and expiry date
- Automated alerts at 30, 14, 7, and 1 day before expiry via email and Slack
- Dashboard grid: domain, cert issuer, grade, expiry date, days remaining
- Client-facing shareable status page (white-label URL)

## API Used
- SSL Labs API (Qualys) — performs deep SSL/TLS analysis returning certificate expiry, issuer, protocol support, and security grade for any public domain

## Monetization
Tiered SaaS — Starter: $9/month for up to 20 domains; Agency: $29/month for up to 100 domains; Unlimited: $79/month with white-label client pages.

## Tech Stack Suggestion
Next.js + Supabase + Resend + Inngest (scheduled checks) + Vercel.

## MVP Scope
Included in v1: domain management, SSL Labs scans, expiry alerts (email + Slack), dashboard grid, sharable status page.
Out of scope: HTTP security header analysis, multi-user team access, custom alert thresholds, API access.
