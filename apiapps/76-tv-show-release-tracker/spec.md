# TV Show Release Tracker for Streaming Guides

## Tagline
Keep your streaming guide audience perfectly up to date with automated new episode and season alerts.

## Target Market
Niche streaming recommendation newsletters, entertainment blogs, and content curators who publish weekly "what to watch" guides for a dedicated subscriber base.

## Problem
Streaming guide publishers manually track premiere dates, new season drops, and episode schedules across dozens of shows — a process that is error-prone and time-consuming. Subscribers expect accurate, timely information and will unsubscribe if a guide misses major releases. There is no automated tool that turns a tracked show list into a publish-ready weekly digest.

## Solution
Publishers add shows to a watchlist; the app monitors TMDB and TVmaze APIs for new episode and season release data, and auto-generates a weekly "new this week" digest that publishers can review, edit, and send to subscribers in one click.

## Core Features (MVP)
- Show watchlist with TMDB + TVmaze metadata enrichment
- Automated weekly release detection (new episodes, season premieres, finales)
- Draft weekly digest auto-generated from detected releases
- One-click review, edit, and send to subscriber list
- Public release calendar page for audience self-service

## API Used
- TMDB API — show metadata, season and episode data, poster images, and air dates
- TVmaze API — supplementary episode-level scheduling and network data

## Monetization
SaaS subscription — $29/month (up to 2,500 subscribers, 50 tracked shows); $69/month (unlimited subscribers + tracked shows + public calendar).

## Tech Stack Suggestion
Next.js + Supabase + Resend + Vercel Cron + Tailwind CSS.

## MVP Scope
Included in v1: show watchlist, release detection, auto-generated draft digest, send to subscribers, public calendar page.
Out of scope: streaming platform availability data, personalized recommendations, podcast integration, video embeds, monetized subscriber tiers.
