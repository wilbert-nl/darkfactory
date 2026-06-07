# Cat Fact Newsletter

## Tagline
Keep your pet-loving audience engaged with a daily dose of verified cat trivia, delivered on autopilot.

## Target Market
Pet product brands, pet subscription box companies, and veterinary clinics looking to grow and retain an email audience.

## Problem
Pet brands struggle to produce a steady stream of lightweight, shareable content that keeps subscribers engaged between promotional emails. Writing original educational content is expensive, and generic newsletters see low open rates. There is no plug-and-play newsletter tool pre-loaded with a curated animal content feed.

## Solution
The app pulls a fresh cat fact daily from the Cat Facts API, wraps it in a branded email template, and sends it to the brand's subscriber list on a schedule. Brands can add their own promotional block below the fact, track open and click rates, and grow their list with an embeddable signup widget.

## Core Features (MVP)
- Daily cat fact fetch from Cat Facts API
- Branded email template builder (logo, colors, promo block)
- Scheduled send with configurable frequency (daily/weekly)
- Subscriber list management with import/export
- Open and click analytics dashboard

## API Used
- Cat Facts API — random and curated cat trivia facts

## Monetization
Tiered SaaS — Free (up to 500 subscribers, Cat Facts branding); $19/month (up to 5,000 subscribers, white-label); $59/month (unlimited subscribers + custom domain).

## Tech Stack Suggestion
Next.js + Supabase + Resend + React Email.

## MVP Scope
Included in v1: fact fetch, branded template, scheduled send, subscriber management, basic open/click analytics.
Out of scope: multi-animal fact types, A/B testing, SMS delivery, landing page builder, paid subscriber tiers.
