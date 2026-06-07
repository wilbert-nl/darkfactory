# Public Transit Delay Notifier for Commuters

## Tagline
Know before you go — get notified when your daily transit route is running late.

## Target Market
Daily commuters, remote workers with occasional office days, and HR teams managing employee commute welfare in urban areas.

## Problem
Commuters waste time standing on platforms or at bus stops because they have no proactive alert system for their specific route delays. General transit apps show delays only after you open them manually. For workers with fixed meeting schedules, even a 5-minute delay awareness window can prevent cascading tardiness.

## Solution
Users configure their regular transit routes, and the app monitors real-time delay data, proactively pushing alerts via SMS or email when a delay above a threshold is detected on their route — before the user has left home.

## Core Features (MVP)
- Route configuration using transit line, stop, and direction
- Real-time delay monitoring with configurable alert threshold (e.g., 5+ minutes)
- Proactive SMS and email alerts before the user's scheduled departure time
- Delay history log per route for the past 14 days
- Snooze and pause alerts (e.g., on vacation, work-from-home days)

## API Used
- Transitland API — provides real-time GTFS-RT feed data including vehicle positions, trip updates, and service alerts for transit agencies worldwide

## Monetization
Freemium — free for 1 route and email alerts; Pro at $5/month for 5 routes and SMS alerts.

## Tech Stack Suggestion
Next.js + Supabase + Resend + Twilio

## MVP Scope
Included in v1: route setup, delay monitoring, proactive email/SMS alerts, delay history log, alert pause toggle.
Out of scope: live map view, trip planning, multi-modal journey optimization, native mobile app.
