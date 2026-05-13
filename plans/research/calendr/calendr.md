# CalendR — Research Brief

## What It Is
An appointment scheduling platform for small businesses featuring a brandable booking page, service catalog, two-way calendar sync, and automated reminders via email, SMS, and WhatsApp — differentiated by vertical-specific templates and AI-powered post-appointment follow-ups.

## Competitors
| Name | Description |
|------|-------------|
| Calendly | $276M revenue (2023); 10M+ users; $3B+ valuation; meeting-focused, less SMB-service-oriented |
| Acuity Scheduling | Squarespace-owned; strong intake forms and payments; popular with coaches and studios |
| Square Appointments | Free for individuals; POS-integrated; strong in US retail/beauty verticals |
| Setmore | Free tier; strong international adoption; basic feature set |
| Cal.com | Open-source self-hosted; developer-friendly; no vertical templates or AI follow-ups |

## Market Size
Appointment scheduling software market $546–567M (2025) growing to $1.9B by 2034. The broader SMB services segment is projected to $18.56B by 2035. Calendly's $276M revenue on near-zero marketing spend confirms the organic demand scale. WhatsApp has 2B+ active users with 90%+ message open rates — no scheduling tool has meaningfully integrated it.

## MVP Features
1. Personalized booking page with custom branding (logo, colors, domain)
2. Service catalog (name, duration, price, buffer time, concurrent booking limit)
3. Two-way calendar sync (Google Calendar + Outlook/iCal)
4. Automated email and SMS reminders (24h and 1h before appointment)
5. Client management panel (contact history, appointment log, notes)
6. Stripe payment collection at booking with deposit and full-pay options
7. WhatsApp reminder delivery via Twilio or Meta Business API

## Differentiators
1. WhatsApp and Telegram reminders — 90%+ open rate vs 20% for email; no major competitor offers this natively
2. Vertical-specific onboarding templates — hair salons, tattoo artists, coaches, aestheticians each get pre-built service catalogs, deposit workflows, and intake forms out of the box
3. AI post-appointment follow-ups — personalized messages generated per service type (e.g., aftercare instructions, rebooking prompts, review requests) sent automatically after appointments

## Profitability
**Model:** Freemium → Solo $12/mo (unlimited bookings, SMS, custom domain) → Business $29/mo (5 staff, WhatsApp, AI follow-ups)
**Estimate:** 500 users × $18 avg = $9K MRR / $108K ARR at early scale. At 5,000 SMBs × $25 avg = $1.5M ARR. SMS/WhatsApp costs pass-through to higher tiers justifies pricing.

## Build Ease: 3/5
Cal.com open-source can be forked to accelerate the calendar sync foundation. AI generates follow-up messages and handles smart conflict resolution suggestions. Hard parts: Google and Outlook OAuth with timezone edge cases are notoriously tricky, reliable SMS infrastructure needs per-country number provisioning, and Stripe payment edge cases (refunds, no-shows, partial deposits) require careful handling.

## Legal Risks
- TCPA compliance (US SMS) — requires explicit written opt-in for marketing messages; violations carry $500–1,500 per message; implement double opt-in for SMS at booking
- GDPR / CCPA — client appointment data (name, phone, health/service details) is personal data; data retention policies and deletion requests must be supported
- PCI-DSS — use Stripe exclusively and never store raw card data; ensure Stripe Elements or Payment Links are used correctly
- Service reliability — missed appointment reminders are a brand-killer; must implement delivery confirmation, fallback channels, and SLA monitoring from day 1
