# Pet Adoption Alert

## Tagline
Automate adoption lead notifications so shelters spend less time on admin and more time on animals.

## Target Market
Small-to-mid-size animal shelters and rescue organizations that lack dedicated IT staff or marketing teams.

## Problem
Shelters update their listings manually and potential adopters often miss newly available animals that match their preferences. Staff spend hours responding to "do you have any golden retrievers?" inquiries that could be automated. No-shows for adoption appointments are common because there is no automated reminder or match-alert system.

## Solution
Adopters register a breed/species/age preference profile; the app polls the Petfinder API on their behalf and sends instant email or SMS alerts when a matching animal becomes available. Shelters get a dashboard showing interest levels per animal to prioritize follow-up.

## Core Features (MVP)
- Adopter preference profile (species, breed, age, size, location radius)
- Petfinder API polling on a configurable schedule (hourly/daily)
- Email and SMS alert delivery on new matches
- Shelter dashboard showing match count and inquiry queue per animal
- Unsubscribe and preference-edit self-service page

## API Used
- Petfinder API — animal listings, breed data, shelter locations, and adoption status

## Monetization
SaaS subscription for shelters — $39/month per shelter; adopter-side notifications are free.

## Tech Stack Suggestion
Next.js + Supabase + Resend (email) + Twilio (SMS) + Vercel Cron.

## MVP Scope
Included in v1: preference profiles, scheduled polling, email alerts, shelter dashboard, unsubscribe flow.
Out of scope: in-app messaging, appointment scheduling, donation processing, multi-shelter network view.
