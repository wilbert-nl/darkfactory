# Movie Showtimes Aggregator for Local Cinemas

## Tagline
Give your independent cinema a professional showtime listing page without the enterprise software price tag.

## Target Market
Independent and arthouse cinemas, drive-in theaters, and small cinema chains that lack the budget for enterprise ticketing software but need a credible public-facing listing.

## Problem
Independent cinemas often have outdated or poorly formatted websites that make it hard for potential customers to find showtimes, film details, and ratings. They lack the resources to maintain rich film metadata manually for every title they screen. Potential customers abandon cinema websites for mainstream aggregators, reducing direct ticket sales.

## Solution
The app lets cinema staff enter their screening schedule (film title, date, time, screen), and it automatically enriches each listing with poster art, synopsis, runtime, rating, and trailers by matching against the TMDB database. The result is a professional, embeddable showtimes page that cinema staff maintain with minimal effort.

## Core Features (MVP)
- Showtime entry form for cinema staff (title, date, time, screen)
- Automatic TMDB enrichment (poster, synopsis, rating, runtime, genre, trailer link)
- Public-facing showtimes listing page (embeddable or standalone)
- Date and genre filter for audience-facing view
- Basic admin dashboard for managing listings

## API Used
- TMDB API — movie metadata including posters, synopses, ratings, runtimes, genres, and trailer links

## Monetization
SaaS subscription — $39/month per cinema location; $79/month (up to 5 screens + custom domain + embeddable widget).

## Tech Stack Suggestion
Next.js + Supabase + Tailwind CSS + Vercel (hosting).

## MVP Scope
Included in v1: showtime entry, TMDB auto-enrichment, public listing page, date/genre filter, admin dashboard.
Out of scope: online ticket sales, seat selection, loyalty programs, multi-language, mobile app, CRM integration.
