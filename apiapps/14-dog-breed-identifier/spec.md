# Dog Breed Identifier for Pet Businesses

## Tagline
Identify any dog breed instantly and surface tailored care tips for groomers, vets, and pet shops.

## Target Market
Dog grooming salons, veterinary clinics, and pet supply shops that want to personalize their services based on breed-specific needs.

## Problem
Pet business staff frequently encounter dogs without clear breed identification, making it difficult to recommend the right grooming tools, nutrition products, or health screenings. Misidentifying a breed can lead to inappropriate product recommendations or missed health flags. There is no lightweight tool that combines breed identification with actionable care guidance for small pet businesses.

## Solution
Staff upload or capture a photo of the dog and the app identifies the breed using image recognition, then surfaces breed-specific care notes, common health concerns, grooming requirements, and product recommendations. Results can be saved to a client profile.

## Core Features (MVP)
- Photo upload or camera capture for breed identification
- Breed info card: traits, average weight, common health issues, grooming needs
- Product recommendation module (customizable by store)
- Save result to a lightweight client/pet profile
- Breed search and browse for reference without photo

## API Used
- The Dog API — provides breed images, temperament data, life expectancy, weight ranges, and breed group classifications for 300+ breeds

## Monetization
Flat subscription — $25/month per location for unlimited breed lookups, client profiles, and product recommendations.

## Tech Stack Suggestion
Next.js + Supabase + Google Cloud Vision API (for image-based breed detection)

## MVP Scope
Included in v1: photo-based breed ID, breed info card, product recommendation module, client/pet profile saving, breed reference browsing.
Out of scope: POS integration, appointment booking, health record management, multi-location management.
