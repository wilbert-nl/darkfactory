# FitMe — Research Brief

## What It Is
A virtual try-on tool where users upload a selfie and a clothing image and receive an AI-generated photo of themselves wearing that garment — serving both direct consumers and fashion brand merchants.

## Competitors
| Name | Description |
|------|-------------|
| Google Virtual Try-On | Built into Google Shopping; free for shoppers; B2C but platform-locked |
| Wannaby / WANNA | Luxury brand B2B SDK (Valentino etc.); not consumer-facing |
| FitRoom | Launched Feb 2025; hit #1 Vietnam App Store; consumer-facing AI clothes changer; direct competitor |
| Genlook via Shopify | Shopify-integrated B2B merchant tool; requires brand integration |
| AIUTA via ASOS | Enterprise B2B; not self-serve |

## Market Size
Virtual try-on market at $15.18B in 2025, projected $48.1B by 2030 (26% CAGR). Apparel-specific segment at $2.1B (2024), projected $13.8B by 2033 (22.5% CAGR). CNBC April 2026 coverage confirms AI try-on startups are a top focus for retail investors targeting the 20–30% online return rate problem.

## MVP Features
1. Upload selfie or full-body photo; AI body segmentation and keypoint extraction
2. Upload any clothing image via file or URL
3. AI composite showing the garment on the user's body with lighting and shadow matching
4. Basic size guidance based on body proportions
5. Save and share output image
6. Wardrobe gallery to store and revisit past try-ons

## Differentiators
1. Consumer-direct simplicity: Google, Wannaby, and Genlook are B2B or platform-embedded; a fast no-signup consumer app filling the self-serve gap
2. Any garment from any URL: existing tools require brand integration; users can paste any product page image and try it on instantly
3. Social sharing loop: shareable "haul" content designed for TikTok and Instagram creates organic growth flywheel

## Profitability
**Model:** Freemium. Free: 3 try-ons/day with watermark. Pro: $9.99/mo unlimited. B2B API: $299/mo for merchants.
**Estimate:** 5K Pro subscribers = $600K ARR. 100 merchants × $299/mo = $359K ARR combined. Real ceiling is enterprise fashion brand deals and white-label API licensing.

## Build Ease: 3/5
Requires diffusion model pipelines (IDM-VTON, CatVTON, or similar open-source VTON models) — not standard LLM work. Replicate-hosted VTON models simplify deployment but add inference cost at $0.05–0.20 per generation. Claude handles product descriptions, size copy, and user-facing text but the core image generation is specialized computer vision. Harder to ship than most ideas in this batch.

## Legal Risks
- Biometric data exposure: face and body data triggers GDPR, CCPA, and Illinois BIPA (multi-million dollar settlements on record); requires explicit consent, data minimization, and deletion workflows
- Brand IP risk if retailer product images are used without permission — need clear ToS placing liability on the user
- Body image concerns: some jurisdictions have emerging regulations around AI-generated body imagery
- Deepfake and consent issues: potential for misuse placing users' likenesses on garments they did not consent to
