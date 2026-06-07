# Electricity Carbon Intensity Monitor for Data Centers

## Tagline
Shift your compute workloads to the greenest grid window automatically and prove it to your clients.

## Target Market
Small colocation data centers, cloud-native startups, and managed hosting companies that want to demonstrate carbon-aware computing without a dedicated sustainability engineer.

## Problem
Data center energy consumption is under increasing scrutiny from enterprise clients and regulators, but carbon intensity varies dramatically by region and time of day based on renewable energy availability. Most operators have no visibility into grid carbon intensity in real time, so workloads run on the dirtiest grid hours by default.

## Solution
A dashboard that continuously pulls real-time electricity carbon intensity data from ElectricityMap for the data center's grid region, displays the cleanest upcoming compute windows, and provides a webhook trigger or API endpoint teams can use to schedule batch jobs during low-carbon periods — with a monthly green compute report for client-facing ESG documentation.

## Core Features (MVP)
- Region selector (mapped to ElectricityMap zones)
- Live carbon intensity gauge (gCO2eq/kWh) with 24-hour forecast
- Cleanest upcoming hour/window highlighter
- Webhook trigger that fires when intensity drops below a configurable threshold
- Monthly green compute report: % of hours in low-carbon window

## API Used
- ElectricityMap API — provides real-time and forecast electricity carbon intensity by grid zone, including breakdown by generation source (solar, wind, gas, coal)

## Monetization
Flat SaaS — $39/month per region monitored; $149/month for up to 10 regions with webhook triggers and monthly reports.

## Tech Stack Suggestion
Next.js + Supabase + ElectricityMap API + Inngest (scheduled polling) + Resend + Vercel.

## MVP Scope
Included in v1: region picker, live intensity gauge, 24h forecast, threshold webhooks, monthly report PDF.
Out of scope: direct workload scheduler integration, Kubernetes operator, carbon offset purchasing, multi-tenant billing.
