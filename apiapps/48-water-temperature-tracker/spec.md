# Water Temperature Tracker for Surf Schools

## Tagline
Give students and instructors the exact sea conditions they need to dress right and surf safely every session.

## Target Market
Small surf schools and surf camps operating at coastal locations who manage group lesson bookings.

## Problem
Surf instructors need to advise students on wetsuit thickness and session safety before they arrive, but water temperature varies significantly by season and location. Checking marine conditions across multiple sites requires visiting several data sources, and there is no easy way to surface this information directly to students ahead of their lesson.

## Solution
A condition briefing tool that pulls real-time and forecast water temperature, wave height, and swell data for a school's beach locations. Schools can auto-send a pre-session conditions briefing to booked students, including wetsuit recommendations, the morning before each lesson.

## Core Features (MVP)
- Beach location setup with monitored marine data points
- Current and 7-day water temperature and wave height forecast display
- Automated wetsuit recommendation based on water temperature thresholds (configurable)
- Pre-lesson conditions email sent to students booked for next-day sessions
- Instructor dashboard showing today's conditions at a glance

## API Used
- Open-Meteo Marine API — provides ocean wave height, swell direction, swell period, and sea surface temperature forecasts by coastal coordinates

## Monetization
SaaS subscription — $29/month for 1 beach location; $59/month for up to 5 locations and automated student emails.

## Tech Stack Suggestion
Next.js + Supabase + Resend

## MVP Scope
**Included in v1:** Location setup, marine data polling and display, 7-day forecast, wetsuit recommendation logic, automated pre-lesson email to student list, instructor dashboard.
**Out of scope:** Online booking system, payment processing, surf video library, real-time wave buoy IoT integration.
