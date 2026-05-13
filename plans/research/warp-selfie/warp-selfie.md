# WarpSelfie — Research Brief

## What It Is
An AI photo compositing tool where users upload their portrait and a destination image to receive a realistic photo of themselves at that location — built for social sharing and the "fakeation" content trend.

## Competitors
| Name | Description |
|------|-------------|
| TeleportMe.ai | Dedicated AI travel photo generator; click map location, get realistic photo with weather and outfit matching — direct competitor |
| MagicShot.ai | Upload portrait; AI places at any tourist landmark with lighting and perspective matching |
| Clipdrop / Stability AI | "Teleport" feature aimed at professional photographers |
| Photo AI | Custom AI model trained on your photos; generates in any scenario; more expensive and slower |
| Artisse AI | AI travel memory maker; consumer-facing |

## Market Size
The "fakeation" trend (fake vacation photos) has been covered by NYT and BBC, validating strong consumer appetite. Broader AI image editing market exceeds $900M in 2025 and is growing rapidly. TeleportMe.ai and comparable apps have gone viral on TikTok repeatedly with millions of views per cycle, confirming organic distribution potential.

## MVP Features
1. Upload portrait with automatic background removal
2. Browse or upload destination images (famous landmarks, beaches, cities)
3. AI compositing with lighting normalization and perspective matching
4. Multiple output aspect ratios (portrait for Instagram, landscape for desktop wallpaper)
5. One-tap share to social media
6. "Surprise me" random destination picker
7. Batch generation — produce 5 destination photos from a single selfie

## Differentiators
1. Map-based discovery UI: browse destinations on an interactive globe rather than typing search terms — more tactile and shareable
2. Realistic lighting engine: depth-aware compositing for photorealism vs the flat lighting common in most competitors
3. Group photos: upload a group shot and place the whole group at a destination — competitors mostly handle solo portraits only

## Profitability
**Model:** Credit-based freemium. 5 free generations on signup. $4.99 for 50 credits. $14.99/mo unlimited. Viral mechanics and gift card bundles for gifting.
**Estimate:** $100K–500K ARR from loyal base within 12 months if growth hacking via TikTok/Instagram is effective. High volume potential via App Store and Play Store distribution.

## Build Ease: 4/5
Background removal APIs (remove.bg, PhotoRoom) are mature and cheap. Compositing via Stable Diffusion inpainting, DALL-E 3, or Flux on Replicate. Claude handles destination copy, UI text, and suggestion prompts. Lighting consistency is a known hard problem but tractable with current hosted models. Faster to ship than FitMe given no biometric segmentation complexity.

## Legal Risks
- Deepfake and misuse potential: tool can fabricate false alibis, enable harassment, or generate disinformation — requires strong ToS and active abuse reporting pipeline
- Biometric GDPR and BIPA exposure: face data requires explicit consent, data minimization, and deletion rights
- Copyright on destination image library: must use licensed or open-source photos via Unsplash/Pexels API — cannot scrape or use unlicensed imagery
- Media backlash risk around AI-generated "fake vacation" social media dishonesty — brand reputation management needed
