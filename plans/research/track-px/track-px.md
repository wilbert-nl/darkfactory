# TrackPx — Research Brief

## What It Is
TrackPx is a lightweight, offline-capable electronic health record (EHR) designed for small clinics, rural health posts, and emerging-market practices that lack reliable internet or cannot afford enterprise EHR pricing.

## Competitors
| Name | Description |
|------|-------------|
| Jane App | Cloud EHR, $54/mo, no offline mode, popular in Canada and Australia |
| SimplePractice | Mental health solo providers, $49–99/mo, cloud-only |
| DrChrono | Mobile-first iOS EHR, no true offline capability |
| OpenMRS | Open-source EHR for developing-world clinics, offline-capable but requires technical setup and self-hosting |
| Kareo / AdvancedMD | US-focused, $200–500+/mo, built for insurance billing, overkill for target market |

## Market Size
Global EHR market: $29.84B (2025) → $45.55B by 2035 (CAGR ~4.3%). Key niche signal: 60%+ of global clinics in emerging markets, rural areas, and small private practices lack reliable internet or cannot afford $200+/mo enterprise EHRs. OpenMRS has 5M+ patient records in 40+ countries yet remains technically inaccessible — no commercially polished offline-first lightweight EHR fills this gap. NGO and government clinic chain procurement adds B2B upside.

## MVP Features
1. Patient profile creation and search (local SQLite / IndexedDB, works fully offline)
2. Visit notes with customizable templates per specialty
3. Offline-first architecture with background sync when internet is available
4. Appointment scheduling with conflict detection
5. Basic medication tracking and prescription log
6. Data export to CSV and PDF for referrals and reporting

## Differentiators
1. True offline-first — full functionality on a $100 Android tablet with zero internet; sync happens opportunistically in the background
2. Country-specific compliance packs — configurable data fields for PH, Kenya, Indonesia with locale-specific required fields
3. Ultra-low pricing — $5–15/mo targets markets entirely priced out of Western EHRs; freemium tier for the smallest clinics

## Profitability
**Model:** Freemium (free up to 50 patients, paid $9–29/mo) + B2B white-label to NGOs and government clinic chains
**Estimate:** 1K clinics × $15/mo = $180K ARR. At 10K clinics = $1.8M ARR. Grant and partnership funding via WHO, Gates Foundation, USAID adds non-dilutive revenue runway for early growth.

## Build Ease: 3/5
The offline-first sync architecture (CouchDB/PouchDB or a custom conflict-resolution layer over SQLite) is the hard engineering challenge — not AI. AI assists with note summarization, ICD-10 code lookup autocomplete, and template auto-fill. Conflict resolution for records edited offline on multiple devices is genuinely difficult and time-consuming to get right.

## Legal Risks
- HIPAA (US), GDPR (EU), DPDP Act (India) — multiply compliance burden across each target jurisdiction; each requires separate legal review
- Medical liability for medication or allergy record errors — clear audit trail and disclaimer required
- Data sovereignty — some countries (Indonesia, India) require health data stored on local servers; impacts cloud architecture
- Security on lost or stolen low-end tablets — data-at-rest encryption is critical and must be enforced at app level, not assumed from device OS
