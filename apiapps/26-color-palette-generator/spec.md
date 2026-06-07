# Color Palette Generator for Designers

## Tagline
Generate beautiful, AI-powered color palettes from a seed color or mood — export to Figma, CSS, or Tailwind in one click.

## Target Market
Freelance graphic designers and small design agencies that build brand identities and web UIs for SMB clients.

## Problem
Designers spend significant time manually crafting harmonious color palettes from scratch for each new client project. Generic palette tools produce random combinations without intelligence about color harmony or brand feel. Exporting colors to design tools and CSS requires tedious manual copy-paste of hex codes.

## Solution
A web app where designers input a seed color or select a mood (bold, calm, earthy, etc.) and receive an AI-generated harmonious palette. Palettes are immediately exportable as CSS variables, Tailwind config, Figma-compatible JSON, or a PNG swatch sheet.

## Core Features (MVP)
- Seed color input (hex picker or mood keyword)
- AI palette generation with harmony model (complementary, triadic, analogous)
- Palette preview on sample UI components (button, card, navbar)
- Export in CSS variables, Tailwind config, Figma JSON, PNG swatches
- Save and name palettes to a personal library

## API Used
- Colormind API — provides AI-generated color palettes trained on design trends, accepts seed colors and returns harmonious full palettes

## Monetization
Freemium — unlimited palette generation free; Pro at $8/month for saved library, export formats, and UI preview components.

## Tech Stack Suggestion
Next.js + Supabase + Tailwind CSS

## MVP Scope
In scope: palette generation, mood/seed input, UI preview, CSS/Tailwind/Figma/PNG export, palette library. Out of scope: team sharing, client-facing palette approval workflow, brand guideline PDF generation in v1.
