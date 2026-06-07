# URL Shortener with Click Analytics

## Tagline
Shorten your links, own your data — track every click with branded short URLs and real-time analytics.

## Target Market
Marketing teams at SMBs running multi-channel campaigns who need link tracking without paying for enterprise tools.

## Problem
Free URL shorteners (bit.ly) hide analytics behind paywalls and use generic domains that erode brand trust. Marketing teams need to know which channels, geographies, and devices are driving clicks to optimize spend. Most small teams cannot justify the cost of enterprise link management platforms.

## Solution
A branded URL shortener where businesses use their own custom domain to create short links, then track every click with a real-time dashboard showing referrer source, device type, country, and browser — all without third-party cookies.

## Core Features (MVP)
- Custom domain support for branded short links
- Link creation with optional custom slug
- Real-time click dashboard: total clicks, unique clicks, country, device, referrer
- UTM parameter builder integrated into link creation
- Link expiry and password protection options

## API Used
- Rebrandly API — handles link creation, custom domain management, and click event data for branded short URLs

## Monetization
Freemium — 5 branded links free; Growth at $19/month for 500 links and full analytics; Business at $49/month for unlimited links and custom domains.

## Tech Stack Suggestion
Next.js + Supabase + Vercel Edge Functions

## MVP Scope
In scope: link creation, custom domain via Rebrandly, click analytics dashboard, UTM builder, link settings. Out of scope: team workspaces, API access for developers, A/B link testing, retargeting pixel integration in v1.
