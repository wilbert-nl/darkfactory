# PLAN: NearAlert
_Status: Draft — Resolve open questions before starting implementation_

> **For Claude in next session:** Read the open questions below and ask the user to resolve them one at a time before writing any code. Mark each resolved one with ✅.

## Overview
NearAlert is a location-based proximity alarm that wakes users when their device is near a set destination. It solves a real, recurring pain for commuters and travelers who fall asleep on transit. The market has fragmented competitors with clear gaps: no app owns multi-stop journeys, and Apple Watch support is entirely absent from the field. First-mover on Watch + multi-stop is the wedge.

## Recommended Stack
- **Frontend:** React Native (bare workflow, not Expo managed) — background location and native map integrations require bare workflow; Capacitor is not recommended here due to iOS background location restrictions needing native modules
- **Backend:** NestJS (minimal — saved places sync, subscription management, analytics)
- **Database:** PostgreSQL (user profiles, saved destinations); local device storage for active alarm state
- **Auth:** Supabase Auth (email + social; guest mode for first-use without friction)
- **Payments:** RevenueCat (cross-platform subscription + one-time purchase support)
- **AI:** Claude API — route suggestion engine ("you commute to Makati every weekday, save it?"), smart radius suggestion based on transit type (train vs bus vs walking)

## MVP Scope
- Set destination via map pin, address search, or saved place
- Configurable alert radius (500m, 1km, 2km) with alert types (sound, vibration, screen flash)
- Background GPS tracking with battery optimization (significant location change API on iOS, fused location on Android)
- Offline map tile caching for tunnels and signal-loss zones
- Saved frequent destinations (home, office, common stops)

## Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] Scaffold React Native bare workflow project
- [ ] Set up NestJS API + PostgreSQL for saved places sync
- [ ] Implement background location module (iOS CLLocationManager always-on + Android fused)
- [ ] Build proximity detection logic (haversine distance check against target radius)
- [ ] Implement alert types: sound, vibration, screen flash (even when locked)

### Phase 2 — Core Features (Week 3–5)
- [ ] Map UI with destination pin drop, address search, and radius circle overlay
- [ ] Saved destinations CRUD with "use as alarm" shortcut
- [ ] Offline map tile caching (Mapbox offline packs or Google Maps offline areas)
- [ ] Battery optimization mode (reduce GPS polling frequency when far from destination)
- [ ] Multi-stop journey support (sequential alerts at each waypoint)
- [ ] Pro subscription gate via RevenueCat

### Phase 3 — Launch Prep (Week 6–8)
- [ ] Apple Watch companion app (proximity alert on wrist — haptic + display)
- [ ] Commute intelligence: detect recurring routes and prompt to save as alarm
- [ ] Google Maps / Apple Maps ETA integration for dynamic radius adjustment
- [ ] App Store + Google Play submission with clear "always on location" permission justification copy
- [ ] Privacy policy covering location data handling (no server-side storage of location history)

## Open Questions ❓
> Resolve these before implementation. Ask one at a time.

- [ ] ❓ **Platform priority:** iOS-first, Android-first, or simultaneous? iOS has tighter background location restrictions — harder to build but Apple Watch is the key differentiator
- [ ] ❓ **Map provider:** Google Maps SDK (better transit data, pay-per-use billing) or Mapbox (flat monthly, better offline support)? This affects cost at scale
- [ ] ❓ **Monetization model:** One-time purchase ($2.99) vs freemium with ads vs subscription ($1.99/mo)? Each has different App Store review implications
- [ ] ❓ **Multi-stop in MVP:** Is multi-stop journey support a v1 feature or a Pro-tier post-launch addition?
- [ ] ❓ **Apple Watch scope:** Is Watch support a launch differentiator (Phase 3 before launch) or a post-launch roadmap item?
- [ ] ❓ **Location data policy:** Strictly on-device (no location data ever leaves the phone) or allow opt-in server sync for cross-device saved places?

## Top Risks
1. **iOS background location App Store rejection** — Apple reviews "always on" location apps strictly; mitigation: write clear justification copy, use the "significant location change" API where possible, and test with TestFlight before submitting to review
2. **Battery drain user complaints** — Background GPS is the top negative review driver across all competitor apps; mitigation: implement adaptive polling (slow poll when far from target, fast poll when within 5x the alert radius) and show a battery impact disclosure on first use

## Dark Factory Readiness
**Ready:** Partial
**Notes:** GPS background location requires native React Native expertise beyond standard Capacitor/web approach. Factory needs confirmed answers to: (1) platform priority, (2) map provider selection, and (3) monetization model before building. Apple Watch adds a separate watchOS target that roughly doubles Phase 3 scope — confirm whether it's pre-launch or post-launch.
