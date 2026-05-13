# MISSION.md — movie-critic

## What This Builds

A two-sided marketplace connecting indie filmmakers with vetted professional film critics for paid pre-release reviews. Filmmakers submit a brief and a Vimeo screener link; critics bid or are selected; payment goes into Stripe Connect escrow; the critic receives a time-limited (24h) signed screener URL; after review completion and filmmaker approval (or 7-day auto-release), escrow is released and the review is published. Critics are vetted by humans — no automated approval.

## Primary Users

- **Indie filmmakers** — directors and producers seeking professional criticism before festival submission or release
- **Professional film critics** — vetted reviewers with published credentials who set their own rate ($50–$500/review)
- **Platform admins (human)** — vet and approve critic profiles; moderate published reviews; handle disputes
- **Platform system** — manages escrow, screener URL generation, and timed auto-release

## In Scope

- Filmmaker registration and brief submission (title, genre, runtime, logline, Vimeo URL, review deadline)
- Critic registration with bio, genre specializations, sample reviews, and rate setting ($50–$500)
- Human-gated critic approval workflow — admin reviews applications; agents never approve critics
- Booking flow: filmmaker selects critic, pays into Stripe Connect escrow (15% platform commission)
- Screener delivery as time-limited signed URL (24h expiry, no direct Vimeo embed)
- Critic workspace: view brief (not filmmaker identity until booking confirmed), submit review + private feedback report
- Review publication triggered by filmmaker approval or 7-day auto-release (hardcoded)
- Published reviews visible on critic public profile and filmmaker portfolio
- Filmmaker and critic dashboards for managing active and past bookings

## Out of Scope

- Real-time video streaming or in-app video playback
- AI-generated reviews or AI critique assistance (no Claude API in frontend; backend AI use for non-review tasks only)
- Critic rating or ranking by audience votes in MVP
- Dispute arbitration automation — human moderation only
- Review deletion by agents — human moderation only
- Multiple critic bidding / auction model in MVP
- Mobile native app
- Multi-language / internationalization in MVP

## Immutable Constraints

1. **Commission hardcoded at 15%** — agents must never change this value in any code path
2. **Screener URL expiry hardcoded at 24h** — agents must never extend or make this configurable
3. **Critics approved by humans only** — no code path may set `approved = true` on a critic without a human admin action
4. **Filmmaker identity hidden until booking confirmed** — critic must not receive filmmaker name/contact before payment clears
5. **Payment auto-release hardcoded at 7 days** — agents must never change this timer
6. **Reviews cannot be deleted by agents** — only human admins can remove published reviews
7. **Stripe Connect escrow flow** — agents must never modify the escrow capture/transfer logic
8. **Protected paths are human-only** — `api/src/auth/`, `api/src/payments/commission.service.ts`, `api/src/screener/`, `api/src/review/publish.service.ts` are off-limits to agent modification
