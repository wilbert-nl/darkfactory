# PLAN: LotteryApp
_Status: Draft — Resolve open questions before starting implementation_

> **For Claude in next session:** Read the open questions below and ask the user to resolve them one at a time before writing any code. Mark each resolved one with ✅.

## Overview
LotteryApp is a transparent online lottery platform where participants pool entry fees and the winner automatically receives 95% — differentiated by provably fair cryptographic draws and a far better payout ratio than state lotteries (95% vs 50–60%). The opportunity mirrors what PoolTogether proved with crypto ($200M+ TVL): users will move to fairer alternatives if trust and access problems are solved. The core challenge is not the build — it is the legal and payment infrastructure required before any code can accept money.

## Recommended Stack
- **Frontend:** Vue 3 + Quasar (SPA with pool browser, wallet/account dashboard, draw history with proof viewer)
- **Backend:** NestJS (REST API, automated payout job, draw execution scheduler)
- **Database:** PostgreSQL (user accounts, pool records, entry records, payout history) + Redis (session management, rate limiting)
- **Auth:** Email + password with MFA; full KYC via Jumio or Onfido (mandatory for gambling compliance)
- **Payments:** Nuvei or PaySafe (specialist gambling-licensed payment processors; Stripe/PayPal are not viable)
- **AI:** Claude API for responsible gambling risk scoring, customer support chatbot, and fraud detection narrative summaries; Chainlink VRF or NIST randomness beacon for verifiable draw randomness

## MVP Scope
- User account creation with full KYC identity verification
- Create or join a lottery pool (entry fee, draw date, max participants)
- Transparent draw using Chainlink VRF or NIST beacon with cryptographic proof stored per draw
- Automated winner payout: 95% to winner, 5% platform fee
- Draw history page with verifiable proof for each past draw

## Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] Scaffold NestJS project with PostgreSQL schema (users, pools, entries, draws, payouts)
- [ ] Integrate KYC provider (Jumio or Onfido) for identity verification flow
- [ ] Implement Chainlink VRF or NIST randomness beacon integration for draw execution
- [ ] Build pool creation and entry logic with entry fee locking
- [ ] Scaffold Vue 3 + Quasar pool browser and entry confirmation flow

### Phase 2 — Core Features (Week 3–5)
- [ ] Automated draw scheduler: execute draw at defined draw date, record cryptographic proof
- [ ] Automated payout job: 95% to winner wallet, 5% to platform, with retry and audit log
- [ ] Draw history page with expandable cryptographic proof for each draw
- [ ] Referral system and pool sharing links
- [ ] Responsible gambling controls: deposit limits, cooling-off periods, self-exclusion

### Phase 3 — Launch Prep (Week 6–8)
- [ ] Gambling-licensed payment processor integration (Nuvei or PaySafe — requires license first)
- [ ] AML transaction monitoring integration
- [ ] Responsible gambling certification and self-exclusion register integration (GamStop or equivalent)
- [ ] Regulatory submission and compliance review per target jurisdiction
- [ ] Legal entity setup in chosen jurisdiction with gambling license application filed

## Open Questions ❓
> Resolve these before implementation. Ask one at a time.

- [ ] ❓ **Jurisdiction strategy:** Which jurisdiction will the platform be licensed in first — Malta (MGA), Curaçao (low barrier, lower trust), or a specific US state? This is the single most important decision before any work begins.
- [ ] ❓ **Legal structure:** Sweepstakes model (no purchase necessary, sidestep gambling law) or licensed gambling operator? These are fundamentally different products with different economics.
- [ ] ❓ **Crypto or fiat:** Fiat-only (requires gambling payment processor), crypto-only (PoolTogether model, different regulatory treatment), or both?
- [ ] ❓ **Budget for legal and licensing:** Have you allocated the $50K–200K needed for gambling license applications and ongoing compliance before writing code?
- [ ] ❓ **Target user base:** General public lottery players, or crypto-native users who already understand provably fair mechanics?
- [ ] ❓ **Private pools:** Community or friend-group private lottery pools as a day-1 feature (lower regulatory risk, private use), or public open pools only?

## Top Risks
1. **No license = no product:** Operating a lottery without a license is a criminal offense in most jurisdictions. Mitigation: do not launch any version that accepts real money until a valid gambling license is in place — no beta, no "invite only" workarounds.
2. **Payment processor refusal:** Stripe, PayPal, and most standard processors will terminate accounts immediately for gambling. Mitigation: secure a gambling-specialist processor (Nuvei, PaySafe) as part of the pre-launch checklist; this requires the gambling license first.

## Dark Factory Readiness
**Ready:** No
**Notes:** Do not start implementation until: (1) a jurisdiction for licensing is chosen, (2) legal counsel specializing in gambling regulation is engaged, (3) a gambling-licensed payment processor has confirmed they will onboard this business, and (4) the legal structure (licensed operator vs sweepstakes model) is decided. All of these are prerequisites to writing a single line of production code.
