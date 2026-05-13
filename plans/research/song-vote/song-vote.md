# SongVote — Research Brief

## What It Is
SongVote is a real-time audience song-request and voting platform for DJs, bar hosts, and live streamers. Guests join via QR code, search and request songs, vote on the queue, and optionally pay to boost their track — all without downloading an app.

## Competitors
| Name | Description |
|------|-------------|
| Songvote.club | DIRECT NAME COLLISION — identical concept already live; rename required before building |
| DJFY | Monetization-focused DJ request tool; guests bid on song requests |
| Lime DJ | Free browser-based requests, tipping, and music bingo; no paid boost mechanic |
| RequestNow | Text-message-based song requests, no voting or audience visibility |
| SongBoard | Event-integrated requests with segment management, limited streaming support |

## Market Size
US DJ services market: $1.5B+ annually. 45,000+ mobile DJs in the US alone. Live events and bar entertainment rebounding strongly post-pandemic. No single platform has achieved dominant adoption among DJs — the market is fragmented and ready for a product with strong monetization built in for the DJ.

## MVP Features
1. QR code per event — guests join instantly, no app download required
2. Real-time song search and request submission (YouTube Data API lookup)
3. Live voting / upvote queue visible to the audience on a public screen
4. DJ dashboard to approve, skip, or pin songs with one click
5. Tip-to-boost — guests pay via Stripe to move their song up the queue; DJ keeps 100%
6. Event history and basic analytics (most requested, most tipped)

## Differentiators
1. YouTube / Spotify preview before voting — no competitor shows an in-queue preview before the vote is cast
2. Streamer mode — Twitch and YouTube Live overlay displaying live vote tallies, purpose-built for content creators
3. Tip-to-boost with 0% platform fee — DJ keeps all tip revenue; platform earns only on Pro subscription, not per transaction

## Profitability
**Model:** Freemium (2 events/month free) → Pro at $19–29/mo for unlimited events + transaction fee on tip-to-boost (5–8%) + white-label venue plans
**Estimate:** 500 DJs × $24/mo = $144K ARR. At 2K DJs = $576K ARR. Venue chain white-label ($99–199/mo) adds B2B layer with higher ACV.

## Build Ease: 5/5
Standard real-time web app: WebSockets for live voting, YouTube Data API for song search, Stripe for payments. No complex AI required. Claude generates 80%+ of boilerplate. Most technically approachable of all six ideas — a competent solo dev can reach launch in 4–6 weeks.

## Legal Risks
- NAME COLLISION — Songvote.club already exists with the same concept; a new product must be renamed and trademark-searched before any branding investment
- Music licensing — displaying song metadata and 15-second audio previews can trigger licensing obligations; check YouTube and Spotify API terms carefully before enabling previews
- YouTube Data API commercial use restrictions — ToS prohibits certain monetized use cases; requires careful review before Stripe integration goes live
- Age verification — if platform is used in alcohol-serving venues, age-gating may be required in some jurisdictions
