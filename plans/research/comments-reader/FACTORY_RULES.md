# Factory Rules — CommentsReader

## Governance Hierarchy

1. `MISSION.md` — defines what is built; agents cannot override it
2. `CLAUDE.md` — defines how it is built; agents follow it exactly
3. `FACTORY_RULES.md` — defines factory process; agents follow it exactly
4. GitHub Issues — work queue; agents triage and implement

Governance files are **human-only**. Any PR that modifies `MISSION.md`, `CLAUDE.md`, or `FACTORY_RULES.md` is auto-rejected.

---

## Triage Rules

### Accept (proceed to implementation)

- Issue clearly describes a feature in the "In Scope" list in `MISSION.md`
- Issue is a bug fix with a reproducible description (steps, expected vs actual)
- Issue adds or improves tests with no functional change
- Issue updates documentation only

### Reject (close with explanation)

- Issue requests features in "Out of Scope" in `MISSION.md`
- Issue requests auto-play without user gesture
- Issue requests YouTube API calls
- Issue adds user analytics or telemetry
- Issue adds external HTTP requests of any kind
- Issue weakens the Content Security Policy
- Issue broadens `host_permissions` beyond `*://*.youtube.com/*`
- Issue is ambiguous — close with: "Please clarify the expected behavior and which YouTube page state triggers it."

### Escalate to `factory:needs-human`

- Issue modifies `manifest.json` permissions (any change to `permissions` or `host_permissions`)
- Issue changes the extension's MV3 architecture (e.g., adding a background API call)
- Issue proposes storing comment content to disk
- Issue proposes account login or cloud sync
- Two consecutive fix attempts failed on the same PR

---

## Implementation Prohibitions

Agents must **never**:

- Auto-play TTS without a user gesture (click or keyboard event)
- Add `fetch()`, `XMLHttpRequest`, or any network call to content script or background
- Call any YouTube API endpoint
- Store comment text in `chrome.storage.local` or `localStorage`
- Modify `public/manifest.json` without explicit human approval
- Weaken TypeScript strict settings in `tsconfig.json`
- Add `eslint-disable` comments without a human-approved reason
- Use `any` type — use `unknown` and narrow
- Add `console.log` statements to production builds (dev-only via `import.meta.env.DEV`)
- Import heavy third-party libraries (>50KB minified) without human approval

---

## Quality Gates

All gates must pass before a PR can be merged:

| Gate | Command | Must Pass |
|---|---|---|
| TypeScript | `pnpm type-check` | Zero errors |
| Lint | `pnpm lint` | Zero errors |
| Format | `pnpm format --check` | No diffs |
| Unit Tests | `pnpm test:unit` | All pass |
| E2E Tests | `pnpm test:e2e` | All pass |
| Bundle Size | build output | `dist/` < 2MB total |

---

## Auto-Reject Triggers

Any PR is **automatically rejected** (closed without merge) if it:

- Modifies `MISSION.md`, `CLAUDE.md`, or `FACTORY_RULES.md`
- Modifies `public/manifest.json`
- Contains `fetch(`, `XMLHttpRequest`, or `axios` in `src/content/` or `src/background/`
- Contains `chrome.storage.local.set` with comment text as value
- Adds any `host_permissions` entry beyond `*://*.youtube.com/*`
- Introduces a dependency with known CVEs (checked via `pnpm audit`)
- Reduces test coverage below 70% line coverage on `src/content/` or `src/popup/stores/`
- Has a build that produces `dist/` > 2MB

---

## Fix Attempt Limit

- Maximum **2 fix attempts** per PR
- After 2 failures: label `factory:needs-human`, leave a comment summarizing what was tried, stop all automated work on that PR

---

## Protected Files

The following files must never be modified by agents:

```
MISSION.md
CLAUDE.md
FACTORY_RULES.md
public/manifest.json
public/icons/
tsconfig.json
```

---

## Budget Controls

- Set `maxBudgetUsd` on all AI agent nodes — required
- Recommended cap: $0.50 per triage, $2.00 per implementation, $1.00 per fix attempt
- Halt if cumulative spend on a single issue exceeds $5.00 — escalate to `factory:needs-human`

---

## Labels

| Label | Meaning |
|---|---|
| `factory:untriaged` | New issue, not yet evaluated |
| `factory:accepted` | Triage passed, ready for implementation |
| `factory:rejected` | Out of scope or violates constraints |
| `factory:needs-human` | Ambiguous, architectural, or hit fix-attempt limit |
| `factory:in-progress` | Agent currently working on it |
| `factory:review` | PR open, awaiting quality gate results |
