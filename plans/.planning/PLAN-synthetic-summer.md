# PLAN: SyntheticSummer
_Status: Draft — Resolve open questions before starting implementation_

> **For Claude in next session:** Read the open questions below and ask the user to resolve them one at a time before writing any code. Mark each resolved one with ✅.

## Overview
SyntheticSummer is a wellness platform for cold-country users who want a sensory escape from winter: ambient beach soundscapes, warm light therapy screen modes, curated tropical content, and a seasonal mood journal. The core opportunity is SAD/winter-specific positioning — no competitor in the $1.6B SAD market explicitly targets this angle. The main pre-build risk is content strategy: the product lives or dies on the quality and legitimacy of the tropical content experience, which cannot be fully AI-generated.

## Recommended Stack
- **Frontend:** Vue 3 + Quasar (web PWA primary; Capacitor for iOS/Android packaging; screen light therapy mode requires native brightness control via Capacitor plugin)
- **Backend:** NestJS + REST API
- **Database:** PostgreSQL (user accounts, mood logs, wellness plans, content metadata); Redis (session caching, content feed)
- **Auth:** Supabase Auth (email + Apple/Google social login; Apple required for iOS App Store)
- **Payments:** Stripe (web subscriptions) + RevenueCat (in-app subscriptions on iOS/Android; required for App Store compliance)
- **AI:** Claude API — mood journal analysis (detect sentiment trends, suggest tailored soundscape or content), personalized seasonal wellness plan generation, generative ambient soundscape mixing descriptions

## MVP Scope
- Ambient soundscape player (beach, tropical rain, jungle, outdoor café) with background play
- "Virtual sun" light mode: warm-toned full-screen overlay with adjustable intensity
- Curated tropical content feed (licensed photos + short clips organized by mood/theme)
- Mood log with daily entry and basic trend visualization
- Pomodoro-style "summer session" (work timer with ambient sounds + warm light)

## Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] Scaffold Vue 3 + Quasar + NestJS monorepo; Capacitor iOS/Android targets
- [ ] Set up PostgreSQL + Redis; content metadata schema (asset type, license, tags, mood category)
- [ ] Auth flow (email + Apple + Google)
- [ ] Ambient soundscape player: background audio with play/pause/volume; Capacitor audio plugin
- [ ] Content asset pipeline: define licensing strategy and ingest first 50 licensed images + 10 video clips

### Phase 2 — Core Features (Week 3–5)
- [ ] "Virtual sun" screen mode: warm color overlay with brightness/intensity slider (Capacitor screen brightness plugin)
- [ ] Curated tropical content feed: infinite scroll, mood/theme filter, fullscreen immersive view
- [ ] Mood log CRUD: daily entry (emoji + freetext), streak tracker, 30-day trend chart
- [ ] Pomodoro "summer session" timer (configurable work/break intervals with ambient audio)
- [ ] Spotify/Apple Music embed for relaxation playlists (OAuth integration)
- [ ] Subscription paywall via RevenueCat / Stripe

### Phase 3 — Launch Prep (Week 6–8)
- [ ] AI mood journal analysis (weekly mood summary, soundscape recommendation based on mood trend)
- [ ] Seasonal wellness plan generator (daily light exposure target, vitamin D reminder, mood check-in prompt)
- [ ] Community features: "virtual beach" shared ambient sessions, seasonal photo challenges
- [ ] Affiliate link integration (SAD lamp products, vitamin D supplements, travel brands)
- [ ] App Store + Google Play submission; web PWA launch
- [ ] Geo-targeted marketing: cold-country targeting (Norway, Sweden, Finland, Canada, UK, northern US states)

## Open Questions ❓
> Resolve these before implementation. Ask one at a time.

- [ ] ❓ **Content sourcing strategy:** License stock footage/photos (Storyblocks, Artgrid, Pexels Pro), partner with travel creators/influencers, or commission original tropical content? This is the most important decision before any build starts
- [ ] ❓ **Platform priority:** Web PWA first (faster to launch, no App Store gatekeeping) or mobile app first (better audio/screen brightness control, RevenueCat subscriptions)?
- [ ] ❓ **Light therapy claims:** Position strictly as "wellness ambiance" (no medical claims, low regulatory risk) or lean into SAD/light therapy language (higher relevance, higher regulatory scrutiny)?
- [ ] ❓ **Community features in MVP:** Is the "virtual beach" social layer a launch differentiator or a post-traction Phase 2 add?
- [ ] ❓ **Target geography:** Lead marketing with Northern Europe (high SAD rates, high wellness spend, GDPR-native) or North America (larger market, lower per-user wellness spend)?
- [ ] ❓ **Mood data handling:** Is mood journal data stored server-side (enables AI analysis + cross-device sync) or strictly on-device (simpler, no GDPR sensitivity for health data)?

## Top Risks
1. **Content differentiation from free YouTube** — The core ambient experience must feel meaningfully better than a free YouTube beach sounds video; mitigation: resolve content sourcing strategy before building; invest in high-quality licensed assets and a curated editorial feel before launch; do not launch with placeholder content
2. **Medical claims regulatory exposure** — "Light therapy" language may attract FDA/CE scrutiny; mitigation: legal review of all marketing copy before launch; maintain clear "wellness" positioning throughout; add disclaimer on light therapy screen mode that it is not a medical device

## Dark Factory Readiness
**Ready:** Partial
**Notes:** The ambient audio + mood journal + Pomodoro timer are buildable immediately. The content feed cannot be built until the content licensing strategy is decided and the first batch of assets is sourced. Factory needs: (1) confirmed content sourcing plan with first 50+ licensed assets ready, (2) confirmed platform priority (web vs mobile first), and (3) confirmed light therapy claims positioning before building the content feed and marketing copy.
