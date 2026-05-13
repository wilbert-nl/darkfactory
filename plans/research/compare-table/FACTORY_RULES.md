# Factory Rules — CompareTable

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
- Bug fix with clear steps to reproduce
- Test improvement with no functional change
- Documentation update

### Reject (close with explanation)

- Issue requests a backend server or database
- Issue requests user accounts or authentication
- Issue requests sending comparison data to a server
- Issue requests real-time collaboration
- Issue requests formats beyond PDF (Excel, CSV upload, Google Sheets)
- Issue bypasses the free tier (3 comparison) limit without a Pro flag
- Issue adds `VITE_ANTHROPIC_API_KEY` to production code without a proxy comment
- Issue is ambiguous — close with: "Please describe the exact user action and expected outcome."

### Escalate to `factory:needs-human`

- Issue proposes changing the share link from URL fragment to query params or server storage
- Issue proposes a payment flow or subscription management
- Issue proposes a backend proxy for the Claude API (valid, but needs human to spec it)
- Issue changes the SQLite schema in a way that requires a migration strategy
- Two consecutive fix attempts failed on the same PR

---

## Implementation Prohibitions

Agents must **never**:

- Send comparison data to any external server (share must be URL-encoded only)
- Use `?data=` query params for share links — only `#data=` URL fragments
- Call `Anthropic` client directly from Vue components — use `useAiCriteria.ts` composable
- Hardcode `isPro = true` or bypass the free tier check
- Use string interpolation in SQL queries — always use parameterized statements
- Expose `VITE_ANTHROPIC_API_KEY` in production without a `TODO: use proxy in prod` comment
- Add a backend server, Express, NestJS, or any server-side code
- Import dependencies > 50KB minified without human approval
- Use `any` TypeScript type
- Commit `.env` or `.env.local` files

---

## Quality Gates

| Gate | Command | Must Pass |
|---|---|---|
| TypeScript | `pnpm type-check` | Zero errors |
| Lint | `pnpm lint` | Zero errors |
| Format | `pnpm format --check` | No diffs |
| Unit Tests | `pnpm test:unit` | All pass |
| E2E Tests | `pnpm test:e2e` | All pass |
| Coverage | `pnpm test:unit --coverage` | ≥75% on `composables/` and `stores/` |

---

## Auto-Reject Triggers

Any PR is **automatically rejected** if it:

- Modifies `MISSION.md`, `CLAUDE.md`, or `FACTORY_RULES.md`
- Adds a `fetch()` or `axios` call that sends comparison data to a non-Anthropic URL
- Uses `?data=` in share link (must be `#data=`)
- Hardcodes `isPro = true`
- Uses string interpolation in SQL (e.g., `` `SELECT * FROM comparisons WHERE id = '${id}'` ``)
- Reduces test coverage below 75% on composables or stores
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
