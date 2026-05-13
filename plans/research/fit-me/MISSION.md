# MISSION.md — fit-me

## What This Builds

A web app where users upload a selfie and a clothing image (file or URL), and an external AI pipeline (Replicate or Hugging Face) performs body segmentation and compositing to show the user wearing that garment. Results include size guidance derived from body proportions and a personal wardrobe gallery.

## Primary Users

- Online shoppers who want to visualize how clothing will look on their own body before purchasing
- Fashion-curious users building virtual wardrobes for outfit planning

## In Scope

- Selfie upload + clothing image upload (file or URL)
- NestJS job queue for AI processing; client polls for result
- AI body segmentation and garment compositing via external API (Replicate or Hugging Face)
- Lighting and shadow adjustment in composite output
- Size guidance (S/M/L/XL suggestion) derived from detected body proportions
- Wardrobe gallery: save and browse past try-ons (Pro)
- Watermark applied to all free-tier output images (hardcoded, cannot be disabled)
- Free tier: 3 try-ons/day (server-enforced), watermarked output
- Pro tier ($9.99/mo via Stripe): unlimited try-ons, HD output, wardrobe storage
- Age gate on signup to block minors

## Out of Scope

- In-house body segmentation or AI model training
- Social sharing or public outfit galleries
- Direct e-commerce purchasing or retailer integrations
- Video try-on
- Mobile apps (web only)
- Using user body images for model training (prohibited absolutely)

## Immutable Constraints

1. Body images (selfies) are sensitive — they must be deleted from storage within 24 hours for free users and within 30 days for Pro users; a cleanup job must enforce this.
2. User body images must never be used for AI model training, fine-tuning, or dataset creation under any circumstances.
3. Watermark is hardcoded on all free-tier output — agents must never add a flag or config that bypasses it.
4. Free tier hard cap of 3 try-ons per day is enforced server-side — client claims are never trusted.
5. External AI API credentials (Replicate, Hugging Face) must never appear in frontend code, environment files, or client-side responses.
6. An age gate must be present at signup — agents must never remove or bypass it.
7. Pro pricing ($9.99/mo) is hardcoded — agents must never change it.
