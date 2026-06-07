# QR Code Generator for Menus & Products

## Tagline
Generate, brand, and manage QR codes for your menus, products, and promotions — no design skills required.

## Target Market
Restaurants, cafes, and small retail shops that need QR codes for physical menus, product tags, or promotional materials.

## Problem
Hospitality and retail businesses need QR codes constantly — for menus, table tents, packaging, and promotions — but free generators produce generic, unbranded codes with no management or analytics. Replacing a destination URL means printing all new codes, which is costly and wasteful. Businesses have no central place to manage all their QR assets.

## Solution
A web app that lets businesses generate branded, customizable QR codes linked to managed short URLs. When the destination changes (e.g., a new seasonal menu PDF), users update the link in the dashboard and the existing printed QR code continues to work, eliminating reprinting.

## Core Features (MVP)
- QR code generation for URLs, PDF uploads, and plain text
- Color and logo customization (brand color, center logo overlay)
- Dynamic QR codes — edit destination URL without reprinting
- PNG/SVG download in print-ready resolution
- Dashboard to manage all codes with last-scan timestamp

## API Used
- QR Code API (qrcode-monkey or goqr.me) — generates QR code images with customization parameters including color, size, and logo embedding

## Monetization
Freemium — 3 static QR codes free forever; Pro at $15/month for unlimited dynamic codes, logo customization, and analytics.

## Tech Stack Suggestion
Next.js + Supabase + Cloudflare R2

## MVP Scope
In scope: QR generation, dynamic redirect management, branding options, PNG/SVG export, simple dashboard. Out of scope: scan analytics/heatmaps, team collaboration, bulk generation from spreadsheet in v1.
