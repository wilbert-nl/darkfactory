# Mission

## What This Builds

A mobile app (iOS + Android via Capacitor) that alerts users when they are approaching a destination. Users set a destination by dropping a map pin or typing an address, configure a radius (e.g., 500m), and the app monitors GPS in the background — sending a local notification when the device enters the geofence. Designed for commuters who fall asleep on trains, travelers unfamiliar with a city, or anyone who needs to know when to get off without watching their screen.

## Primary Users

Commuters, travelers, and transit users who need a proximity alert that works without constant screen attention. Also useful for parents tracking when a child approaches home, or delivery workers monitoring arrival at a stop. Solves the problem of missing a destination because you weren't watching the map.

## In Scope (Factory Can Build)

- Map interface: drop a pin or search an address to set destination
- Configurable alert radius (100m–50km)
- Background GPS tracking with battery optimization
- Local push notification when entering the radius
- Saved destinations list with nicknames
- Multi-stop journey mode (alert at each stop in sequence)
- Commute intelligence: detect repeated routes, suggest enabling alerts
- Offline map tiles (basic caching)
- SQLite storage for saved destinations and trip history
- Bug fixes, tests, documentation

## Out of Scope (Never Build)

- Backend server or API
- Cloud sync or account system
- Sharing location with other users (not a tracker app)
- Turn-by-turn navigation
- Real-time traffic data
- Monetization or freemium tiers (free app)
- Advertising of any kind
- Sending location data to any external service

## Immutable Constraints (Cannot Change, Ever)

- Governance files (MISSION.md, CLAUDE.md, FACTORY_RULES.md) are human-only — agents must never modify them
- Location tracking requires explicit user consent — the permission request must explain why it is needed
- Location data never leaves the device — no network requests with coordinates
- Background geolocation must implement battery optimization (significant-change mode when far from destination)
- iOS `NSLocationAlwaysUsageDescription` must be present in `Info.plist` — never remove it
- Android foreground service notification is required for background tracking — never remove it
- User can revoke tracking at any time — the stop button must always be functional
