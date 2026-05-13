# Voice-First CRM for Tradespeople (HVAC, Plumbers, Electricians)

## Overview

A dead-simple, voice-driven field service CRM for solo or small-crew tradespeople. Instead of typing into a CRM while driving or on a job site, a technician speaks: "Job done for John Smith, replaced water heater, parts $340, labor $180, paid cash." The AI parses this into a complete job record, invoice draft, and customer update — all without touching a screen.

**Category:** Vertical SaaS / Field Service  
**Target:** Solo tradespeople and shops with 1–5 technicians (plumbers, HVAC, electricians, handymen)  
**Effort to Build:** Medium (6–8 weeks with AI-assisted dev + Whisper/LLM API)  
**Pricing Model:** Flat $29–$59/mo per technician

---

## Why Now

- Tradespeople are one of the last industries still running on paper or generic spreadsheets
- Voice interfaces (Whisper, GPT-4o audio) are now production-quality and affordable
- Small shops (1–5 people) are completely underserved by ServiceTitan ($300+/mo) and Jobber ($49+/mo with steep learning curve)
- Smartphones are already in every tradesperson's pocket
- Field service software market: $6.5B by 2027, but SMB tools are mostly bloated

---

## Market Size

- ~7M tradespeople businesses in the US (HVAC, plumbing, electrical, general contracting)
- 80%+ are solo or micro-crews (under 5 people)
- Even 5,000 customers at $39/mo = **$195K MRR**

---

## Competitors

| Player | Strength | Weakness |
|---|---|---|
| **ServiceTitan** | Full-featured, enterprise-grade | $300–$600/mo, requires onboarding team |
| **Jobber** | Clean UX, good for small teams | $49–$149/mo, still screen-heavy |
| **Housecall Pro** | Mobile-friendly, scheduling | $65–$169/mo, too complex for solos |
| **QuoteIQ** | Voice/AI estimates from $29.99/mo | US-focused, limited voice scope |
| **ServiceAgent** | AI call answering + booking | Not a field CRM, just a front desk bot |
| **Repair-CRM** | Lightweight, affordable | No voice input, limited AI |

---

## Edge / Differentiation

1. **Voice as primary interface** — every interaction (job notes, materials, time, payments) can be spoken. AI transcribes and structures. Screen is optional.
2. **Zero onboarding** — speak your first job in under 60 seconds, no training required
3. **WhatsApp integration** — send job completion summaries to customers via WhatsApp (dominant channel in SE Asia, UK, AU) or SMS
4. **Offline-first** — voice recordings cached locally, sync when back in coverage
5. **Flat-file simplicity** — no modules, no upsells, one plan. "It just works."
6. **Automatic follow-up** — after job completion, AI sends a follow-up text asking for a Google review and offering a maintenance reminder

---

## Go-to-Market

- **Channel:** Facebook Groups for tradespeople (massive, underserved communities), YouTube Shorts demos showing the voice feature
- **Direct DM:** Cold outreach to plumbers and HVAC companies on Instagram/Facebook who post job photos
- **Word of mouth:** Tradespeople trust peer recommendations — one happy solo plumber will tell 5 others
- **Niche down hard:** Launch as "The CRM for HVAC technicians only" — get known in that community before expanding

---

## Tech Stack (Dark Factory Fit)

- NestJS + PostgreSQL backend
- Vue 3 PWA (works on mobile browser, no app store needed)
- OpenAI Whisper for voice transcription
- GPT-4o for parsing spoken job summaries into structured data
- Twilio / WhatsApp Business API for customer messaging
- Stripe for payments, simple invoicing PDF via Puppeteer

---

## Revenue Potential

- 300 customers at $39/mo = **$11,700 MRR**
- Very low churn — once a tradesperson has their customer history in the tool, switching cost is high
- Realistic 18-month target: **$10K–$20K MRR** starting from one trade vertical

---

## Risks

- Voice AI accuracy in noisy job sites (compressors, drills) — needs noise cancellation or push-to-talk UX
- Tradespeople are notoriously resistant to adopting new software
- Need to demo it in person / video — product screenshots don't sell this idea
- Regulatory differences in invoicing requirements across countries

---

## Verdict

**High confidence for the right founder.** If you have any network into the trades industry (or can get a few beta users), this is a highly differentiated, defensible niche. Voice-first is genuinely novel — no competitor has nailed it for this audience. Start with one trade vertical in one country.
