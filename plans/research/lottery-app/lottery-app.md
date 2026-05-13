# LotteryApp — Research Brief

## What It Is
A transparent online lottery platform where participants pool entry fees and the winner automatically receives 95% of the pool — differentiated by cryptographically verifiable fairness and a better payout ratio than state lotteries.

## Competitors
| Name | Description |
|------|-------------|
| Jackpot.com | Licensed online lottery ticket courier operating in multiple US states |
| Lottoland | Europe-based; bets on official lottery outcomes; holds multiple betting licenses |
| Pools.finance / crypto pools | Blockchain lottery pools via smart contracts; legally grey in most jurisdictions |
| YottaBank | Prize-linked savings account; skirted gambling law by using a banking product frame |

## Market Size
European lottery market at $118.75B in 2024, 6.5% CAGR. Global lottery approximately $300B+ annually. Online lottery is the fastest-growing sub-segment at 12–15% CAGR. Strong crypto audience appetite for transparent provably-fair mechanics: PoolTogether reached $200M+ TVL at peak, validating consumer demand for fairer lottery alternatives.

## MVP Features
1. User wallet and account creation with KYC identity verification
2. Create or join a lottery pool (fixed entry fee, defined draw date)
3. Transparent draw mechanism using Chainlink VRF or NIST randomness beacon
4. Automated winner payout: 95% of pool to winner, 5% platform fee
5. Draw history with cryptographic proof of fairness for each past draw
6. Referral system and pool sharing links
7. Responsible gambling controls: deposit limits and self-exclusion

## Differentiators
1. 95% payout vs state lottery 50–60% payout — better player value is the primary feature
2. Verifiable cryptographic fairness: not just claimed fairness but on-chain or beacon-backed proof any user can verify
3. Community pools: friend groups can create private lottery pools with custom entry fees and draw dates

## Profitability
**Model:** 5% rake on each pool.
**Estimate:** $10M monthly pool volume = $500K/mo or $6M ARR. The 5% take rate is thin compared to state lotteries (40–50%) but that margin is deliberately the competitive edge on player value.

## Build Ease: 2/5
The technical build is straightforward. Non-technical barriers are the entire problem: gambling licenses are required in every jurisdiction, most mainstream payment processors refuse gambling merchants without a license, KYC/AML integration is expensive and gatekept, and banking requires specialist processors such as Nuvei or PaySafe. Budget $50K–200K in legal and licensing fees before any line of code can generate revenue.

## Legal Risks
- HIGHEST RISK IDEA. Gambling licenses are mandatory in every jurisdiction where users play — not optional
- US: online lottery is legal in only approximately 10 states; each requires a separate state gaming commission license; Federal Wire Act may also apply
- EU: each member state has its own licensing regime; France, Germany, and Italy restrict private lottery operators and operating without a local license is a criminal offense
- Stripe, PayPal, and most card processors refuse gambling merchants without a valid license — merchant account setup is a standalone blocker
- AML and KYC mandatory everywhere; expensive to implement and maintain
- Possible mitigation: structure as a "sweepstakes" (no purchase necessary mechanic) to sidestep gambling law, but this significantly changes the business model
