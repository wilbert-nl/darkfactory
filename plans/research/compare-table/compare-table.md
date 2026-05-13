# CompareTable — Research Brief

## What It Is
A multi-item comparison tool where users add items, define criteria, score each item, and get a sortable, weighted comparison table. Use cases span diet plans, gadgets, job offers, apartments, travel destinations, and any other structured decision.

## Competitors
| Name | Description |
|------|-------------|
| Versus.com | Tech-focused product comparison site; millions of monthly visitors; rigid categories, no user-defined criteria |
| Slant.co | Community-driven comparison for software/tech; user-added pros/cons but no quantitative scoring matrix |
| Untools Decision Matrix | Free web tool; functional but bare-bones; no saving or sharing |
| DecTrack / Creately | Template-based decision matrix makers; spreadsheet-like setup; no consumer UX polish |

## Market Size
No dedicated "comparison table app" market category exists — confirmed underserved whitespace between spreadsheets and opinionated review sites. Decision matrix templates sell on Etsy ("Job Offer Comparison Matrix" templates show organic consumer demand). Notion/Coda comparison table templates see significant use, signaling embedded demand. Search volume for "compare job offers template," "decision matrix tool," and "compare diet plans" is consistent with no clear app-based destination capturing it.

## MVP Features
1. Create comparison table with items as rows and criteria as columns
2. Score each item per criterion (numeric or star rating)
3. Set weights per criterion (e.g., salary matters 2x more than commute)
4. Auto-calculate weighted score and sort/rank items
5. Save and name multiple comparison projects
6. Export to PDF or share via public link

## Differentiators
1. AI-assisted criteria generation — user types "comparing job offers" and AI suggests relevant criteria (salary, growth, culture, commute, benefits), eliminating blank-slate friction
2. Use-case templates — pre-built for gadgets, diet plans, apartments, job offers, and travel destinations
3. Collaboration — share a comparison with a partner or colleague to co-score; no competitor does this well

## Profitability
**Model:** Freemium — 3 saved comparisons free; Pro at $4.99/mo or $29/yr (unlimited + collaboration + export). B2B team plans for HR, procurement, and product teams at $15–25/user/mo. SEO strategy: rank for "compare X vs Y" queries and place affiliate links on product comparisons.

**Estimate:** 20K Pro users × $29/yr = $580K ARR. 50 B2B teams × $500/mo = $300K ARR additional.

## Build Ease: 5/5
Pure CRUD web app with table and scoring logic — one of the simplest builds possible. AI generates schema, Vue components, scoring algorithms, and export logic quickly. Claude can power criteria suggestion as a built-in feature. NestJS + Vue + PostgreSQL stack can reach MVP in days. No complex infrastructure required.

## Legal Risks
- FTC affiliate disclosure required on any comparison that includes affiliate links to products
- Handle personal data in comparisons (salary, health info) with GDPR/CCPA consent flows
- Avoid presenting AI-generated criteria as professional advice (legal, medical, financial decisions)
