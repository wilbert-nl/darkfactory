# PLAN: CommentsReader
_Status: Draft — Resolve open questions before starting implementation_

> **For Claude in next session:** Read the open questions below and ask the user to resolve them one at a time before writing any code. Mark each resolved one with ✅.

## Overview
CommentsReader is a browser extension that reads YouTube comments aloud via TTS, enabling hands-free comment browsing. No equivalent product exists. The opportunity is a well-scoped, low-infrastructure build (2–4 weeks to MVP) targeting YouTube creators and power-viewers. The main risk is YouTube ToS ambiguity around the YouTube Data API in a monetized context, which must be reviewed before a Stripe paywall is added.

## Recommended Stack
- **Frontend:** TypeScript + Chrome Extension Manifest V3 (content script injected into YouTube pages; popup for settings and playback controls)
- **Backend:** None required for MVP — all processing is client-side (YouTube Data API v3 from extension + Web Speech API for TTS)
- **Database:** Chrome Storage API (local user preferences, quota tracking, session state); no server-side storage in v1
- **Auth:** Chrome Identity API for optional Google OAuth (required for Creator mode to access own channel comments)
- **Payments:** Stripe Checkout via a lightweight NestJS backend (only for Pro subscription management; not needed until after free launch)
- **AI:** Claude API for Creator mode sentiment classification (positive / negative / question grouping); optional, online-only

## MVP Scope
- Content script detects YouTube video pages and injects "Play Comments" button
- Fetches comments via YouTube Data API v3 (Top Comments sort and Newest sort)
- Plays comments sequentially using Web Speech API (browser-native TTS, no API cost)
- Playback controls in extension popup: play/pause, skip, speed (0.75x–2x), filter settings
- Filter options: minimum like count threshold, hide short comments under 10 words

## Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] Chrome Extension Manifest V3 scaffold in TypeScript with Vite build pipeline
- [ ] Content script: detect YouTube video page URL, inject "Play Comments" button in comment section DOM
- [ ] YouTube Data API v3 integration — fetch top 100 comments for active video (OAuth not needed; API key only)
- [ ] Web Speech API TTS integration — read comment text sequentially with pause/skip controls
- [ ] Extension popup UI — play/pause, speed control, voice selector (browser voices)
- [ ] Chrome Storage API for user preferences (speed, voice, filter settings)

### Phase 2 — Core Features (Week 3–4)
- [ ] Sort order selector — Top Comments, Newest First, Creator Replies Only
- [ ] Filter controls — minimum likes slider, hide short comments toggle, hide replies toggle
- [ ] Pinned comment priority — always play pinned comment first
- [ ] Reply thread reading — when reading a top-level comment, optionally read top replies as a conversation
- [ ] Comment queue progress indicator (e.g., "Comment 12 of 50")
- [ ] Firefox extension port (Manifest V3 compatible)

### Phase 3 — Launch Prep (Week 5–6)
- [ ] ElevenLabs TTS integration as premium voice option (replaces Web Speech API on Pro tier)
- [ ] Creator mode — Google OAuth to access own channel comments; Claude sentiment grouping (positive, questions, concerns)
- [ ] Freemium quota enforcement — 20 comments/session cap for free users (tracked via Chrome Storage)
- [ ] Lightweight NestJS backend for Stripe subscription management and license key validation
- [ ] Chrome Web Store submission with privacy policy and permissions justification
- [ ] YouTube Data API ToS review — confirm commercial use in monetized extension is permitted before adding Stripe paywall
- [ ] Firefox Add-ons submission in parallel with Chrome Web Store

## Open Questions ❓
> Resolve these before implementation. Ask one at a time.

- [ ] ❓ **TTS provider:** Web Speech API only at launch (free, lower quality, no cost) or ElevenLabs from day one (higher quality, $0.15–0.30/1K chars cost, requires backend)?
- [ ] ❓ **YouTube API review:** Have you reviewed YouTube Data API ToS Section 3 (commercial use restrictions) to confirm the extension + Stripe paywall is permitted?
- [ ] ❓ **Monetization timing:** Launch free first to build install base and reviews (Chrome Web Store ranking), then add Stripe — or paid from day one?
- [ ] ❓ **Creator mode priority:** Is Creator mode (own channel comment analytics) a launch feature or v2? It requires Google OAuth and more engineering than the core TTS reader.
- [ ] ❓ **AppSumo launch:** Would you do a one-time lifetime deal launch ($19.99) to generate early cash flow and Chrome Web Store social proof?

## Top Risks
1. **YouTube ToS challenge on monetized commercial use** — YouTube Data API Terms restrict building "competing services"; a monetized TTS extension could be challenged. Mitigation: Review ToS before adding a paywall; launch as free first to establish install base and user evidence; consult a tech lawyer before Stripe integration if ToS is ambiguous.
2. **Chrome Web Store rejection or removal** — Extensions that interact with YouTube have been removed by Google in the past. Mitigation: Submit with clear, minimal permissions requested; explain each permission in the store listing; avoid requesting permissions beyond what the MVP needs (do not request host permissions for non-YouTube domains).

## Dark Factory Readiness
**Ready:** Yes
**Notes:** This is the most factory-ready idea of the six. The stack is entirely client-side TypeScript for the MVP, well-scoped, and has no infrastructure dependencies. The factory can build Phases 1 and 2 immediately. YouTube ToS review and Stripe backend (Phase 3) are the only gated items, and they come after the free extension is already live.
