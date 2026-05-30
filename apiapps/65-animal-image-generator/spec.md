# Animal Image Generator

## Tagline
On-demand, royalty-free animal photos for children's apps — no design team required.

## Target Market
Indie developers and small studios building children's educational apps, games, or e-books who need a reliable source of safe, age-appropriate animal imagery.

## Problem
Children's app developers need large, diverse libraries of animal images that are royalty-free, safe for all ages, and consistent in style. Stock photo subscriptions are expensive, and free APIs return inconsistent image quality or require manual curation. Searching multiple APIs for each animal type adds significant development overhead.

## Solution
A single API-like dashboard and embeddable widget that unifies Unsplash nature/animal photos, random dog images (Dog API), and cat photos (Cat API) behind one search interface. Developers can browse, filter by animal type, download, or grab a direct embed URL — and integrate it into their app with a single snippet.

## Core Features (MVP)
- Unified search across Unsplash (animals), Dog API, and Cat API
- Animal type filter (dogs, cats, wildlife, farm animals)
- Image preview grid with safe-search enforced
- One-click copy of embed URL or direct download
- API key access for programmatic use in apps

## API Used
- Unsplash API — high-quality wildlife and animal photography
- Dog CEO Dog API — random dog breed images
- The Cat API — random cat images and breed data

## Monetization
Freemium + API key tiers — Free (100 requests/day); $15/month (5,000 requests/day + bulk download); $49/month (unlimited + commercial license badge).

## Tech Stack Suggestion
Next.js + Supabase + Cloudflare Workers (API proxy/rate-limit) + Tailwind CSS.

## MVP Scope
Included in v1: unified search, animal type filter, preview grid, embed URL copy, download, API key generation.
Out of scope: image editing, AI generation, video clips, user-uploaded content, age-rating classification.
