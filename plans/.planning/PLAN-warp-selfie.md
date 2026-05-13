# PLAN: WarpSelfie
_Status: Draft — Resolve open questions before starting implementation_

> **For Claude in next session:** Read the open questions below and ask the user to resolve them one at a time before writing any code. Mark each resolved one with ✅.

## Overview
WarpSelfie is an AI photo compositing tool that places users at any destination by blending their portrait with a background image — built for the viral "fakeation" content trend. Direct competitors like TeleportMe.ai and MagicShot.ai have repeatedly gone viral on TikTok, proving organic distribution is achievable. The differentiators are a map-based discovery UI, depth-aware lighting compositing, and group photo support that competitors lack.

## Recommended Stack
- **Frontend:** Vue 3 + Quasar (SPA with interactive map/globe UI, image upload, batch generation)
- **Backend:** NestJS (REST API, async image processing jobs, Replicate API orchestration)
- **Database:** PostgreSQL (user accounts, generation history, destination library) + Redis (job queue, rate limiting, free credit tracking)
- **Auth:** Magic link email or Google OAuth (consumer app — minimize friction)
- **Payments:** Stripe (credit packs + monthly unlimited subscription)
- **AI:** Replicate API for Stable Diffusion inpainting / DALL-E 3 / Flux compositing; remove.bg or PhotoRoom API for background removal; Claude API for destination descriptions, marketing copy, and UI suggestion text

## MVP Scope
- Upload portrait; browse or upload destination image; receive AI-composite of user at that location
- 5 free generations on signup with no credit card required
- Credit pack purchase ($4.99 for 50 credits) and unlimited monthly plan ($14.99/mo)
- Shareable output with one-tap social share (no watermark for paid, watermarked for free)
- "Surprise me" random destination picker

## Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] Scaffold NestJS project with S3 file upload and background removal (remove.bg API)
- [ ] Set up Replicate API integration for compositing pipeline (Flux or SD inpainting) with async job handling
- [ ] Implement Redis job queue for generation requests with status polling
- [ ] Build free credit tracking per user account (5 free on signup, Redis counter)
- [ ] Scaffold Vue 3 + Quasar image upload and generation result view

### Phase 2 — Core Features (Week 3–5)
- [ ] Destination image library (curated set of 50+ landmark photos via Unsplash/Pexels API, stored in S3)
- [ ] Interactive map or globe UI for destination browsing (Leaflet or Mapbox GL)
- [ ] "Surprise me" random destination selector
- [ ] Batch generation: produce 5 destination outputs from a single portrait upload
- [ ] Stripe credit pack and unlimited subscription checkout
- [ ] Watermark overlay on free tier; clean export on paid
- [ ] One-tap social share with pre-formatted aspect ratios (portrait, square, landscape)

### Phase 3 — Launch Prep (Week 6–8)
- [ ] Group photo mode: AI composites full group shot at destination (requires segmenting multiple subjects)
- [ ] Biometric consent modal and data deletion flow (GDPR/BIPA)
- [ ] Content moderation pipeline: reject abuse cases (harassment, disinformation) via automated image flagging
- [ ] ToS with explicit deepfake/impersonation prohibition and abuse reporting form
- [ ] TikTok-first launch: produce demo content with "fakeation" angle; submit to App Store and Play Store

## Open Questions ❓
> Resolve these before implementation. Ask one at a time.

- [ ] ❓ **Platform:** Web app only, or mobile app via Quasar Capacitor for App Store distribution (FitRoom hit #1 on app store — suggests mobile is where this audience lives)?
- [ ] ❓ **Image generation API:** Replicate (Flux, SD inpainting) vs DALL-E 3 via OpenAI vs Runway ML — trade-off between quality, cost, and speed per generation?
- [ ] ❓ **Content moderation policy:** What level of review is required before output is delivered — automated only, human review queue for flagged cases, or post-hoc reporting only?
- [ ] ❓ **Destination library:** Curated set of licensed images vs allow users to upload any background — user uploads unlock viral use cases but increase moderation burden significantly.
- [ ] ❓ **Monetization timing:** Hard paywall after 5 free generations, or fully free with social sharing watermark to maximize viral spread first?
- [ ] ❓ **Group photo priority:** Treat group compositing as a day-1 differentiator requiring more complex multi-subject segmentation, or ship solo portraits first and add group support post-launch?

## Top Risks
1. **Deepfake misuse and PR backlash:** The tool can fabricate false location evidence. Mitigation: strong ToS prohibiting deceptive use, watermark on all outputs by default (removable only on paid), abuse reporting pipeline, and proactive media statement ready before launch.
2. **Commoditization by incumbents:** TeleportMe.ai and MagicShot.ai are already in market and will copy any differentiating feature quickly. Mitigation: invest early in the map-based discovery UI and group photo support as moats; focus on distribution (TikTok growth loops) over feature depth in year 1.

## Dark Factory Readiness
**Ready:** Partial
**Notes:** Choose the image generation API vendor (Replicate/Flux vs DALL-E 3 vs Runway ML) and define the content moderation policy before writing any code. The vendor choice affects job queue design, cost modeling, and quality benchmarks. Content moderation policy affects architecture (async human review queue or automated-only). Once resolved, the stack is standard and fast to build.
