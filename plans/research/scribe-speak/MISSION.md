# MISSION.md — scribe-speak

## What This Builds

A mobile-and-web application that records audio and converts speech into professionally formatted documents — SOAP notes, legal memos, and meeting minutes. Users record via microphone, audio is transcribed server-side with speaker diarization, and Claude Haiku reformats the transcript into the selected domain template. Finished documents are exported as PDF or DOCX.

## Primary Users

- Clinical practitioners who dictate patient encounter notes (SOAP format)
- Attorneys and paralegals who dictate case notes and memos
- Business professionals who need clean meeting minutes from recordings
- Knowledge workers who prefer speaking over typing for document creation

## In Scope

- Audio capture via `@capacitor/microphone` (native mobile) and `MediaRecorder` API (web browser)
- Server-side transcription via Whisper API (OpenAI) or Deepgram with speaker diarization
- Domain-specific vocabulary packs: medical, legal, business
- Document templates: SOAP note, legal memo, meeting minutes, generic transcript
- AI formatting of raw transcripts via Claude Haiku (server-side only)
- Inline correction editor for post-transcription edits
- Export to PDF (PDFKit, server-side) and DOCX (docx npm, server-side)
- User accounts with monthly transcription-minute tracking
- Free tier: 10 minutes transcription per month
- Pro tier ($9.99/mo via Stripe): unlimited transcription, custom templates, DOCX export

## Out of Scope

- Real-time word-by-word live transcription display (batch processing only in MVP)
- Audio storage or playback after transcription completes
- On-device or offline transcription
- EHR integrations or legal case management platform connectors
- Multi-language transcription (English only in MVP)
- Team or organization accounts
- Voice biometric speaker identification

## Immutable Constraints

1. **Audio recordings are deleted from the server immediately after transcription completes** — never stored long-term under any circumstances.
2. **Transcripts stored encrypted at rest** — AES-256 or equivalent; never plaintext in the database.
3. **"Not a substitute for professional medical or legal documentation" disclaimer** must appear on every exported document and in the app UI — agents must never remove, shorten, or soften this disclaimer.
4. **Whisper API key and any transcription provider credentials never exposed to the frontend** — all transcription calls made server-side only.
5. **DOCX and PDF generation is server-side only** — never client-side rendered.
6. **Pro pricing ($9.99/mo) and free tier limit (10 min/mo) are hardcoded** — agents must never alter these values.
7. **Custom templates are user-owned** — agents must never share a user's custom template with another user's account.
