# Dunning & Subscription Recovery SaaS

## Overview

A payment failure recovery platform for subscription businesses. When a credit card declines, the platform automatically retries on optimal schedules, sends multi-channel recovery sequences (email, SMS, in-app), and recovers revenue that would otherwise churn silently.

**Category:** B2B SaaS / FinTech  
**Target:** SaaS companies and subscription box businesses doing $5K–$500K MRR  
**Effort to Build:** Medium (4–8 weeks solo with AI-assisted dev)  
**Pricing Model:** % of recovered revenue (2–5%) + flat base ($49–$149/mo)

---

## Why Now

- Failed payments cost subscription businesses **$118.5B/year** globally
- Average SaaS loses **9% of MRR** to involuntary churn from declined cards
- Top dunning platforms recover **60–80%** of failed payments vs 20–30% for naive retry logic
- Growing subscription economy means more businesses with this exact problem
- AI-powered retry scheduling (picking optimal times per card issuer patterns) is not yet commoditized

---

## Market Size

- Subscription commerce market: $900B+ by 2026
- Even recovering 1% extra of failed payments at 2% fee = huge LTV
- TAM focused on SMB SaaS founders: ~250K companies globally

---

## Competitors

| Player | Strength | Weakness |
|---|---|---|
| **Churn Buster** | 10+ years experience, deep eComm + B2B focus | Expensive, targets larger companies |
| **ChurnKey** | Cancellation flows + dunning combo | Overkill for small SaaS |
| **Paddle Retain** (ex-ProfitWell) | Native Paddle integration | Dev slowed post-acquisition, outdated UI |
| **Baremetrics Recover** | Tight MRR/LTV analytics tie-in | Only for Baremetrics customers |
| **Rechurn / Redux** | B2C dunning for consumer subscriptions | Narrow use case |

---

## Edge / Differentiation

1. **Vertical-specific templates** — pre-built recovery sequences tuned for SaaS, subscription boxes, and digital memberships (different tone, timing, messaging)
2. **AI retry scheduling** — use card BIN data + time-of-day patterns to maximize retry success without burning customer goodwill
3. **Stripe-native one-click setup** — zero-config onboarding in under 5 minutes for Stripe users (largest segment)
4. **Affordable entry tier** — flat $29/mo with % of recovered revenue, accessible for $5K–$50K MRR companies that ChurnBuster ignores
5. **Churn reason capture** — lightweight exit survey on cancellation that feeds back into AI retry decisions

---

## Go-to-Market

- **Channel:** Indie hacker communities (Indie Hackers, Hacker News, Product Hunt), Stripe marketplace listing
- **Cold outreach:** Founders whose SaaS tools you use — they have the exact problem
- **Content:** Write about "how we recovered $X in failed payments" — SEO goldmine
- **Partner:** Integrate with Baremetrics, ChartMogul, Stripe billing as 1-click install

---

## Tech Stack (Dark Factory Fit)

- NestJS backend + PostgreSQL
- Stripe Webhook integration (payment event ingestion)
- Background jobs for retry scheduling (Bull/BullMQ)
- Postmark / Resend for transactional emails
- Twilio for SMS recovery sequences
- Vue 3 + Quasar dashboard

---

## Revenue Potential

- 100 customers at avg $89/mo = **$8,900 MRR** within 12 months
- % of recovered revenue adds upside — a customer recovering $10K/mo pays $200–500 extra
- Realistic 18-month target: **$15K–$25K MRR** for solo founder

---

## Risks

- Stripe may add native retry improvements (already has Smart Retries)
- Requires trust from customers handling their billing data
- Churn rate of the tool itself if businesses pause subscriptions

---

## Verdict

**High confidence.** Clear pain, proven market, existing competitors validate demand but all target $50K+ MRR. A well-priced, Stripe-native tool for indie SaaS founders has no direct competition today.
