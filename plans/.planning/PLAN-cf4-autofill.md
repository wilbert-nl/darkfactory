# PLAN: CF4Autofill
_Status: Draft — Resolve open questions before starting implementation_

> **For Claude in next session:** Read the open questions below and ask the user to resolve them one at a time before writing any code. Mark each resolved one with ✅.

## Overview
CF4Autofill automates the preparation of Philippine Bureau of Customs CF4 and informal entry forms. It saves importer/exporter profiles, auto-populates repeated fields, provides an AI HS code assistant, and exports PDF-ready documents for VASP submission. The opportunity is a confirmed gap: no commercial tool targets this specific workflow for the ~7,000 licensed customs brokers and the much larger population of SME importers in the Philippines. The stack is the founder's native NestJS + Vue + PostgreSQL — this is a fast build.

## Recommended Stack
- **Frontend:** Vue 3 + Quasar (web-first; brokers work on desktop; responsive for mobile check but not mobile-primary)
- **Backend:** NestJS + REST API
- **Database:** PostgreSQL (profiles, form entries, line items, HS code cache, collaboration sessions)
- **Auth:** Supabase Auth (email/password primary; Google OAuth optional; no social login friction for a B2B tool)
- **Payments:** Stripe (SaaS monthly/annual subscriptions; per-entry credit pack purchases)
- **AI:** Claude API — HS code classification from plain-text goods description, field validation against BOC requirements, error flag on likely misclassification or missing mandatory fields, broker review summary generation

## MVP Scope
- Importer/exporter profile builder (TIN, company name, CPRS number, address, contact)
- CF4/informal entry form with all BOC-required fields mapped; auto-populate from saved profile
- Line-item entry: goods description, HS code (manual + AI suggestion), quantity, value, country of origin
- Save, duplicate, and template past entries for repeat shipments
- PDF export formatted for BOC submission or VASP upload

## Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] Scaffold Vue 3 + Quasar + NestJS monorepo
- [ ] Set up PostgreSQL schema: users, organizations, importer profiles, form entries, line items
- [ ] Auth flow (email/password + Google OAuth)
- [ ] Importer/exporter profile CRUD (all BOC-required fields: TIN, company name, CPRS, address)
- [ ] CF4 form template with field mapping (map all current BOC CF4 fields to database columns)

### Phase 2 — Core Features (Week 3–5)
- [ ] Auto-populate profile data into new CF4 form on creation
- [ ] Line-item entry UI: goods description input, quantity, value, country of origin, currency
- [ ] AI HS code assistant via Claude API: plain-text goods description → top 3 HS code suggestions with confidence and notes
- [ ] HS code validation: flag codes with common classification errors or BOC penalty history
- [ ] Save and duplicate past entries; save entry as reusable template
- [ ] PDF export via Puppeteer or pdf-lib (formatted to match BOC CF4 layout)
- [ ] Subscription paywall via Stripe (per-entry credit deduction or monthly plan)

### Phase 3 — Launch Prep (Week 6–8)
- [ ] Broker-client collaboration: importer fills shipper + goods details; broker reviews, edits, and approves before export
- [ ] Role-based access: "importer" role (fill, view own entries) vs "broker" role (review, edit, approve all client entries)
- [ ] Informal entry (IE) form support alongside CF4 (two most common BOC form types)
- [ ] BOC field validation rules engine: flag missing mandatory fields, invalid TIN format, value thresholds requiring formal entry
- [ ] VASP-specific export formatting (Intercommerce and TradeNet have specific upload CSV formats — add as optional export)
- [ ] Go-to-market: outreach to customs broker Facebook groups, PH Customs Brokers Board (CBCP) community, freight forwarder associations

## Open Questions ❓
> Resolve these before implementation. Ask one at a time.

- [ ] ❓ **Form scope at launch:** CF4 only (most common), or CF4 + Informal Entry form together in MVP? Adding IE doubles the form mapping work but increases addressable users
- [ ] ❓ **Pricing model priority:** Monthly SaaS subscription ($15–30/mo) vs per-entry credits (₱50–100/entry) vs both? Credits suit casual SME importers; subscriptions suit active brokers
- [ ] ❓ **Broker-client collaboration in MVP:** Is the importer-fills / broker-reviews handoff a launch feature (key differentiator) or a Phase 2 add?
- [ ] ❓ **BOC form currency:** Have the current CF4 field requirements been verified against the latest BOC circular? Form revisions can invalidate the field mapping — who maintains this ongoing?
- [ ] ❓ **VASP export formatting:** Is CSV export for Intercommerce/TradeNet upload in scope for MVP, or PDF-only to keep scope clean?
- [ ] ❓ **Target market entry point:** Lead with customs brokers (7,000 licensed, professional, higher willingness to pay) or SME importers (much larger market, lower ARPU, more price-sensitive)?

## Top Risks
1. **BOC form revision risk** — BOC updates CF4 field requirements periodically; an outdated form template creates compliance errors for users; mitigation: document a form maintenance process before launch; consider a quarterly BOC review cycle as part of operations; position the app as "preparation aid" in all copy so liability stays with the licensed broker
2. **Broker trust and adoption** — Customs brokers are conservative professionals who rely on established VASPs; a new tool from an unknown vendor faces credibility barriers; mitigation: recruit 5–10 beta brokers from CBCP community before launch for case studies and testimonials; offer 3-month free Pro access in exchange for feedback and public endorsement

## Dark Factory Readiness
**Ready:** Yes
**Notes:** Form builder + PDF export + AI HS code lookup is a well-defined CRUD scope on the founder's native stack. Factory needs: (1) confirmed CF4 form field mapping document (the actual current BOC CF4 form fields, sourced by the founder), (2) confirmed form scope (CF4 only or CF4 + IE), and (3) Stripe account credentials. No legal filing risk if all copy positions the tool as preparation aid only.
