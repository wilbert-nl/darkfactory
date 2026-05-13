# MISSION.md — land-match

## What This Builds

A specialized property marketplace connecting land sellers with verified buyers. Sellers list parcels with GPS coordinates, boundary maps, and uploaded title documents. Buyers post intent listings and save searches with alerts. Human reviewers award verified badges to listings with valid documents. Search is powered by SQLite FTS5 full-text search. Map views are rendered with Leaflet (no API key required).

## Primary Users

- **Land sellers** — individuals or small agencies listing rural/agricultural/undeveloped land parcels
- **Land buyers** — individuals, investors, or developers searching for land by location, acreage, or price
- **Human document reviewers** — internal staff who manually verify uploaded title documents

## In Scope

- Land listing creation with acreage, GPS coordinates (≥6 decimal precision), price, description, and GeoJSON boundary map
- Leaflet-based map view for browsing listings geographically
- Document upload (title deeds, survey plats) with manual human-verified badge workflow
- Buyer intent posts ("looking for X acres in Y region at Z budget")
- Saved searches with email alerts on new matching listings
- Async seller–buyer messaging (no WebSocket; polling or SSE)
- SQLite FTS5 full-text search across listing title, description, and location fields
- Stripe subscription billing: free tier (3 listings), Pro Seller $19.99/mo, Pro Buyer $9.99/mo
- User registration, login, email verification, password reset

## Out of Scope

- Automated property valuation or price suggestions (legal risk — permanently excluded)
- Automated document verification — verified badge is human-only, always
- Real-time WebSocket messaging in MVP
- MLS / third-party listing data import
- Mortgage or financing integrations
- Auction or bidding features
- Mobile app (Capacitor not used in this web-only app)
- Multi-language / internationalization

## Immutable Constraints

1. **No automated valuation** — agents must never implement price suggestions, AVM integrations, or automated appraisals
2. **Verified badge is human-only** — no code path may set `verified = true` without a human reviewer action; agents must never automate this
3. **GPS precision** — coordinates stored as REAL with ≥6 decimal places; validation must reject fewer than 6 decimal digits
4. **Listing price ≥ 1** — price of 0 is hardcoded invalid; no agent may remove this validation
5. **Document encryption** — land title documents stored encrypted at rest; agents must never store documents as plaintext
6. **Pro pricing hardcoded** — $19.99 Pro Seller, $9.99 Pro Buyer; agents must never change these values
7. **GeoJSON boundary format** — boundary data stored as GeoJSON only; agents must not introduce alternative geometry formats
8. **Protected paths are human-only** — `api/src/auth/`, `api/src/verification/`, `api/src/documents/` are off-limits to agent modification
