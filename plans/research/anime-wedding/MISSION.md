# MISSION.md — anime-wedding

## What This Builds

A web application that converts wedding videos into anime-style animated clips using AI video style transfer via external GPU inference APIs (Replicate or RunPod). Users upload a short wedding video, choose an art style preset, and receive a stylized animated clip — optionally with styled text overlays on auto-detected key moments.

## Primary Users

Newlyweds and wedding content creators who want a unique, shareable anime-style keepsake from their wedding footage. Primarily accessed via desktop browser; mobile-responsive but not native.

## In Scope

- Video upload (MP4/MOV, max 500MB, max 2-minute source clip)
- 4–6 anime art style presets (e.g., Ghibli-ish, Shinkai-ish, retro cel-shaded, watercolor)
- AI video style transfer job queue dispatched to Replicate or RunPod API
- Real-time job progress reporting via SSE or WebSocket polling
- Key moment auto-detection (scene change detection, server-side)
- Styled text overlay on detected key moments
- Watermarked preview clip before download (free tier)
- Full 2-minute, 4K, watermark-free download (Pro tier)
- Stripe-based freemium billing ($9.99/mo Pro)
- User accounts with processing history

## Out of Scope

- Building or training AI video models in-house
- Native mobile apps (Capacitor shell is web-only PWA wrapper)
- Bulk or batch video processing for multiple clips simultaneously
- Video editing beyond style transfer and text overlay
- Social sharing or direct platform publishing integrations
- Affiliate or referral programs
- Adult, explicit, or graphic content of any kind

## Immutable Constraints

1. **Watermark is permanent on free tier.** Logic lives in `api/src/watermark/` and must never be modified, bypassed, or conditionally disabled by agents.
2. **Pro pricing is hardcoded at $9.99/month.** Agents must never alter pricing constants or Stripe product/price IDs.
3. **Raw wedding videos must be deleted within 24 hours of upload**, regardless of processing status. No exceptions for any tier.
4. **Max source clip is 2 minutes and 500MB.** Agents must not relax validation limits in any guard, pipe, or config.
5. **No adult or explicit content.** Any PR that disables or weakens content checks is an automatic reject.
6. **AI provider calls are exclusively in `api/src/ai-provider/`.** Agents must not call Replicate or RunPod from any other module.
7. **Queue logic is exclusively in `api/src/queue/`.** Agents must not duplicate or bypass queue dispatch elsewhere.
