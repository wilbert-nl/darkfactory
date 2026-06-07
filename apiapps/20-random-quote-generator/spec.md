# Random Quote Generator for Motivational Apps

## Tagline
Build a branded daily quote experience your audience actually looks forward to — in minutes.

## Target Market
Coaches, wellness brands, corporate HR teams, and newsletter creators building daily motivation products for their communities.

## Problem
Creators who want to deliver a consistent daily quote to their audience must either curate quotes manually (time-consuming) or rely on generic quote widgets that carry another brand's identity. There is no white-label tool that automates daily quote curation, branding, and delivery for non-technical creators. The result is either inconsistent delivery or a forgettable off-brand experience.

## Solution
The app fetches curated quotes by topic or author, lets users apply their brand (logo, colors, typography), and delivers a beautifully formatted daily quote via email, embeddable widget, or shareable image — all on autopilot.

## Core Features (MVP)
- Quote library browser filtered by topic (motivation, leadership, resilience) and author
- Branded quote card builder with logo, font, and color customization
- Subscriber list management with daily email delivery
- Embeddable quote widget for websites (auto-refreshes daily)
- One-click shareable quote image export for social media

## API Used
- Quotable API — provides a free, open-source REST API of curated quotes filterable by author, tag, and length

## Monetization
Freemium — free for up to 50 subscribers and basic branding; Pro at $15/month for unlimited subscribers, full brand customization, and social image exports.

## Tech Stack Suggestion
Next.js + Supabase + Resend + Cloudinary (for image generation)

## MVP Scope
Included in v1: quote browsing by topic/author, brand card builder, subscriber management, daily email delivery, embeddable widget.
Out of scope: AI-generated quotes, custom quote submission by users, Slack/Teams delivery, analytics beyond open rates.
