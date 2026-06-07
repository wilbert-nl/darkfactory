# EV Charging Station Finder for Fleet Managers

## Tagline
Plan every electric fleet route with reliable charging stops — no more range anxiety for your drivers.

## Target Market
Small and mid-sized businesses operating mixed or fully electric vehicle fleets (5–100 vehicles) for delivery, field service, or transportation.

## Problem
Fleet managers converting to EVs struggle to plan routes that account for charging infrastructure availability, connector compatibility, and charging speed — information that is scattered across multiple apps and often outdated. Drivers waste time searching for compatible chargers mid-route, causing late deliveries and overtime costs.

## Solution
A fleet route planning tool that overlays EV charging station data from Open Charge Map onto planned routes, filters by connector type and minimum charging speed, and generates driver-ready itineraries with charging stops pre-planned — integrated with a simple fleet dashboard showing each vehicle's connector profile.

## Core Features (MVP)
- Fleet vehicle registry with connector type (CCS, CHAdeMO, Type 2, Tesla) and range per vehicle
- Route planner: enter start/end point and see charging stops auto-inserted based on vehicle range
- Charging station filter: minimum kW, connector type, network, real-time availability status
- Driver itinerary export (PDF + Google Maps link)
- Fleet dashboard: vehicles, their connector profiles, and saved routes

## API Used
- Open Charge Map API — provides global EV charging station locations, connector types, charging speeds, operator info, and real-time status where available

## Monetization
Per-vehicle SaaS — $5/vehicle/month, minimum 5 vehicles ($25/month); annual billing at 15% discount.

## Tech Stack Suggestion
Next.js + Supabase + Open Charge Map API + Mapbox GL JS + Puppeteer (PDF itineraries) + Vercel.

## MVP Scope
Included in v1: fleet registry, route planner with auto charging stops, station filters, PDF/Maps driver itinerary, fleet dashboard.
Out of scope: real-time vehicle telematics, live battery state sync, automatic route replanning, native mobile app.
