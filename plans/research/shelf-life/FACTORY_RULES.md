# Factory Rules — ShelfLife

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
- Bug fix with clear reproduction steps (browser, OS, steps)
- Test improvement with no functional change
- Documentation update

### Reject (close with explanation)

- Issue requests a backend server, API, or user accounts
- Issue requests cloud sync or transmitting pantry data anywhere
- Issue requests barcode scanning or an external product/recipe database
- Issue adds analytics, telemetry, or crash reporting
- Issue adds advertising or payment processing
- Issue removes or weakens the food-safety disclaimer
- Issue makes the app present itself as certifying food safety
- Issue is ambiguous — close with: "Please describe the browser, OS, the exact user action, and the expected vs actual behavior."

### Escalate to `factory:needs-human`

- Issue modifies `quasar.config.ts` (build / PWA config)
- Issue changes the localStorage schema or key versioning
- Issue requires modifying `src/composables/useExpiry.ts` (core logic)
- Issue requires modifying `src/composables/useStorage.ts` (storage integrity)
- Issue proposes adding any new runtime dependency
- Two consecutive fix attempts failed on the same PR

---

## Implementation Prohibitions

Agents must **never**:

- Add a backend, API, or any network call that transmits pantry data
- Add user accounts, authentication, or cloud sync
- Add barcode scanning or fetch from an external product/recipe database
- Add analytics, telemetry, or crash reporting
- Remove or weaken the food-safety disclaimer
- Call `localStorage` directly from a component or store body — always go through `useStorage.ts`
- Inline date / expiry math — always use `useExpiry.ts`
- Modify `useExpiry.ts` or `useStorage.ts` without a human in the review chain
- Hardcode or fetch food prices — money values are user estimates only
- Add `any` TypeScript type
- Request notification permission without a user gesture and explanation
- Commit `.env` files or secrets

---

## Quality Gates

| Gate | Command | Must Pass |
|---|---|---|
| TypeScript | `pnpm type-check` | Zero errors |
| Lint | `pnpm lint` | Zero errors |
| Format | `pnpm format --check` | No diffs |
| Unit Tests | `pnpm test:unit` | All pass |
| E2E Tests | `pnpm test:e2e` | All pass |
| Expiry Coverage | `pnpm test:unit --coverage` | 100% on `useExpiry.ts` |
| Composable/Store Coverage | `pnpm test:unit --coverage` | ≥80% on all composables and stores |

---

## Auto-Reject Triggers

Any PR is **automatically rejected** if it:

- Modifies `MISSION.md`, `CLAUDE.md`, or `FACTORY_RULES.md`
- Modifies `quasar.config.ts` without human approval
- Modifies `src/composables/useExpiry.ts` or `src/composables/useStorage.ts` without human approval
- Contains a `fetch()`, `XMLHttpRequest`, or WebSocket that carries pantry data
- Adds an account, auth, or cloud-sync surface
- Removes or hides the food-safety disclaimer
- Reduces `useExpiry.ts` coverage below 100%
- Introduces a dependency with known CVEs (`pnpm audit`)
- Adds a new runtime dependency without human approval

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
tsconfig.json
quasar.config.ts
src/composables/useExpiry.ts
src/composables/useStorage.ts
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
</content>
