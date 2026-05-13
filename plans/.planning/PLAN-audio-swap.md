# PLAN: AudioSwap
_Status: Draft — Resolve open questions before starting implementation_

> **For Claude in next session:** Read the open questions below and ask the user to resolve them one at a time before writing any code. Mark each resolved one with ✅.

## Overview
AudioSwap is a focused web tool for replacing, swapping, and dubbing audio in video files — letting creators mute original audio, drop in replacement music or voiceovers, and re-export without a full video editor. The opportunity is that competitors like Kapwing and VEED.io are full editors where audio replacement is buried; a URL-paste-to-swap-to-export workflow is dramatically faster for the creator use case. The 40K–60K/month "replace audio in video" search volume signals strong organic acquisition potential.

## Recommended Stack
- **Frontend:** Vue 3 + Quasar (SPA with video preview player, waveform visualization, drag-and-drop upload)
- **Backend:** NestJS (REST API + Bull/BullMQ job queue for FFmpeg processing workers)
- **Database:** PostgreSQL (user accounts, export history, usage metering) + Redis (job queues, rate limiting, export count tracking)
- **Auth:** Magic link email or Google OAuth
- **Payments:** Stripe (usage-based Free/Creator/Pro subscriptions)
- **AI:** Whisper API for transcription and audio sync; ElevenLabs API for voice cloning and AI dubbing; FFmpeg for all video/audio manipulation (not AI, but the core engine)

## MVP Scope
- Upload video file; mute or detach original audio; upload or record replacement audio; preview and export
- Auto-sync audio length to video (trim or loop replacement audio to match video duration)
- Royalty-free background music library (curated tracks, licensed for creator content)
- Free tier: 5 exports/month with watermark; Creator tier: $12/mo unlimited up to 30 minutes

## Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] Scaffold NestJS project with S3 upload handling for video and audio files
- [ ] Set up FFmpeg worker (Lambda or dedicated EC2) with BullMQ job queue for async processing
- [ ] Implement core audio swap: mute original track, merge replacement audio, export MP4
- [ ] Auto-sync logic: trim or loop replacement audio to match video duration using FFmpeg
- [ ] Build Redis-backed export count tracker for free tier enforcement
- [ ] Scaffold Vue 3 + Quasar video player with waveform preview (WaveSurfer.js)

### Phase 2 — Core Features (Week 3–5)
- [ ] In-browser microphone recording for live voiceover capture
- [ ] Audio level adjustment and fade in/out controls (FFmpeg filter params)
- [ ] Royalty-free music library (20–50 curated tracks from Pixabay/ccMixter stored in S3)
- [ ] Watermark overlay for free tier exports
- [ ] Stripe Free/Creator/Pro subscription checkout with usage metering
- [ ] Export progress indicator and download link delivery

### Phase 3 — Launch Prep (Week 6–8)
- [ ] Whisper API integration: transcribe original audio and display as editable captions
- [ ] ElevenLabs voice cloning: Pro tier AI dubbing with voice identity matching
- [ ] Stem separation: LALAL.AI or Demucs API to isolate voice from background music before voiceover replacement
- [ ] DMCA music rights check before export (flag if replacement audio matches known copyrighted tracks)
- [ ] DMCA Section 512 safe harbor registration and designated agent filing
- [ ] SEO landing page targeting "replace audio in video online" and related queries

## Open Questions ❓
> Resolve these before implementation. Ask one at a time.

- [ ] ❓ **Video URL import:** Support YouTube/social URL pasting (users paste their own unlisted video URL) or file-upload only to avoid YouTube ToS server-side download risk?
- [ ] ❓ **Target market:** Solo content creators (YouTube/TikTok), or multilingual dubbing for SEA/LatAm creators as a primary positioning angle?
- [ ] ❓ **AI dubbing priority:** Is ElevenLabs voice cloning a day-1 differentiator (Pro tier) or a Phase 2 feature added after validating basic audio swap demand?
- [ ] ❓ **Stem separation:** Include LALAL.AI voice/music separation in MVP or add post-launch once paying users request it?
- [ ] ❓ **Max file size and duration:** What are the free and paid limits — e.g., free up to 5 minutes/500MB, Creator up to 30 minutes/2GB? Affects FFmpeg worker sizing and S3 cost.
- [ ] ❓ **Music library size:** Curate 20–50 tracks manually for launch, or integrate a licensed library API (Epidemic Sound, Artlist API) from day 1?

## Top Risks
1. **DMCA liability:** Users may replace copyrighted music with other copyrighted music and re-upload to YouTube. Mitigation: ToS prohibiting this, audio fingerprinting check before export (AudD API or similar), and DMCA Section 512 safe harbor registration before launch.
2. **FFmpeg worker cost at scale:** Long video files are CPU-intensive and slow. Mitigation: enforce file size and duration limits per tier, use spot instances for the processing queue, and monitor per-export cost against MRR early.

## Dark Factory Readiness
**Ready:** Yes
**Notes:** FFmpeg is well-understood, ElevenLabs and Whisper APIs are mature, and the stack is standard NestJS + Vue 3 + PostgreSQL + Redis. No legal blockers before starting — DMCA compliance is a launch prerequisite but does not block early development. Most technically tractable idea in the batch.
