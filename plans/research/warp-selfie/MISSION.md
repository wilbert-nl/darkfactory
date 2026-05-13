# MISSION.md — warp-selfie

## What This Builds

A web application that composites user portrait photos into destination scenes using AI — creating realistic-looking travel photos without leaving home. Users upload a portrait (background is auto-removed), select or upload a destination, and the AI composites them with matched lighting and perspective. Free tier photos are watermarked.

## Primary Users

- Social media users who want fun travel-style content without travel costs
- Influencers and content creators producing destination-themed posts
- Marketing teams needing quick lifestyle composites for campaigns
- Anyone who wants to preview themselves at a destination before booking

## In Scope

- Portrait upload with automatic background removal (via AI API)
- Destination library (curated scenes) plus user-uploaded backgrounds
- AI compositing with lighting and perspective matching via Replicate or Stability AI
- Multiple aspect ratios (square, portrait, landscape, story)
- Batch generation (multiple destination variants in one job)
- Surprise random destination picker
- Server-applied watermark on free tier outputs
- Job queue with client polling for status
- Image storage in Cloudflare R2 with presigned URLs
- Free tier: 3 composites per day, watermarked
- Pro ($6.99/mo): unlimited composites, HD output, no watermark

## Out of Scope

- Video compositing or animated backgrounds
- Real-time AR preview (camera feed overlay)
- Native mobile app (web-only in MVP)
- Social sharing or community gallery
- Face swap or face replacement
- Commercial licensing workflow

## Immutable Constraints

1. **Watermark on free tier outputs is applied server-side** — hardcoded; agents must never move watermarking to the client or create any bypass.
2. **Free tier hard cap (3 composites/day) is enforced server-side** — agents must never implement client-side-only rate limiting.
3. **Free user images deleted after 24 hours; Pro user images deleted after 30 days** — these retention periods are hardcoded.
4. **User photos must never be used for AI model training** — agents must never add any code or API parameter that opts images into training datasets.
5. **AI provider credentials (Replicate, Stability AI) must never appear in the frontend** — all AI API calls go through the NestJS backend.
6. **Pro pricing ($6.99/mo) and free tier limit (3/day) are hardcoded** — agents must never alter these values.
