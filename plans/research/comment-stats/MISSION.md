# MISSION.md — comment-stats

## What This Builds

A YouTube comments analytics dashboard that fetches comments via the YouTube Data API v3, runs sentiment analysis and NLP via Claude Haiku, and surfaces engagement patterns, trending keywords, audience questions, and toxic/spam content in a web UI.

## Primary Users

- YouTube creators and channel managers who want to understand audience sentiment at scale without reading every comment
- Social media managers running moderation queues for high-volume channels

## In Scope

- YouTube OAuth 2.0 login and API key management
- Per-video comment fetching and caching (SQLite, no re-fetch within 24h)
- Sentiment scoring per video with trend charts over time
- Keyword and phrase extraction per video and per channel
- Audience question detection (flagging comment-questions for creator response)
- Toxic/spam detection with moderation queue UI
- Free tier: 1 channel, 10 videos/month analyzed
- Pro tier ($7.99/mo via Stripe): unlimited channels, bulk analysis, CSV export
- NestJS backend: YouTube API calls, caching, AI analysis, Stripe billing

## Out of Scope

- Comments from platforms other than YouTube
- Auto-replying to comments on behalf of creators
- Video upload or content management
- Real-time comment streaming (analysis is batch, on-demand)
- Training or fine-tuning AI models
- Mobile apps (web only)
- Multi-user team accounts (single user per subscription)

## Immutable Constraints

1. YouTube API quota must never exceed 10,000 units/day per API key — enforced server-side with a running daily counter stored in SQLite; requests that would breach the limit are queued for the next day.
2. API keys and OAuth tokens are stored encrypted at rest — never in plaintext in the database or logs.
3. Private or unlisted video comments are never displayed unless the authenticated user is the verified channel owner.
4. Claude API cost per video analysis is hard-capped at $0.05 — truncate comment batches before sending if needed.
5. Pro pricing ($7.99/mo) is hardcoded in the codebase — agents must never change it without a human-authored issue and explicit approval.
6. No user comment data is used for AI training or shared with third parties.
