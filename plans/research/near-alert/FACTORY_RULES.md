# Factory Rules — NearAlert

## Governance Hierarchy

1. `MISSION.md` — defines what is built; agents cannot override it
2. `CLAUDE.md` — defines how it is built; agents follow it exactly
3. `FACTORY_RULES.md` — defines factory process; agents follow it exactly
4. GitHub Issues — work queue; agents triage and implement

Governance files are **human-only**. Any PR that modifies `MISSION.md`, `CLAUDE.md`, or `FACTORY_RULES.md` is auto-rejected.

---

## Triage Rules

### Accept (proceed to implementation)

- Issue describes a feature from "In Scope" in `MISSION.md`
- Bug fix with clear reproduction steps (device, OS version, steps)
- Test improvement with no functional change
- Documentation update

### Reject (close with explanation)

- Issue requests a backend server or user accounts
- Issue requests sharing or transmitting location data to any server
- Issue removes or weakens the location permission consent flow
- Issue adds analytics or telemetry
- Issue adds advertising
- Issue adds turn-by-turn navigation
- Issue is ambiguous — close with: "Please describe the device, OS version, the exact user action, and the expected vs actual behavior."

### Escalate to `factory:needs-human`

- Issue modifies `ios/App/App/Info.plist` (native iOS config)
- Issue modifies `android/app/src/main/AndroidManifest.xml` (native Android config)
- Issue modifies `capacitor.config.ts`
- Issue changes background geolocation plugin or configuration
- Issue proposes a new map tile provider (licensing implications)
- `src/composables/useGeofence.ts` needs modification (safety-critical)
- Two consecutive fix attempts failed on the same PR

---

## Implementation Prohibitions

Agents must **never**:

- Send GPS coordinates or any location data to any external server
- Call `fetch()` or make network requests with location data (Nominatim geocoding with a search string is allowed; sending coordinates is not)
- Remove or weaken the user consent flow before requesting location permissions
- Remove the iOS `NSLocationAlwaysUsageDescription` from `Info.plist`
- Remove the Android foreground service notification
- Disable the stop/cancel button during an active trip
- Inline haversine calculations — always use `useGeofence.ts`
- Modify `src/composables/useGeofence.ts` without a human in the review chain
- Add `any` TypeScript type
- Use string interpolation in SQL queries
- Import Capacitor plugins without mocking them in Vitest setup

---

## Quality Gates

| Gate | Command | Must Pass |
|---|---|---|
| TypeScript | `pnpm type-check` | Zero errors |
| Lint | `pnpm lint` | Zero errors |
| Format | `pnpm format --check` | No diffs |
| Unit Tests | `pnpm test:unit` | All pass |
| E2E Tests | `pnpm test:e2e` | All pass (web layer) |
| Geofence Coverage | `pnpm test:unit --coverage` | 100% on `useGeofence.ts` |
| Composable Coverage | `pnpm test:unit --coverage` | ≥80% on all composables |

---

## Auto-Reject Triggers

Any PR is **automatically rejected** if it:

- Modifies `MISSION.md`, `CLAUDE.md`, or `FACTORY_RULES.md`
- Modifies `ios/App/App/Info.plist` or `android/app/src/main/AndroidManifest.xml`
- Modifies `src/composables/useGeofence.ts` without human approval
- Contains a `fetch()` or network call that sends GPS coordinates to any server
- Removes or hides the stop/cancel button during active tracking
- Reduces `useGeofence.ts` coverage below 100%
- Introduces a dependency with known CVEs (`pnpm audit`)
- Uses string interpolation in SQL queries

---

## Fix Attempt Limit

- Maximum **2 fix attempts** per PR
- After 2 failures: label `factory:needs-human`, comment with summary, stop automated work

---

## Protected Files

```
MISSION.md
CLAUDE.md
FACTORY_RULES.md
ios/App/App/Info.plist
android/app/src/main/AndroidManifest.xml
capacitor.config.ts
tsconfig.json
src/composables/useGeofence.ts
```

---

## Budget Controls

- Set `maxBudgetUsd` on all AI agent nodes — required
- Recommended: $0.50 triage, $2.00 implementation, $1.00 fix attempt
- Halt and escalate if cumulative spend on one issue exceeds $5.00

---

## Labels

| Label | Meaning |
|---|---|
| `factory:untriaged` | New, not evaluated |
| `factory:accepted` | Ready for implementation |
| `factory:rejected` | Out of scope or violates constraints |
| `factory:needs-human` | Ambiguous, architectural, or hit fix-attempt limit |
| `factory:in-progress` | Agent working |
| `factory:review` | PR open, awaiting quality gates |
