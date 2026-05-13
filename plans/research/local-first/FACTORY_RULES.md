# Factory Rules — LocalFirst

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

### Reject (close with explanation)

- Issue requests a backend server or API
- Issue requests user accounts managed by the app
- Issue requests sending user data (plaintext) to any server
- Issue requests real-time sync or collaboration
- Issue adds AI features
- Issue weakens encryption (weaker algorithms, fewer PBKDF2 iterations)
- Issue adds analytics, telemetry, or error reporting to an external service
- Issue is ambiguous — close with: "Please describe the exact user action, expected outcome, and which module it affects."

### Escalate to `factory:needs-human`

- Issue proposes changing the encryption algorithm or key storage mechanism
- Issue proposes a new cloud backup provider (requires reviewing OAuth scopes)
- Issue changes the SQLite schema in a way that requires a migration
- Issue proposes a mobile Capacitor build (not in current factory scope)
- `src/composables/useEncryption.ts` needs modification
- Two consecutive fix attempts failed on the same PR

---

## Implementation Prohibitions

Agents must **never**:

- Transmit user data (plaintext notes, tasks, bookmarks) to any server
- Transmit the encryption key or derived key material to any server
- Call `crypto.subtle` directly from Vue components or stores — use `useEncryption.ts`
- Reduce PBKDF2 iterations below 600,000
- Use encryption algorithms weaker than AES-256-GCM
- Use string interpolation in SQL queries — always use parameterized statements
- Omit audit log entries from any state-mutating store action
- Add analytics, telemetry, or error reporting to external services
- Add a backend server or any server-side code
- Use `any` TypeScript type
- Commit `.env` or `.env.local` files
- Use implicit OAuth grant — only PKCE

---

## Quality Gates

| Gate | Command | Must Pass |
|---|---|---|
| TypeScript | `pnpm type-check` | Zero errors |
| Lint | `pnpm lint` | Zero errors |
| Format | `pnpm format --check` | No diffs |
| Unit Tests | `pnpm test:unit` | All pass |
| E2E Tests | `pnpm test:e2e` | All pass |
| Crypto Coverage | `pnpm test:unit --coverage` | 100% on `useEncryption.ts` |
| DB Coverage | `pnpm test:unit --coverage` | ≥80% on `useDatabase.ts` |

---

## Auto-Reject Triggers

Any PR is **automatically rejected** if it:

- Modifies `MISSION.md`, `CLAUDE.md`, or `FACTORY_RULES.md`
- Modifies `src/composables/useEncryption.ts` without a human in the review chain
- Contains a `fetch()` or network call that sends plaintext user data to a non-OAuth URL
- Reduces PBKDF2 iterations below 600,000
- Uses string interpolation in SQL queries
- Omits audit log calls from a new store mutation
- Introduces a dependency with known CVEs (`pnpm audit`)
- Reduces `useEncryption.ts` coverage below 100%
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
src/composables/useEncryption.ts
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
