# MISSION.md — travel-connect

## What This Builds

A two-sided marketplace where travelers post dream itinerary requests and vetted travel agencies compete to win the booking with proposals. The platform handles discovery, side-by-side proposal comparison, in-app messaging, and escrow-based booking confirmation. Agencies pay to list; the platform takes a booking fee.

## Primary Users

- Travelers who want custom itineraries without spending hours researching agencies
- Travel agencies and independent travel consultants seeking qualified leads
- Corporate travel managers booking group or executive trips
- Destination wedding and honeymoon planners

## In Scope

- Traveler dream trip request form (destination, dates, budget, preferences)
- Agency profile with IATA badge (human-verified), reviews, and portfolio
- Open request feed visible to registered agencies
- Proposal creation by agencies with itinerary detail and pricing
- Side-by-side proposal comparison for travelers
- In-app async messaging between traveler and agencies (no real-time WebSocket in MVP)
- Booking confirmation with Stripe escrow (Payment Intents)
- Escrow release on traveler confirmation OR 14-day auto-release (hardcoded)
- 8% platform booking fee on all completed transactions
- Agency free tier: 3 proposals per month
- Agency Pro ($29/mo): featured listing, unlimited proposals

## Out of Scope

- Flight or hotel booking direct integration (Amadeus, Sabre, etc.)
- Real-time chat or WebSocket messaging (async only in MVP)
- Traveler-to-traveler community or reviews
- Package deals or pre-built itineraries for direct purchase
- Insurance or visa processing
- Mobile native app (web-only in MVP)

## Immutable Constraints

1. **Platform booking fee (8%) is hardcoded** — agents must never alter this value under any circumstances.
2. **IATA badge is human-verified only** — agents must never automate the badge grant or create any code path that awards it programmatically.
3. **Proposal limit (3/month for free agencies) is enforced server-side** — agents must never implement client-side-only enforcement.
4. **Escrow auto-release is hardcoded at 14 days** — agents must never shorten or remove this safeguard.
5. **Agencies may only see traveler first name until a booking is confirmed** — full traveler contact details are never exposed before booking.
6. **Travel itinerary data is personal data** — all traveler data must be deleted on account closure within 30 days.
7. **Pro pricing ($29/mo) and free proposal limit (3/mo) are hardcoded** — agents must never alter these values.
