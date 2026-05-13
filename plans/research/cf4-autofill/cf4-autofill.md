# CF4Autofill — Research Brief

## What It Is
A web-based form preparation tool for Philippine customs clearance (CF4 and informal entry forms). Saves importer/exporter profiles, auto-populates repeated fields on new entries, includes an AI-powered HS code assistant, and exports PDF-ready documents for BOC submission via VASP.

## Competitors
| Name | Description |
|------|-------------|
| BOC e2m / VASP portals (Intercommerce, TradeNet) | Official government lodgment system; requires full accreditation; not user-friendly for repeat filers |
| Xtracta / Sphere | Global customs automation tools; enterprise-focused, expensive, not PH-specific |
| DHL / FedEx internal tools | Proprietary systems for their own freight; SME importers have no equivalent |
| DocHub / generic PDF fillers | Users currently fill CF4 manually in PDF tools or by hand; no intelligent profile-based autofill |

## Market Size
Philippines is a top 3 ASEAN import/export hub with ~$130B in annual trade (BSP data). BOC e2m processes millions of import entries per year. Approximately 7,000 licensed customs brokers operate nationwide (BOC records). Target users: customs brokers, freight forwarders, SME importers, balikbayan box shippers, e-commerce sellers, and small manufacturers. No commercial product specifically automates CF4/informal entry forms for the Philippine market — a confirmed gap.

## MVP Features
1. Importer/exporter profile builder (company name, TIN, CPRS accreditation number, address)
2. CF4/informal entry form template with complete field mapping
3. Auto-populate saved profile data into form fields on every new entry
4. Line-item entry for goods (HS code lookup, quantity, value, country of origin)
5. Save and duplicate past entries as templates for repeat shipments
6. Export as PDF ready for BOC submission or VASP upload

## Differentiators
1. Philippines-only focus — global tools do not know CF4 field requirements; a locally hyper-specific tool wins on accuracy and trust with brokers who deal with incorrect field mapping daily
2. AI HS code assistant — user describes goods in plain language and AI suggests the correct HS code while flagging common classification errors that trigger BOC penalties
3. Broker-client collaboration — importer fills basic shipper details, customs broker reviews and finalizes; no current tool enables this handoff cleanly

## Profitability
**Model:** SaaS subscription at $15–30/mo per user for customs brokers; $10/mo for small importers. Per-entry credit option for casual users at ₱50–100 per autofilled form (~$1–2 USD). Partnership track with VASPs (Intercommerce, TradeNet) for referral fees or white-label integration.

**Estimate:** 500 paying users × $20/mo = $120K ARR. At 2,000 users (still well within the ~7,000 licensed broker community) = $480K ARR.

## Build Ease: 4/5
Form-filling web app is largely CRUD data entry — fast to scaffold with NestJS + Vue + PostgreSQL. AI handles HS code classification from plain-text goods descriptions, field validation against BOC requirements, and error checking for missing fields or invalid TINs. Main challenge: staying current with BOC form revisions requires ongoing maintenance; initial build is fast but compliance upkeep is a long-term cost.

## Legal Risks
- Regulatory accuracy liability — incorrect HS codes or undervalued declarations result in fines or seizure for the importer; tool must disclaim it aids preparation only, with final compliance responsibility resting with the licensed customs broker
- Accreditation requirements — only accredited customs brokers can officially file import entries under Philippine law; tool must be positioned as a "preparation aid," never a "filing tool"
- Philippine Data Privacy Act (RA 10173) — importer TINs, BIR registrations, and commercial invoices are sensitive business data; full DPA compliance required
- VASP integration risk — direct API connection to BOC e2m requires VASP accreditation (expensive); MVP must focus on PDF export, not direct lodgment
