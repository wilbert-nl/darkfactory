# Weather-Triggered Ad Campaign Tool

## Tagline
Run ads that react to real weather — automatically activate the right campaign when it rains, heats up, or snows.

## Target Market
Small e-commerce brands and local service businesses (HVAC, lawn care, outdoor apparel) that run Google or Meta ads with weather-sensitive products.

## Problem
Weather dramatically affects buying intent for many product categories, but most SMB advertisers run static campaigns that ignore current conditions. Manually pausing and activating campaigns based on weather is impractical and often forgotten. Missing the right weather moment means wasted budget and lost conversions.

## Solution
A tool that connects to the business's ad accounts and lets them define weather rules (e.g., "activate rain gear campaign when precipitation > 5mm in target city"). The app polls OpenWeatherMap hourly and automatically enables or pauses campaigns when conditions match, sending a notification when a trigger fires.

## Core Features (MVP)
- Weather rule builder: condition, threshold, target city, linked campaign
- Hourly weather polling for configured cities via OpenWeatherMap
- Automatic campaign enable/pause via ad platform API (Google Ads or Meta)
- Email + Slack notification when a rule triggers
- Rule history log showing trigger events and campaign actions taken

## API Used
- OpenWeatherMap API — provides current conditions (temperature, precipitation, wind, humidity) and hourly forecasts for any city worldwide

## Monetization
Subscription — Starter at $29/month for 3 rules and 1 ad account; Pro at $79/month for unlimited rules and 3 ad accounts.

## Tech Stack Suggestion
Next.js + Supabase + BullMQ (Redis) + Resend

## MVP Scope
In scope: weather rule builder, hourly polling, Google Ads integration (Meta as stretch), email notifications, trigger log. Out of scope: forecast-based pre-scheduling, multi-channel ad support beyond one platform, mobile app in v1.
