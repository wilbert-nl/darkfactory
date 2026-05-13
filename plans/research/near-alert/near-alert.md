# NearAlert — Research Brief

## What It Is
A location-based proximity alarm that alerts you when your phone is near a set destination. Built for travelers and commuters who fall asleep on transit and need a GPS-triggered wake-up rather than a time-based one.

## Competitors
| Name | Description |
|------|-------------|
| Naplarm | Android; GPS proximity alarm explicitly for transit nappers; 500K+ Google Play installs |
| Sleep&Arrive | 2025; Wear OS-integrated transit alarm with transfer support + offline maps; ~$4/mo Pro |
| WakeMeThere by MapFactor | Free GPS alarm for commuters and travelers; 50K+ downloads |
| Localarm / WakePoint | iOS-focused transit alarm apps; both launched 2023–2024 |

## Market Size
April 2026 Android Authority article covered Sleep&Arrive as newsworthy, signaling ongoing press attention. Global public transit ridership runs into billions of daily trips. Personal safety tracking device market $1.24B (2024) → $2.45B by 2033. Search volume for "GPS alarm commuter" shows consistent seasonal interest with no single dominant app owning the query.

## MVP Features
1. Set destination by map pin, address, or saved place
2. Configurable alert radius (500m, 1km, 2km)
3. Alert types: sound, vibration, screen flash
4. Background GPS tracking with battery optimization
5. Saved frequent destinations (home, office, common stops)
6. Offline map support for tunnels and signal loss

## Differentiators
1. Multi-stop journeys — alert at each transfer point, not just the final destination; a gap in most current apps
2. Wearable integration — extend to Apple Watch; Sleep&Arrive covers Wear OS only, leaving Apple Watch as a major uncontested gap
3. Commute intelligence — learn usual routes and proactively suggest saving them as alarms; integrate with Google Maps/Apple Maps ETAs

## Profitability
**Model:** One-time purchase ($1.99–$3.99) or freemium with ads on free tier, remove ads at $1.99. Premium subscription at $1.99/mo for multi-stop routing, offline maps, and wearable sync. Partnership track with transit apps (Citymapper, Moovit) for white-label integration.

**Estimate:** 100K paid downloads × $2.99 = ~$299K. 30K monthly subscribers × $1.99 = $716K ARR.

## Build Ease: 4/5
GPS and push notifications are both well-documented. Map integration boilerplate exists via Google Maps SDK and Mapbox. AI handles route suggestions. Main challenges: battery optimization on Android and iOS background location restrictions require native mobile expertise beyond standard Capacitor web-to-native bridging.

## Legal Risks
- iOS background location restrictions — Apple requires clear user consent for "always on" location access; violation leads to App Store rejection
- GDPR/CCPA for location data — do not store location history server-side without explicit user consent
- Liability disclaimer required — if alarm fails due to GPS loss and user misses stop, do not market as a safety-critical tool
