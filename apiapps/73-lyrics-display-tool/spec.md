# Lyrics Display Tool for Karaoke Venues

## Tagline
Display synced, legally sourced lyrics on any screen so your karaoke night runs without the tech headaches.

## Target Market
Karaoke bars, private event venues, and restaurants with karaoke nights that want a modern, software-based lyrics display system without expensive proprietary hardware.

## Problem
Traditional karaoke systems are expensive, proprietary, and require physical disc libraries or costly licensing subscriptions. Venue owners struggle to find specific song lyrics quickly during live events, and displaying copyrighted lyrics without a proper data source creates legal risk. Web-based solutions cobbled together from Google searches are unreliable and inconsistent.

## Solution
Staff search for a song using the Genius API, which returns clean, structured lyrics. The app displays lyrics in a fullscreen, large-font view optimized for projection, with an in-app queue manager so the next singer's song can be preloaded. Venues get a legal, browser-based lyrics display that works on any screen.

## Core Features (MVP)
- Song search powered by Genius API
- Fullscreen lyrics display mode (large font, dark background, optimized for projection)
- Song queue manager (add, reorder, remove songs)
- Artist and song metadata display (album art, year)
- Keyboard and remote-friendly navigation controls

## API Used
- Genius API — song search, lyrics text, artist metadata, and album artwork

## Monetization
SaaS subscription — $49/month per venue (unlimited song searches, up to 3 devices); $89/month (unlimited devices + priority support).

## Tech Stack Suggestion
Next.js + Supabase + Tailwind CSS (fullscreen CSS optimized for projector display).

## MVP Scope
Included in v1: song search, fullscreen lyrics display, queue manager, metadata display, keyboard navigation.
Out of scope: audio playback, instrumental tracks, scoring system, mobile singer app, multi-room support.
