# NFL/NBA Game Day Notifier for Venues

## Tagline
Fill seats on game day — automatically alert your customers when their team plays next so they show up at your venue.

## Target Market
Sports bars, restaurants, and entertainment venues in the US that host NFL and NBA watch parties and want to drive predictable game-day revenue.

## Problem
Venues lose potential game-day revenue because customers simply forget when games are scheduled, especially mid-week NBA matchups. Manually sending game-day notifications requires staff time and a consistent process most small venues don't have. Generic marketing emails get ignored, but a timely "your team plays tonight" message converts.

## Solution
A venue management tool where the owner selects their featured teams and connects their customer list. The app automatically sends branded game-day alert emails and SMS messages to subscribers the morning of each game, including tip-off/kickoff time, opponent, and a custom venue CTA.

## Core Features (MVP)
- NFL and NBA team selection per venue
- Customer subscriber list management (import CSV or embed signup widget)
- Automated game-day morning alerts via email and SMS
- Customizable message templates with venue branding and CTA
- Game schedule display for venue owner dashboard

## API Used
- MySportsFeeds API — provides NFL and NBA schedules, team rosters, game status, and real-time score data for building sports-aware applications

## Monetization
Subscription — $39/month per venue for 1 sport and up to 500 subscribers; $79/month for both sports and unlimited subscribers.

## Tech Stack Suggestion
Next.js + Supabase + Resend + Twilio

## MVP Scope
In scope: NFL/NBA schedule polling, subscriber management, automated game-day alerts, template editor, venue dashboard. Out of scope: live in-game score push notifications, POS system integration, multi-location chain management in v1.
