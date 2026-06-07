# Beer Pairing Tool for Craft Breweries

## Tagline
Help your taproom guests find their perfect pour by matching every beer in your lineup to the right food.

## Target Market
Independent craft breweries and taprooms that serve food or partner with food trucks and want to elevate the guest experience.

## Problem
Taproom staff frequently lack the training to confidently recommend food and beer pairings, leading to missed upsell opportunities and less satisfying guest experiences. Breweries with rotating taps struggle to keep food pairing guides current. Guests often default to a familiar beer rather than exploring the full lineup because they lack guidance.

## Solution
A beer pairing management tool that lets breweries catalog their current tap list and generate food pairing suggestions for each beer using BreweryDB style and flavor data. Staff can access the pairing guide on a tablet and guests can view it via a QR code at the table.

## Core Features (MVP)
- Tap list management — add beers with style, ABV, IBU, and tasting notes
- Auto-generated food pairing suggestions per beer based on style profile
- Staff-facing pairing guide with search by beer or food category
- Guest-facing mobile pairing guide accessible via QR code
- Exportable tap list with pairings for printed menus

## API Used
- BreweryDB API — provides beer style information, flavor profiles, and brewery data that inform food pairing logic by beer category and characteristics

## Monetization
SaaS subscription — $29/month per taproom location, including QR code guest view and unlimited beers on tap list.

## Tech Stack Suggestion
Next.js + Supabase + Resend

## MVP Scope
**Included in v1:** Tap list management, style-based pairing suggestions, staff guide, guest mobile view via QR code, printable menu export.
**Out of scope:** POS integration, online ordering, beer inventory management, customer loyalty program, brewery tour scheduling.
