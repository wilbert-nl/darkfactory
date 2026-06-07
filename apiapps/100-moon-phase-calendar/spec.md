# Moon Phase Calendar for Farmers and Gardeners

## Tagline
Plant, prune, and harvest on the moon's schedule — the way experienced growers have for centuries.

## Target Market
Small-scale organic farmers, market gardeners, and serious home gardeners who follow biodynamic or lunar gardening practices.

## Problem
Biodynamic and lunar gardening relies on planting specific crops during specific moon phases (root days, flower days, fruit days, leaf days), but this information is scattered across physical almanacs, generic astronomy apps, and websites that are not optimized for practical growing decisions. Farmers working long days have no quick-reference tool that combines moon phase data with actionable planting guidance for their specific crops.

## Solution
A planting calendar app that combines real-time moon phase and lunar cycle data from an Astronomy API with a crop-specific planting guide, letting farmers see today's moon phase, the biodynamic day type (root/flower/fruit/leaf), and which crops to sow, transplant, prune, or harvest today — with a 30-day forward calendar for seasonal planning.

## Core Features (MVP)
- Today's moon phase display with illumination %, phase name, and biodynamic day type
- Crop activity guide for today: what to sow, transplant, prune, or harvest based on lunar phase
- 30-day forward moon phase calendar with biodynamic day type overlay
- Crop database (50+ common vegetables, herbs, fruits) with lunar planting notes
- Custom planting reminders: set alerts for optimal planting days for specific crops

## API Used
- FarmSense / Astronomy API (AstronomyAPI.com or USNO) — provides precise moon phase, illumination percentage, moonrise/moonset times, and lunar calendar data for any location and date

## Monetization
Freemium — free for current day view; Garden Pro at $4/month for 30-day forward calendar, planting reminders, and full crop database; Farm Plan at $12/month for team access and printable monthly calendars.

## Tech Stack Suggestion
Next.js + Supabase + AstronomyAPI.com + Resend (planting reminders) + Vercel.

## MVP Scope
Included in v1: today's moon phase + biodynamic day type, crop activity guide, 30-day calendar, 50-crop database, planting reminders.
Out of scope: weather integration, soil temperature data, custom biodynamic calendars by region, marketplace for seed suppliers.
