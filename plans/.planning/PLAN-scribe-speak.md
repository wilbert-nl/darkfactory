# PLAN: ScribeSpeak
_Status: Draft — Resolve open questions before starting implementation_

> **For Claude in next session:** Read the open questions below and ask the user to resolve them one at a time before writing any code. Mark each resolved one with ✅.

## Overview
ScribeSpeak turns audio recordings into formatted professional documents using Whisper for transcription and Claude for intelligent restructuring. The core opportunity is that doctors and lawyers spend 2+ hours/day on documentation and existing tools either cost $100–200/mo (Nuance) or are generic with no domain formatting (Otter.ai). A vertically specialized tool at $29–99/mo with SOAP note, legal memo, and interview transcript outputs is the gap.

## Recommended Stack
- **Frontend:** Vue 3 + Quasar (web PWA for recording in browser; Capacitor wrapper for iOS/Android)
- **Backend:** NestJS + PostgreSQL + Redis (job queue for async transcription processing)
- **Database:** PostgreSQL (structured records, audit logs); encrypted S3-compatible storage for audio files
- **Auth:** Supabase Auth or Auth0 (HIPAA-eligible plans required)
- **Payments:** Stripe (subscriptions + seat-based team billing)
- **AI:** OpenAI Whisper API for transcription; Claude API for post-processing, format restructuring, and vocabulary correction

## MVP Scope
- Record audio in browser and mobile; upload existing audio files (MP3, M4A, WAV)
- Transcription with speaker diarization via Whisper; result stored per user account
- Claude-powered formatting into selectable templates (SOAP note, legal memo, interview transcript)
- Inline editing UI with diff highlights for corrections
- Export to PDF and DOCX; shareable review link for team members

## Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] NestJS project scaffold with PostgreSQL and Redis (BullMQ for transcription job queue)
- [ ] Supabase Auth integration with HIPAA-eligible configuration
- [ ] Audio upload endpoint with S3-compatible encrypted storage
- [ ] Whisper API integration in async job processor; store raw transcript
- [ ] Basic Vue 3 + Quasar recording UI with upload fallback
- [ ] User account and transcript list views

### Phase 2 — Core Features (Week 3–5)
- [ ] Claude API integration for template formatting (SOAP, legal memo, interview)
- [ ] Domain vocabulary packs — medical and legal term dictionaries fed into Claude prompt
- [ ] Inline diff editor for correcting transcription errors
- [ ] Speaker diarization labeling UI (assign names to Speaker 1, Speaker 2, etc.)
- [ ] PDF and DOCX export via pdfmake and docx libraries
- [ ] Stripe subscription billing (individual $29/mo and $79/mo tiers)

### Phase 3 — Launch Prep (Week 6–8)
- [ ] Team / clinic plan billing (seat-based, $200–500/mo for 5–10 seats)
- [ ] Audit log trail for every document access and edit (HIPAA requirement)
- [ ] Data retention policy enforcement (configurable per account)
- [ ] Capacitor mobile build (iOS and Android) with native audio recording
- [ ] Privacy policy, BAA template, and disclaimer copy reviewed by legal counsel
- [ ] Soft launch with 10 beta testers (5 medical, 5 legal)

## Open Questions ❓
> Resolve these before implementation. Ask one at a time.

- [ ] ❓ **Platform priority:** Launch web-first and add mobile later, or build mobile-first from day one via Capacitor?
- [ ] ❓ **Target vertical:** Start with medical only (larger market, higher WTP) or build medical + legal simultaneously?
- [ ] ❓ **HIPAA compliance:** Will you engage a HIPAA compliance consultant before writing production code, or launch with a disclaimer as a non-BAA tool first?
- [ ] ❓ **On-device mode:** Is the Whisper on-device (no cloud) mode a launch feature or a v2 add-on?
- [ ] ❓ **Transcription language:** English only at launch or multi-language from day one (Filipino, Spanish, French)?
- [ ] ❓ **Monetization timing:** Paid from day 1 with a free trial, or free during beta to build testimonials?

## Top Risks
1. **HIPAA compliance scope creep** — Every feature that touches audio or text in a medical context triggers compliance obligations. Mitigation: Engage a HIPAA consultant in Phase 1 before writing storage or auth code. Alternatively, launch as a non-BAA productivity tool with explicit disclaimer that it is not a covered entity.
2. **Transcription accuracy in niche vocabulary** — Whisper misses specialized medical/legal terms, undermining trust. Mitigation: Claude post-processing with vocabulary glossaries reduces errors; build a user feedback loop for corrections that improves prompts over time.

## Dark Factory Readiness
**Ready:** No
**Notes:** HIPAA compliance infrastructure (BAA-eligible hosting, audit logs, encrypted storage architecture) must be designed and reviewed before the factory builds any feature involving audio storage or patient data. This is a legal and architectural decision, not a coding task.
