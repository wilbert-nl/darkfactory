# Daily Astronomy Picture Newsletter Builder

## Tagline
Build and send a stunning astronomy newsletter using NASA's daily space photo — zero design skills needed.

## Target Market
Science teachers, astronomy clubs, planetarium educators, and curiosity-driven newsletter creators.

## Problem
Educators and enthusiasts who want to share NASA's Astronomy Picture of the Day face the friction of manually downloading images, writing context, and formatting emails in separate tools. Doing this consistently every day is tedious, leading to irregular publishing. There is no dedicated tool that automates the end-to-end APOD newsletter workflow.

## Solution
The app fetches the daily NASA APOD image and description automatically, lets users add their own commentary, and sends a beautifully formatted email to their subscriber list on a schedule. Subscribers can browse a searchable archive of past issues.

## Core Features (MVP)
- Auto-fetch of NASA APOD image, title, and description each day
- Email composer with user commentary field and customizable branding
- Subscriber list management (import CSV, unsubscribe handling)
- Scheduled send (daily, weekly) or manual send
- Searchable web archive of past issues for subscribers

## API Used
- NASA APOD API — provides the daily Astronomy Picture of the Day including image URL, title, description, and media type

## Monetization
Freemium — free for up to 100 subscribers; Pro at $12/month for unlimited subscribers, custom domain sending, and archive access.

## Tech Stack Suggestion
Next.js + Supabase + Resend

## MVP Scope
Included in v1: APOD auto-fetch, email composer, subscriber management, scheduled send, public archive page.
Out of scope: paid newsletter subscriptions, Stripe integration, social media auto-posting, native mobile app.
