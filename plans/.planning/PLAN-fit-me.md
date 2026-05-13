# PLAN: FitMe
_Status: Draft — Resolve open questions before starting implementation_

> **For Claude in next session:** Read the open questions below and ask the user to resolve them one at a time before writing any code. Mark each resolved one with ✅.

## Overview
FitMe is a virtual clothing try-on tool where users upload a selfie and any garment image to receive a realistic AI-generated photo of themselves wearing it. The opportunity is that existing tools (Google, Wannaby, Genlook) are either B2B-only or platform-locked — a self-serve consumer app accepting any garment from any URL is an underserved position. The apparel try-on market is $2.1B growing at 22.5% CAGR, driven by the 20–30% online return rate problem retailers are desperate to solve.

## Recommended Stack
- **Frontend:** Vue 3 + Quasar (SPA with image upload, preview, and wardrobe gallery)
- **Backend:** NestJS (REST API, job queue management, Replicate API orchestration)
- **Database:** PostgreSQL (user accounts, wardrobe history, try-on metadata) + Redis (job status tracking, rate limiting)
- **Auth:** Magic link email or Google OAuth (keep friction minimal for consumer app)
- **Payments:** Stripe (freemium subscription + B2B API billing)
- **AI:** Replicate-hosted VTON models (IDM-VTON or CatVTON) for garment compositing; Claude API for product description extraction, size guidance copy, and user-facing summaries; remove.bg or PhotoRoom API for body segmentation

## MVP Scope
- Upload selfie + clothing image (file or URL); receive AI-generated try-on composite
- Basic size guidance text based on visible body proportions
- Wardrobe gallery to save and revisit past try-ons
- Watermarked free tier (3/day); Pro tier with unlimited generations
- Share output image with one tap

## Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] Scaffold NestJS project with file upload handling (S3 for storage)
- [ ] Integrate remove.bg or PhotoRoom API for background removal and body segmentation
- [ ] Set up Replicate API integration for VTON model (IDM-VTON or CatVTON) with async job handling
- [ ] Implement Redis job queue for try-on requests with status polling endpoint
- [ ] Scaffold Vue 3 + Quasar upload flow with image preview and job status indicator

### Phase 2 — Core Features (Week 3–5)
- [ ] Clothing image URL scraper (extract product image from any product page URL)
- [ ] Watermark overlay on free tier outputs
- [ ] Wardrobe gallery with saved try-ons (PostgreSQL + S3 signed URLs)
- [ ] Stripe Free/Pro subscription with usage metering for free tier daily limit
- [ ] Basic size guidance: Claude prompt analyzing visible body proportions from keypoints
- [ ] Share button generating a shareable link and pre-formatted social image

### Phase 3 — Launch Prep (Week 6–8)
- [ ] B2B API tier with API key issuance and usage dashboard for merchants
- [ ] Biometric consent modal and explicit data deletion flow (GDPR/BIPA compliance)
- [ ] Content moderation policy enforcement (flag and reject inappropriate garment images)
- [ ] Inference cost monitoring dashboard (Replicate cost per generation tracked per user tier)
- [ ] Landing page with before/after demo and App Store / Play Store waitlist

## Open Questions ❓
> Resolve these before implementation. Ask one at a time.

- [ ] ❓ **Platform:** Web app first, or mobile-first (iOS/Android via Quasar Capacitor) given that FitRoom hit #1 on the App Store?
- [ ] ❓ **VTON model vendor:** Replicate-hosted IDM-VTON or CatVTON, or a managed API like Fashn.ai or Krea.ai? Affects quality, cost per generation, and vendor lock-in.
- [ ] ❓ **Biometric data handling:** Store body keypoints and segmentation masks server-side for wardrobe reuse, or re-process from the original photo each time to minimize biometric data retention?
- [ ] ❓ **Target market:** Consumer app (individual shoppers), or B2B API for Shopify merchants as the primary revenue driver?
- [ ] ❓ **Monetization timing:** Freemium from day 1 with credit card, or open free access for first 3 months to build social proof and App Store reviews?
- [ ] ❓ **Garment URL scraping:** Legally and technically complex; start with file-upload only and add URL scraping post-MVP, or treat URL paste as a day-1 differentiator?

## Top Risks
1. **Inference cost vs revenue:** At $0.05–0.20 per generation, free tier users can quickly consume margin. Mitigation: hard daily cap on free tier, monitor per-user cost in real time, and model the unit economics before launching any viral campaign.
2. **Biometric liability (BIPA):** Illinois BIPA allows $1K–5K per violation with class action exposure. Mitigation: explicit consent before first try-on, clear data retention policy, one-click deletion, and US-specific consent flow before launch.

## Dark Factory Readiness
**Ready:** Partial
**Notes:** Choose the VTON model API vendor (Replicate, Fashn.ai, or alternative) and define the biometric data consent and retention policy before writing any code. These decisions affect core architecture (job queue design, storage model) and legal exposure. Once resolved, the stack is standard and buildable.
