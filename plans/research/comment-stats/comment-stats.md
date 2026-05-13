# CommentStats — Research Brief

## What It Is
A YouTube comments analytics dashboard for creators that surfaces sentiment trends, top keywords, audience questions, and engagement patterns — turning raw comment sections into actionable audience intelligence.

## Competitors
| Name | Description |
|------|-------------|
| VidIQ | Full YouTube growth platform; comment monitoring is a minor feature bolt-on; SEO-first; $7.50/mo+ |
| TubeBuddy | Chrome extension for A/B testing, SEO, and basic comment management; $4.50–49.50/mo |
| OutlierKit | $9–19/mo audience psychographics and content analysis; closest to comment intelligence but not comment-first |
| ANTRAMIC / Microposter | Lightweight standalone comment analyzers; consumer-grade, limited depth |

## Market Size
Creator economy valued at $252B in 2025, projected $1.3T by 2033. Analytics and insights tools represent 16.7% of creator tool usage. 500M+ YouTube channels exist; 2M+ are monetized or professionally active. VidIQ and TubeBuddy each estimated at $20M–50M ARR, validating creator willingness to pay for analytics tooling.

## MVP Features
1. Connect via YouTube Data API; pull comments for any video or channel
2. Per-video sentiment scoring with positive/negative/neutral trend over time
3. Top keyword and phrase extraction (word cloud + ranked table)
4. Engagement trend graph (comment velocity, reply ratios, comment-to-view ratio)
5. Audience question detection — surface unanswered questions for next-video topic ideas
6. Toxic and spam comment flagging with bulk moderation queue
7. Side-by-side video comparison view for comment health across uploads

## Differentiators
1. Comment-first focus: VidIQ and TubeBuddy are SEO-first platforms where comment intelligence is an afterthought; CommentStats is purpose-built around comment data
2. Actionable insight layer: surfaces which topics drove sentiment shifts and which questions deserve a follow-up video, not just raw metrics
3. Cross-video and cross-channel benchmarking against competitor channels — no current tool does this natively

## Profitability
**Model:** SaaS subscription. Free tier: 1 channel, 30-day history. Pro: $19/mo (unlimited channels, 1-year history). Agency: $79/mo (client dashboards, white-label reports).
**Estimate:** Early traction at 2K subscribers × $19 avg = $456K ARR. Realistic $2–5M ARR within 2–3 years at current creator tool market growth rates.

## Build Ease: 4/5
YouTube Data API is well-documented with generous free quota tiers. Claude/LLMs handle sentiment scoring, keyword clustering, question detection, and natural-language insight summaries ("Your last 3 videos triggered unusual negative sentiment around topic X") with minimal custom prompting. Hard parts: API quota management at scale and building a clean, fast dashboard UI.

## Legal Risks
- YouTube API ToS restricts storing user data beyond defined time windows and prohibits certain commercial uses of comment data — requires careful data retention policies and ToS review
- GDPR exposure for bulk profiling of EU commenters extracted via the API — may require data minimization and user consent mechanisms
- Platform dependency risk: YouTube can change API access, pricing, or quota limits at any time, which could cripple the product overnight
