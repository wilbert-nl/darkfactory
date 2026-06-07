# National Park Event Notifier

## Tagline
Never miss a ranger program, star party, or guided event at the parks your customers love most.

## Target Market
RV park operators, campground hosts, and outdoor travel membership clubs who want to enrich guest experiences at national parks.

## Problem
National parks run hundreds of ranger-led programs, guided hikes, and special events each year, but visitors rarely discover them in time to attend. Campground operators and travel clubs have no easy way to surface relevant upcoming events to guests who are already nearby. Guests miss out on value-added experiences that would increase their satisfaction and loyalty.

## Solution
A subscription and notification tool that monitors NPS event feeds for selected parks and automatically delivers upcoming event digests to opted-in guests or members. Operators can brand the digest and configure it to send weekly or on-arrival.

## Core Features (MVP)
- Park watchlist — select one or more NPS parks to monitor for events
- Upcoming events feed display (ranger programs, guided tours, special events) from NPS API
- Weekly branded email digest of upcoming events sent to subscriber list
- On-demand event lookup widget embeddable in operator website
- Subscriber list management with opt-in/opt-out

## API Used
- NPS (National Park Service) API — provides event listings including title, description, date, time, location, contact info, and registration requirements for events across all US national parks

## Monetization
SaaS subscription — $19/month for 1 park and up to 200 subscribers; $49/month for unlimited parks and up to 2,000 subscribers.

## Tech Stack Suggestion
Next.js + Supabase + Resend

## MVP Scope
**Included in v1:** Park watchlist, NPS event feed display, weekly digest email, subscriber list management, embeddable event widget (iframe).
**Out of scope:** Event RSVP or ticketing, push notifications, two-way ranger communication, campground booking integration.
