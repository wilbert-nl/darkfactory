# Factory Rules — OnlineOrganizer

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
- Bug fix with clear reproduction steps
- Test improvement with no functional change
- Documentation update
- New curated theme (must follow CSS custom property convention)

### Reject (close with explanation)

- Issue requests a backend server or cloud sync
- Issue requests user accounts
- Issue adds AI features
- Issue requests calendar integration (Google Calendar, iCal)
- Issue uses server-side PDF rendering
- Issue hardcodes colors in component styles instead of CSS custom properties
- Issue bypasses the free tier without `proStore.isPro`
- Issue is ambiguous — close with: "Please describe the exact module, user action, and expected outcome."

### Escalate to `factory:needs-human`

- Issue proposes a new theme that changes the overall design language (not just colors)
- Issue changes the SQLite schema in a way requiring a migration
- Issue proposes a mobile Capacitor build
- Issue proposes import from other tools
- Two consecutive fix attempts failed on the same PR

---

## Implementation Prohibitions

Agents must **never**:

- Transmit user data to any external server
- Use server-side PDF rendering — jsPDF only, client-side
- Hardcode hex/rgb colors in Vue component `<style>` blocks — only `var(--oo-*)` custom properties
- Bypass pro tier check — always use `proStore.isPro`
- Use string interpolation in SQL queries
- Add AI features of any kind
- Add a backend server or any server-side code
- Use `any` TypeScript type
- Commit `.env` or `.env.local` files
- Add dependencies > 50KB minified without human approval

---

## Quality Gates

| Gate | Command | Must Pass |
|---|---|---|
| TypeScript | `pnpm type-check` | Zero errors |
| Lint | `pnpm lint` | Zero errors |
| Format | `pnpm format --check` | No diffs |
| Unit Tests | `pnpm test:unit` | All pass |
| E2E Tests | `pnpm test:e2e` | All pass |
| Habit Coverage | `pnpm test:unit --coverage` | 100% on habit streak logic |
| Recurrence Coverage | `pnpm test:unit --coverage` | 100% on recurring task generation |
| General Coverage | `pnpm test:unit --coverage` | ≥80% on all composables and stores |

---

## Auto-Reject Triggers

Any PR is **automatically rejected** if it:

- Modifies `MISSION.md`, `CLAUDE.md`, or `FACTORY_RULES.md`
- Modifies files in `src/themes/` without human review
- Contains hardcoded colors in Vue component `<style>` blocks
- Uses server-side PDF rendering
- Bypasses `proStore.isPro` check
- Uses string interpolation in SQL queries
- Reduces habit streak coverage below 100%
- Introduces a dependency with known CVEs (`pnpm audit`)
- Commits an `.env` file

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
public/sql-wasm.wasm
tsconfig.json
src/themes/           # all theme token files — human review required for changes
.env
.env.local
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
