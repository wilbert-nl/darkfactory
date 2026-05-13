# PLAN: CompareTable
_Status: Draft — Resolve open questions before starting implementation_

> **For Claude in next session:** Read the open questions below and ask the user to resolve them one at a time before writing any code. Mark each resolved one with ✅.

## Overview
CompareTable is a web app for structured decision-making: add items, define criteria, score each, weight the criteria, and get a ranked result. The gap is the space between a blank spreadsheet (too hard) and opinionated review sites (too rigid). AI-assisted criteria generation and use-case templates eliminate blank-slate friction and make the tool instantly useful to a casual user. This is among the fastest builds in the idea set.

## Recommended Stack
- **Frontend:** Vue 3 + Quasar (web-first; PWA for mobile use; no native app needed)
- **Backend:** NestJS + REST API
- **Database:** PostgreSQL (users, comparison tables, criteria, scores, sharing tokens)
- **Auth:** Supabase Auth (email + Google OAuth; guest session with local save before sign-up prompt)
- **Payments:** Stripe (subscription billing for Pro and B2B tiers; Stripe Customer Portal for self-serve management)
- **AI:** Claude API — criteria suggestion from comparison type description, auto-weight suggestions, plain-language summary of ranking result ("Based on your scores, Option A wins primarily due to salary and growth potential")

## MVP Scope
- Create comparison table: add items (rows) and criteria (columns), score each cell (1–10 or star rating)
- Set weight per criterion; auto-calculate weighted total score; sort items by score
- AI criteria suggestion: type "comparing job offers" → Claude suggests salary, growth, culture, commute, benefits
- Save and name multiple comparisons; duplicate past comparison as template
- Export to PDF; share via public read-only link

## Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] Scaffold Vue 3 + Quasar + NestJS project monorepo
- [ ] Set up PostgreSQL schema: users, comparisons, criteria, items, scores
- [ ] Auth flow with Supabase (email + Google OAuth + guest session)
- [ ] Core CRUD API: create/read/update/delete comparisons, criteria, items, scores
- [ ] Basic comparison table UI (editable grid with inline scoring)

### Phase 2 — Core Features (Week 3–5)
- [ ] Criterion weighting UI with live weighted score recalculation
- [ ] Sort and rank items by total weighted score
- [ ] AI criteria suggestion via Claude API (input: comparison type → output: suggested criteria list)
- [ ] Use-case templates: job offers, gadgets, apartments, diet plans, travel destinations
- [ ] Save comparison, duplicate as template, rename
- [ ] Public share link (read-only view, no auth required)
- [ ] Pro subscription gate via Stripe (limit free tier to 3 saved comparisons)

### Phase 3 — Launch Prep (Week 6–8)
- [ ] Collaborative co-scoring (invite collaborator by email; both score independently; see averaged result)
- [ ] PDF export with branded layout
- [ ] AI result summary ("Here's why Option A ranks first based on your weights")
- [ ] SEO-optimized landing pages for high-volume queries ("job offer comparison tool," "apartment comparison spreadsheet")
- [ ] Affiliate link integration for product comparison tables (FTC disclosure built in)
- [ ] B2B team plan (shared workspace, team comparisons, admin seat management)

## Open Questions ❓
> Resolve these before implementation. Ask one at a time.

- [ ] ❓ **Free tier limit:** Is 3 saved comparisons the right free limit, or should free users get unlimited comparisons with Pro unlocking collaboration, export, and AI?
- [ ] ❓ **Target market:** Consumer-first (individuals making personal decisions) or B2B-first (HR, procurement, product teams)? This affects onboarding copy and template selection
- [ ] ❓ **Scoring scale:** 1–10 numeric, 1–5 star rating, or let users choose per comparison? Simpler is better for casual users
- [ ] ❓ **Collaboration in MVP:** Is real-time co-scoring a launch feature or a post-launch Pro add?
- [ ] ❓ **SEO / affiliate strategy:** Is ranking for "compare X vs Y" queries and monetizing via affiliate links a day-1 strategy or something to layer on post-traction?
- [ ] ❓ **Mobile experience:** Responsive PWA sufficient, or is a dedicated Capacitor mobile app needed for the use cases you envision?

## Top Risks
1. **Spreadsheet habit stickiness** — Power users default to Excel/Google Sheets for comparison matrices; mitigation: win on time-to-result (AI criteria generation + templates get a working comparison in 30 seconds vs 5 minutes in a spreadsheet)
2. **SEO content gap** — "Compare X vs Y" queries are dominated by established review sites; mitigation: focus SEO on "decision matrix tool" and use-case-specific queries ("job offer comparison template") where intent is tool-seeking, not product-specific

## Dark Factory Readiness
**Ready:** Yes
**Notes:** Pure web CRUD app with AI criteria suggestion. Stack is the founder's native NestJS + Vue + PostgreSQL. Factory needs: confirmed free tier limit definition, confirmed scoring scale (1–10 vs stars), and Stripe account credentials before payment integration. No legal or infrastructure complexity.
