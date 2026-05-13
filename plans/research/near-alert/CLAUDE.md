# CLAUDE.md — NearAlert Technical Specification

## Stack

| Layer | Technology |
|---|---|
| UI Framework | Vue 3 + Quasar (Capacitor mode) |
| Language | TypeScript (strict) |
| Component Style | `<script setup>` + Composition API |
| State | Pinia |
| Storage | @capacitor-community/sqlite |
| GPS | @capacitor/geolocation |
| Background GPS | @capacitor-community/background-geolocation |
| Notifications | @capacitor/local-notifications |
| Maps | Leaflet.js + OpenStreetMap tiles |
| Geocoding | Nominatim (OpenStreetMap) — free, no API key required |
| Package Manager | pnpm |
| Testing | Vitest (unit), Playwright (E2E — web layer only) |
| Lint | ESLint + Prettier + vue-tsc |
| Build Targets | iOS (Xcode), Android (Android Studio) |

## Repo Layout

```
near-alert/
├── src/
│   ├── pages/
│   │   ├── MapPage.vue              # main map + set destination
│   │   ├── ActiveTripPage.vue       # in-progress trip, stop button prominent
│   │   ├── DestinationsPage.vue     # saved destinations list
│   │   ├── HistoryPage.vue          # past trips log
│   │   └── SettingsPage.vue
│   ├── components/
│   │   ├── MapPicker.vue            # Leaflet map with pin drop
│   │   ├── RadiusSlider.vue
│   │   ├── DestinationCard.vue
│   │   ├── StopList.vue             # multi-stop journey builder
│   │   └── CommutePrompt.vue        # commute intelligence suggestion
│   ├── stores/
│   │   ├── trip.store.ts            # active trip state + geofence logic
│   │   ├── destinations.store.ts    # saved destinations CRUD
│   │   └── settings.store.ts        # radius default, notification prefs
│   ├── composables/
│   │   ├── useGeolocation.ts        # wraps @capacitor/geolocation
│   │   ├── useBackgroundGeo.ts      # wraps @capacitor-community/background-geolocation
│   │   ├── useGeofence.ts           # haversine distance + radius check
│   │   ├── useNotifications.ts      # wraps @capacitor/local-notifications
│   │   ├── useDatabase.ts           # @capacitor-community/sqlite wrapper
│   │   └── useNominatim.ts          # address geocoding via Nominatim
│   ├── router/
│   │   └── index.ts
│   └── types/
│       └── index.ts
├── ios/                             # Xcode project (git-tracked config, not build artifacts)
├── android/                         # Android Studio project
├── tests/
│   ├── unit/
│   └── e2e/
├── capacitor.config.ts
├── quasar.config.ts
├── tsconfig.json
└── package.json
```

## Running the App

```bash
# Install dependencies
pnpm install

# Build web layer
pnpm build

# Sync to native projects
pnpx cap sync

# Run on iOS (requires Xcode on macOS)
pnpx cap open ios

# Run on Android (requires Android Studio)
pnpx cap open android

# Dev server (web/browser preview — no real GPS, use mock)
pnpm dev

# Run unit tests
pnpm test:unit

# Run E2E tests (web layer only)
pnpm test:e2e
```

## Testing

```bash
pnpm test:unit           # Vitest
pnpm test:unit --watch
pnpm test:e2e            # Playwright (web layer)
pnpm test:unit --coverage
```

Rules:
- `useGeofence.ts` (haversine calculation) must have 100% line coverage — safety-critical logic
- `useGeolocation.ts` and `useBackgroundGeo.ts` must be tested with mocked Capacitor plugins
- E2E tests run on the web layer (Playwright). Native GPS behavior tested manually on device.
- Coverage minimum: ≥80% on all composables
- No test may call real GPS or Nominatim APIs — mock all external services

## Lint / Format / Type Check

```bash
pnpm lint
pnpm lint:fix
pnpm format
pnpm type-check   # vue-tsc --noEmit
```

## Code Conventions

