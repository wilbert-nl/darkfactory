# Book Recommendation Engine for Bookshops

## Tagline
Give every customer a personalized reading list in seconds — powered by their favorite titles.

## Target Market
Independent bookshops and small library systems looking to enhance the customer recommendation experience without a full point-of-sale system.

## Problem
Independent bookshop staff can't personally recommend books to every walk-in customer, and most recommendation widgets are built for large online retailers with purchase history data. Small shops have no tool to offer a "if you liked X, you'll love Y" experience that also reflects their in-store inventory. Customers who don't get a recommendation often leave without buying.

## Solution
Staff or customers enter one or more favorite book titles, and the app returns personalized recommendations using Open Library metadata and subject tags. Results link to the store's inventory lookup or an order form.

## Core Features (MVP)
- Book search by title or author with cover art and metadata display
- Recommendation generation based on shared subjects, authors, and series
- Results filtered to a configurable subject/genre whitelist per store
- Embeddable widget for bookshop website (iframe or JS snippet)
- Simple admin panel to manage store branding and genre filters

## API Used
- Open Library API — provides book metadata, subject classifications, author data, and cover images for millions of titles

## Monetization
Flat subscription — $29/month per store for the hosted recommendation tool and website widget.

## Tech Stack Suggestion
Next.js + Supabase

## MVP Scope
Included in v1: book search, recommendation engine, genre filter, embeddable web widget, basic admin panel.
Out of scope: inventory sync integrations (Lightspeed, Square), customer account profiles, purchase tracking, mobile kiosk app.
