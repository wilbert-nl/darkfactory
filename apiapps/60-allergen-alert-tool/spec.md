# Allergen Alert Tool for Food Delivery

## Tagline
Protect every customer from hidden allergens by surfacing clear ingredient and allergen data before the order is placed.

## Target Market
Small and mid-size food delivery platforms and ghost kitchen operators who manage their own ordering systems and menus.

## Problem
Food delivery platforms face increasing legal and safety pressure to display accurate allergen information for every menu item, but maintaining this data manually across hundreds of products is error-prone and time-consuming. Customers with allergies frequently contact support before ordering because allergen data is missing or unclear. A single allergen incident can result in regulatory fines and irreparable brand damage.

## Solution
A menu allergen management tool that lets operators search the Open Food Facts database to pre-fill product ingredient and allergen data, and then maintain a verified allergen matrix for their full menu. Customers see clear allergen badges on each item at checkout, and operators get a compliance-ready allergen report.

## Core Features (MVP)
- Menu item management with allergen data input (manual or pre-filled from Open Food Facts)
- Allergen matrix view — grid of all menu items vs. the 14 major allergens
- Embeddable allergen badge display for each menu item (iframe or API)
- Customer-facing allergen filter on the ordering page (hide items containing selected allergens)
- Downloadable allergen compliance report (PDF) for regulatory purposes

## API Used
- Open Food Facts API — provides crowd-sourced ingredient lists, allergen declarations, and nutritional data for hundreds of thousands of food products worldwide, queryable by barcode or product name

## Monetization
SaaS subscription — $49/month for up to 50 menu items; $99/month for unlimited items, embedded allergen badges, and compliance PDF export.

## Tech Stack Suggestion
Next.js + Supabase + Resend

## MVP Scope
**Included in v1:** Menu item management, Open Food Facts pre-fill by barcode or name, allergen matrix, embeddable allergen badges, customer allergen filter widget, compliance PDF report.
**Out of scope:** Real-time POS menu sync, nutritional label generation, multi-language allergen declarations, live supplier ingredient change monitoring.