- TypeScript strict mode — `noImplicitAny`, `strictNullChecks`
- All Vue SFCs use `<script setup lang="ts">`
- Pinia stores use setup-function style
- `async/await` throughout
- No `any` type
- Geofence check (haversine) lives exclusively in `useGeofence.ts` — never inline distance calculations in components
- Battery optimization: when user is >10× the alert radius from destination, switch to significant-change updates rather than continuous GPS
- All permission requests must include a human-readable explanation string before calling `requestPermissions()`
- The stop/cancel button must always be rendered and functional during an active trip — never disable it

## Storage Rules

```sql
-- Saved destinations
CREATE TABLE destinations (
  id TEXT PRIMARY KEY,
  nickname TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  address TEXT,
  default_radius INTEGER NOT NULL DEFAULT 500,  -- meters
  visit_count INTEGER NOT NULL DEFAULT 0,
  last_visited INTEGER,
  created_at INTEGER NOT NULL
);

-- Trip history
CREATE TABLE trips (
  id TEXT PRIMARY KEY,
  destination_id TEXT REFERENCES destinations(id),
  started_at INTEGER NOT NULL,
  alerted_at INTEGER,
  arrived_at INTEGER,
  alert_radius INTEGER NOT NULL,
  distance_traveled REAL  -- approximate meters
);

-- Multi-stop journey stops
CREATE TABLE journey_stops (
  id TEXT PRIMARY KEY,
  journey_id TEXT NOT NULL,
  destination_id TEXT NOT NULL REFERENCES destinations(id),
  position INTEGER NOT NULL,
  alerted_at INTEGER
);
```

- All queries use parameterized placeholders
- IDs are UUIDs (`crypto.randomUUID()`)
- Coordinates stored as REAL (lat/lng)
- No location coordinates stored in trip history beyond destination — no raw GPS track log

## Environment Variables

| Variable | Purpose | Notes |
|---|---|---|
| `VITE_ENV` | `development` or `production` | Enables GPS mock in dev |

No API keys required. Nominatim is free and requires no key. No backend.

## Protected Paths

```
MISSION.md
CLAUDE.md
FACTORY_RULES.md
ios/App/App/Info.plist              # NSLocationAlwaysUsageDescription must remain
android/app/src/main/AndroidManifest.xml  # foreground service config
tsconfig.json
src/composables/useGeofence.ts     # safety-critical — human review required
capacitor.config.ts
```

## Known Footguns

- **iOS background geolocation requires "Always" permission**: The standard `@capacitor/geolocation` only gets "When In Use". Background tracking requires `@capacitor-community/background-geolocation` which has its own permission flow. Do not conflate the two plugins.
- **Android foreground service notification**: Background GPS on Android requires a persistent foreground service notification. This notification cannot be dismissed while tracking is active. Do not attempt to hide it — Android will kill the service.
- **Nominatim rate limiting**: Nominatim enforces max 1 request/second. Add a debounce of at least 1 second on address search input. Never batch geocoding requests.
- **Haversine precision**: Use the full haversine formula (not flat-earth approximation) — at small radii (100m) the error from flat-earth approximation is significant.
- **Capacitor plugin mocking in Vitest**: Capacitor plugins throw in a non-native environment. Mock all `@capacitor/*` imports in Vitest setup using `vi.mock()`.
- **iOS Simulator GPS**: The iOS Simulator supports simulated GPS locations via the Debug menu. Always test background geolocation on a real device before marking a feature done.

## Commit & PR Conventions

```
type(scope): short description

Closes #N
```

Types: `feat`, `fix`, `test`, `chore`, `docs`, `refactor`, `perf`
Scopes: `map`, `gps`, `geofence`, `notifications`, `destinations`, `journey`, `db`, `ios`, `android`

Examples:
- `feat(geofence): implement battery-optimized significant-change mode when far from destination`
- `fix(gps): handle iOS permission denial gracefully with user-facing message`
- `test(geofence): add haversine precision tests at 100m, 500m, and 50km radii`

- PRs must reference an issue (`Closes #N`)
- Max 400 lines changed per PR
