# PLAN: AnimeWedding
_Status: Draft — Resolve open questions before starting implementation_

> **For Claude in next session:** Read the open questions below and ask the user to resolve them one at a time before writing any code. Mark each resolved one with ✅.

## Overview
AnimeWedding converts wedding videos into anime-style animated clips using AI video style transfer. Couples and wedding videographers upload footage and receive shareable reels. The opportunity is strong organic demand in East/Southeast Asian markets for anime-aesthetic wedding content, a clear pay-per-use pricing model, and a wedding-specific niche that reduces direct competition with general video tools like DomoAI. Core risk: inference costs are high and style names must avoid trademarked IP.

## Recommended Stack
- **Frontend:** Vue 3 + Quasar (web app; mobile-responsive for couple uploads; no native app needed at launch)
- **Backend:** NestJS + PostgreSQL + Redis (BullMQ for async video processing job queue; Redis for job status polling)
- **Database:** PostgreSQL (users, orders, videos, job status); S3-compatible object storage (video upload + output delivery)
- **Auth:** Supabase Auth (optional for couples on pay-per-use; required for photographer subscription accounts)
- **Payments:** Stripe (pay-per-video checkout + monthly/annual subscription for photographers)
- **AI:** Runway ML API, Kling AI API, or Luma AI API for video style transfer (vendor TBD); Claude for scene detection prompts and metadata extraction

## MVP Scope
- Video upload (up to 5 minutes) with S3 pre-signed URL upload
- Style selection from 4–6 presets with thumbnail previews (no trademarked style names)
- Async processing with real-time job status polling and email notification on completion
- Watermarked preview before purchase; full-resolution MP4 download on payment
- Auto-generated 60-second highlight reel in vertical (9:16) and horizontal (16:9) formats

## Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] Confirm video processing API vendor — test Runway ML, Kling AI, and Luma AI on 3 sample wedding clips; compare quality, cost per minute, and rate limits
- [ ] Define 4–6 style names that do not reference trademarked studio names (e.g., "Watercolor Anime", "Line Art Drama", "Pastel Romance" — not "Ghibli Style")
- [ ] NestJS scaffold with PostgreSQL, Redis, and BullMQ video processing queue
- [ ] S3-compatible storage setup (Cloudflare R2 preferred for cost) with pre-signed upload URLs
- [ ] Basic Vue 3 + Quasar upload UI with style selector and job status polling
- [ ] Stripe pay-per-video checkout (price per video, no account required)

### Phase 2 — Core Features (Week 3–5)
- [ ] Video processing job worker — sends clip to vendor API, polls for completion, stores output to R2
- [ ] Watermarked preview generation (ffmpeg overlay on output)
- [ ] Full-resolution download gated behind Stripe payment confirmation
- [ ] Auto-highlight reel — Claude prompt to select key timestamps (first dance, kiss, vows); ffmpeg clips and stitches 60-second reel
- [ ] Styled text overlay — couple names and wedding date in anime calligraphy font
- [ ] Email notification on processing complete (Resend or AWS SES)

### Phase 3 — Launch Prep (Week 6–8)
- [ ] Photographer / videographer subscription plan ($79–149/mo unlimited conversions)
- [ ] Bulk upload flow for photographers (process full wedding album in one session)
- [ ] Biometric consent checkbox at upload (GDPR Article 9 / BIPA compliance)
- [ ] Automated source video deletion after 48 hours post-delivery
- [ ] Content moderation hook — reject non-wedding content (nudity, violence) before processing
- [ ] Partnership outreach to 3 Philippine wedding videographer groups for beta access
- [ ] TikTok and Instagram organic seeding with 5 sample anime wedding reels

## Open Questions ❓
> Resolve these before implementation. Ask one at a time.

- [ ] ❓ **Video processing vendor:** Which API — Runway ML, Kling AI, or Luma AI — will be the primary vendor? Must test all three on real wedding footage before committing to an architecture.
- [ ] ❓ **Style naming:** Confirmed list of 4–6 style names that avoid trademarked IP? (Ghibli, Naruto, etc. cannot appear in product copy or prompts.)
- [ ] ❓ **Inference cost model:** At $0.50–2.00/minute of video, a 5-minute wedding clip costs $2.50–10.00 to process. What is the target margin at $20–30/video? Acceptable?
- [ ] ❓ **Target geography:** Philippines-first (founder proximity, Southeast Asia anime affinity) or global from launch?
- [ ] ❓ **Account requirement:** Fully guest checkout (no account needed for one-time couples) or require account creation to enable re-download and order history?

## Top Risks
1. **Inference cost compresses margins** — At $1/minute average, a 5-minute clip costs $5 to process; sold at $20, that is 25% COGS before infrastructure. Mitigation: Limit free video length at launch (3 minutes max); optimize by sending only selected key scenes rather than full video; lock in volume pricing with vendor once throughput justifies negotiation.
2. **Art style IP exposure** — Using studio names in prompts or marketing copy risks IP claims from Ghibli and other rights holders. Mitigation: Use descriptive style names only (never studio or character names) in all UI copy, API prompts, and marketing materials; legal review of style descriptions before launch.

## Dark Factory Readiness
**Ready:** Partial
**Notes:** Build cannot start until: (1) video processing vendor is selected and tested on real wedding footage, and (2) style names are confirmed to avoid trademarked IP. Both are founder decisions. Once resolved, the factory can build the full processing pipeline and storefront.
