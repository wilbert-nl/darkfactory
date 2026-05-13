# PLAN: CommentStats
_Status: Draft — Resolve open questions before starting implementation_

> **For Claude in next session:** Read the open questions below and ask the user to resolve them one at a time before writing any code. Mark each resolved one with ✅.

## Overview
CommentStats is a YouTube comment analytics dashboard that turns raw comment sections into structured audience intelligence — sentiment trends, keyword extraction, question detection, and cross-video benchmarking. The opportunity is that VidIQ and TubeBuddy are SEO-first platforms where comment data is an afterthought; a comment-first tool targeting the 2M+ serious creators is a defensible niche with clear willingness to pay.

## Recommended Stack
- **Frontend:** Vue 3 + Quasar (SPA with data-heavy dashboard components)
- **Backend:** NestJS (REST API + background job processing for YouTube API calls)
- **Database:** PostgreSQL (channel/video/comment analytics storage) + Redis (job queues, API quota tracking, caching)
- **Auth:** Google OAuth (required for YouTube Data API channel access)
- **Payments:** Stripe (subscriptions + usage metering)
- **AI:** Claude API for sentiment scoring, keyword clustering, question detection, and natural-language insight summaries ("Your last 3 videos triggered unusual negative sentiment around topic X")

## MVP Scope
- Connect a YouTube channel via Google OAuth and pull comment data for all videos
- Per-video sentiment scoring with trend charts (positive/neutral/negative over time)
- Top keyword and phrase extraction with word cloud and ranked table
- Audience question detection with a prioritized list of questions to answer in future videos
- Spam/toxic comment flagging with bulk moderation queue

## Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] Scaffold NestJS project with Google OAuth and YouTube Data API v3 integration
- [ ] Implement comment ingestion job (paginated fetch, store in PostgreSQL)
- [ ] Build Redis-backed quota tracker to stay within YouTube API limits
- [ ] Set up Stripe subscription with Free/Pro/Agency tiers
- [ ] Design and scaffold Vue 3 + Quasar dashboard shell with routing

### Phase 2 — Core Features (Week 3–5)
- [ ] Implement Claude-powered sentiment scoring pipeline (batch comment analysis)
- [ ] Build keyword extraction and phrase clustering with word cloud widget
- [ ] Implement audience question detection (Claude prompt classifying comment intent)
- [ ] Build spam/toxic flagging with bulk moderation action queue
- [ ] Per-video sentiment trend chart (Recharts or Chart.js via Quasar)
- [ ] Engagement trend graph (comment velocity, reply ratio over time)

### Phase 3 — Launch Prep (Week 6–8)
- [ ] Side-by-side video comparison view for comment health
- [ ] Agency tier: client dashboards and white-label PDF report export
- [ ] YouTube API quota exhaustion handling and user-facing feedback
- [ ] Onboarding flow and empty state for new users with no data yet
- [ ] SEO landing page + Product Hunt launch assets

## Open Questions ❓
> Resolve these before implementation. Ask one at a time.

- [ ] ❓ **Platform:** Web app only, or also a Chrome extension (like TubeBuddy) for in-YouTube-Studio use?
- [ ] ❓ **Target market:** Solo YouTubers, or agency/MCN clients managing multiple channels from day 1?
- [ ] ❓ **Monetization timing:** Free tier with credit card required at signup, or fully open free tier to grow then convert?
- [ ] ❓ **Data retention:** Store raw comment text long-term in your DB, or only store aggregated analytics (affects YouTube ToS and GDPR exposure)?
- [ ] ❓ **Competitor benchmarking:** Cross-channel competitor analysis requires entering a competitor channel URL (no OAuth needed) — prioritize this for MVP or post-launch?
- [ ] ❓ **AI model cost management:** Claude API per-comment analysis can be expensive at scale — set a per-account monthly AI budget cap, or absorb it into tier pricing from the start?

## Top Risks
1. **YouTube API quota limits:** Free quota (10K units/day) runs out fast with active users. Mitigation: implement quota-aware job scheduling, offer paid YouTube API quota to users who need more, and cache aggressively.
2. **Platform dependency:** YouTube can deprecate API endpoints or restrict commercial data usage. Mitigation: diversify with Twitch or TikTok comment analytics as a future track; avoid over-investing in YouTube-specific infrastructure that can't be reused.

## Dark Factory Readiness
**Ready:** Yes
**Notes:** YouTube Data API is well-documented, Claude API handles all AI features, and the stack is standard NestJS + Vue 3 + PostgreSQL. Quota management logic and dashboard UI are the only non-trivial engineering challenges. No legal blockers before starting implementation.
