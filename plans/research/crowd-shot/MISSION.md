# MISSION.md — crowd-shot

## What This Builds

A gig marketplace where requesters post real-time photo/video jobs with a location pin and reward amount, and nearby photographers receive push alerts, submit GPS-stamped media, and get paid via Stripe Connect escrow after requester approval. Available on iOS, Android, and web via Capacitor.

## Primary Users

- **Requesters**: Individuals, journalists, event organizers, or brands who need on-the-ground photos/video quickly and are willing to pay for it
- **Photographers**: Gig workers or enthusiasts who want to monetize their camera skills and proximity

## In Scope

- Request creation: map pin, reward amount (max $500), description, deadline
- Geo-matching: real-time push alerts to photographers within configurable radius
- Photo/video submission with server-verified GPS coordinates and timestamp
- Requester approval workflow before payment release
- Stripe Connect escrow: hold on submission, release on approval, refund on rejection
- Dispute resolution workflow (human-reviewed — no auto-resolution)
- Content moderation queue before delivery to requester
- Free requester tier: standard alerts, single submitter per job
- Pro requester ($14.99/mo): priority alerts, team requests (multiple photographers)
- Pro photographer: featured profile in proximity ranking

## Out of Scope

- Video editing or post-processing
- Requester-to-photographer direct messaging (outside dispute workflow)
- Subscription-based content feeds or media libraries
- Auto-approval of payments without requester action
- Auto-resolution of disputes (all disputes escalate to human review)
- AI-generated or synthetic content submissions

## Immutable Constraints

1. Platform fee of 20% is hardcoded — agents must never modify the fee percentage.
2. Maximum reward amount is $500 per job — enforced server-side; any request above this is rejected.
3. GPS metadata (coordinates, timestamp) must be verified server-side — client-submitted coordinates are never trusted as-is.
4. Escrowed funds must never be released without explicit requester approval or a resolved human dispute decision.
5. All submitted photo/video content must pass moderation before being delivered to the requester.
6. Dispute resolution is handled by humans — no automated dispute outcome logic is permitted.
7. Stripe Connect credentials and webhook secrets are never exposed to the frontend.
