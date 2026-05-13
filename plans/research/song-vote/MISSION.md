# MISSION.md — song-vote

## What This Builds

A real-time audience song-request and voting platform for DJs and live streamers. Guests join via QR code with no account or app download required. They search, request, and upvote songs. The DJ manages a live queue from a dashboard and can pin, approve, or skip tracks. Tipping boosts song priority.

## Primary Users

- DJs at clubs, weddings, and private events who want crowd-driven setlists
- Live streamers who want interactive song queues from their audience
- Event attendees and stream viewers who vote on songs anonymously
- Event organizers managing multiple DJ nights

## In Scope

- QR code generation per event (one scan = instant guest access, no signup)
- Real-time song search via Spotify Web API or YouTube Data API (search only, no playback)
- Guest song request and upvote flow (anonymous, no account required)
- Live public queue display on a big-screen URL
- DJ dashboard: approve, skip, pin tracks; view request history
- Tip-to-boost: optional Stripe payment to jump a song up the queue
- Event history and analytics for Pro DJs
- Free tier: 1 active event, 50 guests max
- Pro DJ ($9.99/mo): unlimited events, analytics, custom branding, tip-to-boost feature

## Out of Scope

- Audio playback or streaming integration
- Playlist export to Spotify or other services
- Native mobile app (web-only)
- Venue or promoter management accounts
- Scheduled or automated playlists
- Guest identity verification or persistent guest profiles

## Immutable Constraints

1. **Guest anonymity is non-negotiable** — guests must never be required to create an account or provide personally identifiable information to vote or request songs.
2. **Tip-to-boost is entirely optional** — guests must never be auto-charged; all tips require explicit guest-initiated action.
3. **Spotify API credentials never exposed to the frontend** — all Spotify or YouTube API calls are proxied through the NestJS backend.
4. **Event passcode (if set) must never appear in URL parameters** — passcode verification is form-based only.
5. **DJ dashboard requires authentication** — the guest request board does not.
6. **Max 500 concurrent guests per event is a hardcoded server limit** — agents must never raise or remove this cap.
7. **Pro pricing ($9.99/mo) and free tier limits (1 event, 50 guests) are hardcoded** — agents must never alter these values.
