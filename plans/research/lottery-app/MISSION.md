# MISSION.md — lottery-app

## What This Builds

A transparent online lottery platform where users create and join fixed-entry-fee prize pools. Fairness is cryptographically verifiable — all draws use the NIST Randomness Beacon, never Math.random(). Each draw produces a publicly auditable proof stored as an immutable record. KYC and age verification (18+) are required before any paid entry. Stripe handles payments and deposit limits are enforced server-side.

## Primary Users

- **Players** — adults (18+) who pass KYC, deposit funds, and enter lottery pools
- **Pool creators** — verified players who configure entry fees ($1–$1000), pool size, and draw schedule
- **Compliance officer (human)** — reviews jurisdiction approvals; never delegated to agents
- **Platform admins** — manage KYC escalations, dispute payouts, audit draw records

## In Scope

- User registration, KYC via third-party provider (Persona or Stripe Identity), age verification (18+)
- Pool creation with fixed entry fee, max participants, and scheduled draw time
- Pool joining with Stripe payment capture; deposit limits enforced per user per day
- Draw execution using NIST Randomness Beacon public API; beacon response stored with each draw record
- Cryptographic payout proof generated and stored as immutable SQLite record
- Automated payout to winner via Stripe transfer; proof attached to payout record
- Referral system (referrer earns credit on referred user's first paid entry)
- Public draw audit page — any visitor can verify draw outcome against NIST beacon
- Platform fee: 5% of prize pool (hardcoded); payout rate: 95% (hardcoded)

## Out of Scope

- Jurisdiction auto-enablement — human legal review required for each new region
- Sports betting, casino games, or any game of skill
- Crypto / blockchain payments (Chainlink VRF mentioned for reference only — NIST beacon is primary)
- Anonymous play (KYC required before any paid entry)
- Withdrawal to bank account (Stripe balance transfer only in MVP)
- Mobile native app
- Multi-language / internationalization in MVP

## Immutable Constraints

1. **Math.random() banned** — never used for any lottery logic; all randomness must come from NIST Randomness Beacon
2. **Payout rate hardcoded at 95%** — agents must never change this value
3. **Platform fee hardcoded at 5%** — agents must never change this value
4. **Draw records are append-only** — no DELETE or UPDATE on draw or payout records; SQLite triggers enforce this
5. **KYC before paid entry** — no code path allows a non-KYC'd user to join a paid pool
6. **Age gate hardcoded at 18+** — agents must never lower or remove age verification
7. **Jurisdiction compliance is human-only** — agents must never automatically enable lottery operations in a new region
8. **Draw and payout logic protected** — `api/src/lottery/draw.service.ts` and `api/src/lottery/payout.service.ts` are off-limits to agent modification
9. **Protected paths are human-only** — `api/src/auth/`, `api/src/kyc/` are off-limits to agent modification
