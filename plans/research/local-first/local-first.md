# LocalFirst — Research Brief

## What It Is
A suite of privacy-first utility apps (notes, tasks, budget tracker) where all data lives on the user's device by default — with an optional paid tier for zero-knowledge end-to-end encrypted cloud sync and multi-device access, and no account required for the free tier.

## Competitors
| Name | Description |
|------|-------------|
| Obsidian | Local-first notes; 1M+ users; gold standard for local-first credibility; $4/mo sync |
| Standard Notes | E2E encrypted notes; no-account free tier; $90/yr extended; strong privacy community |
| Actual Budget | Local-first finance; $4/mo sync; open-source; growing privacy-first finance community |
| Super Productivity | Open-source local-first task + time tracker; free; self-hosted; no paid tier |
| Joplin | Open-source encrypted notes; self-hosted sync option; strong but fragmented UX |

## Market Size
No single market size for "local-first software" but signals are strong: Obsidian reached 1M+ users with minimal marketing; SafeNote achieved 45% user base growth in 6 months (2024–2025); modern browsers now support gigabyte-scale IndexedDB making web-based local-first viable at scale. GDPR awareness has created a premium privacy buyer segment willing to pay for provable data sovereignty. Cloud fatigue is a growing macro trend with measurable user migration from SaaS to local-first tools.

## MVP Features
1. Core utility module (pick one for v1: notes, tasks, or budget tracker) — fully offline, zero account required
2. Local IndexedDB/SQLite storage with "your data stays here" onboarding screen and explainer
3. One-click full data export to JSON and CSV at any time
4. Optional E2E encrypted cloud backup (zero-knowledge — server sees only ciphertext)
5. Multi-device sync via encrypted relay (paid tier only)
6. Transparent privacy page with real-time audit log and delete-all-data button
7. Open-source encryption layer published on GitHub for community audit

## Differentiators
1. "No account, ever" for the free tier — genuinely rare; most competitors still require an email to start; this is a trust signal no marketing campaign can replicate
2. Open-source encryption layer — publishing the crypto implementation on GitHub builds credibility that marketing cannot; privacy community evangelizes products that can be audited
3. Bundle strategy — 3–5 utilities under one subscription vs per-app pricing; higher perceived value, lower churn

## Profitability
**Model:** Free (no account, local only) → Premium $3–5/mo or $29/yr (E2E sync + multi-device) → Lifetime $49 (converts well in privacy communities) → Enterprise self-hosting license $500–2K/yr
**Estimate:** 3K users × $3.50/mo avg = $10.5K MRR / $126K ARR. Privacy community word-of-mouth reduces CAC significantly. Lifetime deals at launch generate upfront cash for runway.

## Build Ease: 3/5
AI contributes smart content suggestions, natural language queries over local data ("show all notes mentioning budget"), and privacy policy generation from app behavior. Hard parts: implementing correct zero-knowledge E2E encryption (use libsodium or Signal Protocol — never build custom crypto), and sync conflict resolution (use Automerge, Yjs, or ElectricSQL CRDTs — clock-based merging is not sufficient).

## Legal Risks
- False advertising — "completely private" claims must be technically accurate; if any telemetry or analytics runs, disclose it explicitly; privacy community is unforgiving about this
- Export controls — strong encryption (AES-256, RSA-2048+) is subject to export regulations in some jurisdictions; check Wassenaar Arrangement compliance for target markets
- Data loss liability — storing user data locally means device failure loses data; must disclaim this clearly in free tier and recommend backup; do not imply the free tier is safe for irreplaceable data
- GDPR processor obligations — minimal by design (no user data on servers in free tier); paid tier server relay must be GDPR-compliant with a DPA and privacy-preserving logs
