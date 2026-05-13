# CrowdShot — Research Brief

## What It Is
A gig marketplace where users request real-time photos or videos of any location from someone physically present there, with GPS-stamped delivery and escrow payment release.

## Competitors
| Name | Description |
|------|-------------|
| ProxyPics | On-demand property photos for mortgage and insurance industries; B2B only |
| iVueit | Enterprise site surveys and audits; not consumer-facing |
| Scoopshot | $1.2M raised; brand/event photos on demand; limited traction |
| Mapillary | Meta-acquired; crowdsourced street-level mapping imagery; not on-demand |

## Market Size
Location scouting software market: $3.47B by 2033 at 11.2% CAGR. Key B2B verticals: real estate ($200B+ industry needing remote property verification), insurance (field inspection automation), travel (pre-booking destination verification), film/production scouting. Consumer travel use case is largely untapped despite high latent demand.

## MVP Features
1. Request creation with map pin, description, reward amount, and expiry
2. Push alert to nearby photographers with the request details
3. GPS-stamped and timestamped photo/video submission
4. Requester approval workflow before payment release
5. Photographer payout via Stripe Connect
6. Dispute resolution flow for rejected submissions

## Differentiators
1. Consumer travel use case — see the actual beach/hotel/street before booking, not stock photos
2. Video requests (15–30s walkthroughs) for richer location context
3. Live stream option for real-time verification of time-sensitive situations

## Profitability
**Model:** 20–30% transaction fee on each fulfilled request; B2B API at $1–5/photo for bulk enterprise volume
**Estimate:** 10K monthly requests × $15 avg reward × 25% fee = $450K ARR (consumer); B2B API contracts can 10x this

## Build Ease: 4/5
Gig marketplace architecture is well understood; AI handles photo quality validation, content moderation, and automatic tagging. Hard part: geographic cold start — need both requesters and photographers in the same city simultaneously.

## Legal Risks
- Privacy and surveillance: photographing private property or individuals without consent; requires explicit usage policy and geofencing controls
- Platform liability for trespass: photographer accessing restricted areas to fulfill requests
- CSAM and illegal content: any platform accepting user-submitted photos must implement mandatory content moderation
- Drone regulations: if aerial requests are allowed, FAA Part 107 compliance required
