# ESG & Sustainability Reporting SaaS for SMBs

## Overview

A lightweight ESG (Environmental, Social, Governance) reporting tool built specifically for small and medium businesses under 200 employees. Collects data via simple forms and integrations (utility bills, logistics APIs, HR data), generates compliant reports (GRI, CSRD, CDP), and provides a public sustainability page companies can share with clients and investors.

**Category:** Vertical SaaS / Compliance  
**Target:** SMBs 10–200 employees in the EU and US that face supplier ESG questionnaires or want a sustainability badge  
**Effort to Build:** Medium (6–10 weeks solo)  
**Pricing Model:** $99–$299/mo subscription

---

## Why Now

- **EU CSRD regulation** (Corporate Sustainability Reporting Directive) requires SMBs in the EU supply chain to report ESG data starting 2026
- Large enterprises are pushing ESG questionnaires down to their suppliers — SMBs are getting these forms and have no tools to answer them
- Enterprise ESG tools (Workiva, IBM Envizi) cost $10K–$60K/year — SMBs are completely priced out
- GDPR showed that EU compliance requirements create $100M+ SaaS businesses (Cookiebot, OneTrust)
- Carbon footprint tracking is becoming table stakes for B2B vendor selection

---

## Market Size

- 25M SMBs in the EU; ~5M face CSRD supply chain requirements by 2026
- Even 0.01% adoption at $199/mo = **$9.95M ARR**
- ESG software market: $1.6B in 2024, projected $9.2B by 2030

---

## Competitors

| Player | Strength | Weakness |
|---|---|---|
| **Workiva** | Industry standard for enterprise | $20K–$60K/year, enterprise sales cycle |
| **IBM Envizi** | Deep analytics, global standards | Fortune 500 only |
| **Greenly** | SMB-friendly, carbon focus | Still €500–€2K/mo, France-centric |
| **Sustain.Life** | US SMB focus, simple UI | Limited reporting standards |
| **Normative** | Science-based targets | Complex, consultant-led |
| **Sweep** | Clean design, mid-market | $500+/mo, sales-led |

---

## Edge / Differentiation

1. **"Supplier ESG pack" positioning** — not "be sustainable," but "answer your client's ESG questionnaire in 30 minutes" — immediately actionable
2. **Questionnaire auto-fill** — upload a client's ESG questionnaire PDF, AI maps your data to their questions and fills it automatically
3. **Public sustainability page** — shareable URL (like a Linktree for ESG) companies attach to RFPs and procurement emails
4. **EU CSRD compliance templates** — pre-built CSRD Annex II forms with plain-English guidance
5. **Flat SMB pricing** — $149/mo flat, no per-user seats, no "contact sales"
6. **Utility bill OCR** — email utility PDFs to a dedicated inbox, AI extracts kWh/gas/water data automatically

---

## Go-to-Market

- **Channel:** LinkedIn (procurement officers, sustainability managers at SMBs), EU startup communities
- **SEO:** "CSRD compliance for small business" — extremely high intent, low competition
- **Partner channel:** Accountants and business consultants are fielding CSRD questions from their SMB clients — build a reseller program
- **Direct:** Cold email to SMBs in manufacturing, logistics, retail who are in large company supply chains

---

## Tech Stack (Dark Factory Fit)

- NestJS + PostgreSQL backend
- Vue 3 + Quasar for dashboard and public report page
- PDF parsing for utility bills and uploaded questionnaires (pdfplumber / GPT-4 Vision)
- GPT-4o for questionnaire auto-fill logic
- WeasyPrint for PDF report generation
- Email-to-data pipeline (Resend inbound email + Webhook)

---

## Revenue Potential

- 100 customers at $149/mo = **$14,900 MRR**
- Annual contracts common for compliance tools (reduces churn)
- Realistic 18-month target: **$15K–$30K MRR** with EU SMB focus

---

## Risks

- ESG standards are complex and change — requires ongoing maintenance as regulations evolve
- Long sales cycle — compliance purchases can take months even for SMBs
- Risk of being "good enough for now" until enterprise tools lower their prices
- Needs credibility — a compliance tool needs to look trustworthy

---

## Verdict

**High confidence, EU-first play.** CSRD is a forcing function — SMBs MUST comply or lose contracts. No affordable tool exists for this segment today. Start with CSRD in the EU, prove product-market fit, then expand to US (SEC climate disclosure rules) and other standards.
