# ScribeSpeak — Research Brief

## What It Is
ScribeSpeak records audio and converts it to professionally formatted documents using AI. It targets doctors, nurses, lawyers, and journalists who need fast voice-to-document workflows with domain-specific formatting.

## Competitors
| Name | Description |
|------|-------------|
| Nuance Dragon Medical One / DAX | Microsoft-acquired ($19.7B), $99–199/mo per provider, dominant in US hospital systems |
| Freed AI | Consumer-friendly AI medical scribe, auto-generates SOAP notes, popular with solo practitioners |
| Abridge | $300M Series E, $5.3B valuation, integrated into major health systems (EPIC partnership) |
| Otter.ai | General-purpose transcription, $10–30/mo, not domain-specific |
| Rev / Sonix | Human + AI transcription services, pay-per-minute, no structured document output |

## Market Size
AI medical scribing market: $1.39B–$3.8B (2025) → $8.9B–$19.6B by 2034 (19–25% CAGR). Doctors lose 2+ hours/day to documentation. Clinician burnout drives institutional purchasing urgency. Legal transcription adds a parallel vertical with comparable willingness to pay. Combined medical + legal addressable market exceeds $5B by 2027.

## MVP Features
1. Audio recording via mobile app and web browser
2. Automatic transcription with speaker diarization (who said what)
3. Domain-specific vocabulary packs (medical, legal, journalism)
4. Formatted output templates (SOAP notes, legal memos, interview transcripts)
5. Export to PDF and DOCX
6. Inline correction editor with diff highlighting

## Differentiators
1. Vertical depth per profession — separate tuned prompts and vocabulary vs generic tools that produce raw transcripts
2. Privacy-first on-device mode — Whisper-based local processing, no cloud upload for HIPAA-sensitive recordings
3. Smart formatting AI — Claude restructures raw transcript into required document format, not just a transcript dump

## Profitability
**Model:** Per-seat SaaS subscription with team plans for clinics and law firms
**Estimate:** 500 users × $49/mo = $294K ARR. $1–5M ARR achievable at 1K–3K paying users given strong willingness to pay ($99–199/mo benchmarked by Nuance). Team plan upsell ($200–500/mo for 5–10 seats) accelerates ARR.

## Build Ease: 4/5
Whisper handles transcription; Claude handles post-processing and format structuring — both are API-accessible with no ML engineering required. Hard parts are HIPAA compliance infrastructure (BAA agreements, encrypted storage, audit logs) and domain vocabulary tuning for edge cases.

## Legal Risks
- HIPAA (US) — Business Associate Agreement required, end-to-end encrypted storage, audit logging; cannot use standard cloud APIs without BAA
- GDPR (EU) — data minimization, right to erasure, cross-border transfer restrictions for health data
- Transcription errors in medical or legal contexts can cause patient harm or malpractice exposure — strong disclaimer and human-review workflow required
- Data retention laws vary by jurisdiction; some countries require health records to be stored locally
