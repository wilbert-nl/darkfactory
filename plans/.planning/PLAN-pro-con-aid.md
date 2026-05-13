# PLAN: ProConAid
_Status: Draft — Resolve open questions before starting implementation_

> **For Claude in next session:** Read the open questions below and ask the user to resolve them one at a time before writing any code. Mark each resolved one with ✅.

## Overview
ProConAid is a weighted decision-making tool where users define options, assign importance weights to criteria, score each option, and receive a ranked recommendation. The AI Devil's Advocate mode flags overlooked factors and cognitive biases. This is the highest-leverage idea in the set: pure CRUD plus Claude API, no regulated data, no complex integrations, and the only competition is an unmonetized free tool (Genvalo). Build time estimate: 4–6 weeks to a shippable MVP.

## Recommended Stack
- **Frontend:** Vue 3 + Quasar (web-first PWA; mobile-responsive by default)
- **Backend:** NestJS + REST API
- **Database:** PostgreSQL (decisions, criteria, options, scores, outcome journal entries)
- **Auth:** Supabase Auth (email/password + Google OAuth; anonymous sessions for free tier)
- **Payments:** Stripe (subscription billing for Pro and Team tiers)
- **AI:** Claude API — Devil's Advocate analysis, bias detection, decision summary report generation, collaborative session facilitation

## MVP Scope
- Decision canvas: create a decision with named options and weighted criteria
- Scoring grid with live weighted score calculation and bar chart leaderboard
- AI Devil's Advocate mode: one-click analysis that flags overlooked criteria and biases
- Shareable read-only link for the decision report
- PDF export of the full decision with scores, weights, and AI commentary
- Decision history for registered users (free: 5 saved; Pro: unlimited)

## Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] Set up NestJS + PostgreSQL; migrate schema: decisions, options, criteria, scores, users
- [ ] Implement auth with anonymous session support (no-account free tier via localStorage)
- [ ] Stripe subscription setup: Free, Pro ($6/mo), Team ($20/mo/seat)
- [ ] Scaffold Vue 3 + Quasar frontend with decision canvas layout

### Phase 2 — Core Features (Week 3–4)
- [ ] Decision canvas: add/edit/reorder options and criteria
- [ ] Weight sliders (1–10) per criterion with real-time score recalculation
- [ ] Scoring grid: rate each option × criterion; auto-calculate weighted totals
- [ ] Bar chart leaderboard showing ranked options (use Chart.js or ECharts)
- [ ] Claude API integration: Devil's Advocate mode (analyze scores, detect bias, suggest missing criteria)
- [ ] Shareable read-only link (public token per decision)
- [ ] PDF export via Puppeteer (decision title, options, criteria weights, scores, AI commentary)

### Phase 3 — Launch Prep (Week 5–6)
- [ ] Decision history panel (list + open past decisions; enforce 5-decision limit on free tier)
- [ ] Outcome journal: "How did this decision turn out?" prompt 90 days later
- [ ] Collaborative anonymous scoring: invite teammates via link; scores hidden until all submit
- [ ] B2B embed/API interest page (lead capture for HR/coaching platform licensing)
- [ ] Legal pages: advice disclaimer, Privacy Policy, Terms of Service
- [ ] Launch on Product Hunt, Hacker News Show HN, r/productivity, r/DecisionTheory

## Open Questions ❓
> Resolve these before implementation. Ask one at a time.

- [ ] ❓ **Free tier gating:** 5 saved decisions limit, or time-based trial (14 days full access then paywall)?
- [ ] ❓ **Collaborative scoring:** Include anonymous team scoring in MVP, or defer to v2 after solo use is validated?
- [ ] ❓ **B2B licensing channel:** Pursue B2B HR/coaching API licensing from day 1, or focus on consumer growth first and add B2B as a second phase?
- [ ] ❓ **Devil's Advocate depth:** Single Claude API call for analysis, or multi-turn conversation where the user can challenge the AI's points?
- [ ] ❓ **Outcome journal:** Active 90-day follow-up email prompts (requires email collection), or passive in-app prompt only?

## Top Risks
1. **Conversion from free to paid** — decision tools have high casual use but low perceived urgency to pay; mitigation: enforce the 5-decision limit clearly, show value via AI commentary on the first decision, and offer a Team tier to give B2B a reason to purchase before consumer monetization matures
2. **ChatGPT as a substitute** — users may ask ChatGPT to "help me decide between X and Y" instead; mitigation: the structured history, outcome journal, shareable reports, and collaborative scoring are features ChatGPT cannot replicate; emphasize the record-keeping and accountability angle

## Dark Factory Readiness
**Ready:** Yes
**Notes:** Pure CRUD + Claude API with no regulated data or complex integrations. Decision schema, scoring logic, PDF export, and Stripe subscription are all straightforward factory tasks. Resolve the free-tier gating and collaborative scoring questions before handing off so the factory doesn't need to revisit auth and schema mid-build.
