# PLAN: CalendR
_Status: Draft — Resolve open questions before starting implementation_

> **For Claude in next session:** Read the open questions below and ask the user to resolve them one at a time before writing any code. Mark each resolved one with ✅.

## Overview
CalendR is an appointment scheduling platform for small service businesses — beauty, coaching, wellness, tattoo studios — with a brandable booking page, two-way calendar sync, and WhatsApp/SMS reminders. The differentiator is vertical-specific templates that make setup instant and AI-generated post-appointment follow-ups that make every business look professional. Calendly's $276M revenue proves the organic demand; the gap is SMB-specific depth they don't provide.

## Recommended Stack
- **Frontend:** Vue 3 + Quasar (web-first; Capacitor for iOS/Android client app if needed)
- **Backend:** NestJS + REST API
- **Database:** PostgreSQL (services, bookings, clients, reminders, staff)
- **Auth:** NestJS + Passport JWT; Google OAuth for calendar sync
- **Payments:** Stripe (subscription billing + deposit/payment collection at booking)
- **Reminders:** Twilio (SMS + WhatsApp Business API) + SendGrid (email)
- **Calendar Sync:** Google Calendar API + Microsoft Graph API (Outlook/iCal)
- **AI:** Claude API — post-appointment follow-up message generation, smart scheduling conflict suggestions

## MVP Scope
- Personalized booking page with branding, service catalog, and real-time availability
- Two-way calendar sync with Google Calendar (Outlook as v1.1)
- Automated email and SMS reminders at 24h and 1h before appointments
- Client management panel with appointment history and notes
- Stripe payment collection at booking (full pay and deposit options)
- Vertical-specific onboarding templates (hair salon, coach, tattoo, aesthetics)

## Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] NestJS + PostgreSQL setup; migrate schema: users, services, bookings, clients, staff, reminders
- [ ] Multi-tenant architecture: each business has an isolated booking namespace
- [ ] Stripe subscription billing setup (Freemium, Solo $12/mo, Business $29/mo)
- [ ] Google OAuth + Google Calendar API two-way sync (create/update/delete events)
- [ ] Scaffold Vue 3 + Quasar frontend: dashboard, booking page builder, calendar view

### Phase 2 — Core Features (Week 3–5)
- [ ] Service catalog CRUD (name, duration, price, buffer, concurrent limit, deposit amount)
- [ ] Public booking page with availability slots and real-time conflict checking
- [ ] Client-facing booking flow: select service → pick slot → fill details → pay → confirmation
- [ ] Automated reminder queue: email (SendGrid) + SMS (Twilio) at 24h and 1h
- [ ] WhatsApp reminder delivery via Twilio WhatsApp Business API
- [ ] Client management panel: contact details, booking history, notes, tags
- [ ] Stripe payment at booking: full pay, deposit + balance on arrival, free (pay in person)
- [ ] Vertical onboarding templates: pre-populate services, duration, pricing, intake fields

### Phase 3 — Launch Prep (Week 6–8)
- [ ] AI post-appointment follow-up generation (Claude API: personalized message per service type)
- [ ] Staff management: multiple staff with individual calendars and service assignments
- [ ] SMS double opt-in flow (TCPA compliance for US users)
- [ ] No-show and cancellation workflow: policies, automated notifications, deposit retention rules
- [ ] Outlook / iCal sync (Microsoft Graph API)
- [ ] Custom domain for booking page (CNAME support)
- [ ] Legal pages: Privacy Policy, Terms of Service, TCPA opt-in language
- [ ] Delivery monitoring dashboard: reminder send/delivery/failure status per booking

## Open Questions ❓
> Resolve these before implementation. Ask one at a time.

- [ ] ❓ **Primary vertical:** Launch with one vertical template (e.g., hair salon) or ship 4 templates simultaneously?
- [ ] ❓ **Primary market geography:** Philippines-focused first (WhatsApp-heavy market) or global from day 1?
- [ ] ❓ **Outlook sync:** Include Outlook/Microsoft Graph API in MVP or defer to v1.1 (Google-only first)?
- [ ] ❓ **SMS infrastructure:** Twilio (global, higher cost) or a local SMS gateway for PH market (lower cost, limited reach)?
- [ ] ❓ **Staff multi-user:** Include staff calendars and multi-user in MVP, or solo-practitioner only first?
- [ ] ❓ **Monetization timing:** Paid from day 1 or free during first 3 months to build 100 active businesses before charging?

## Top Risks
1. **Calendar sync reliability** — Google and Outlook OAuth with timezone edge cases causes missed or duplicated bookings; mitigation: extensive integration testing, webhook-based sync (not polling), and fallback manual refresh; this is the #1 quality risk
2. **SMS delivery failures** — a missed reminder is a no-show that damages trust irreparably; mitigation: monitor delivery receipts per booking, implement fallback to email if SMS fails, and show the business owner delivery status in the dashboard
3. **TCPA violation (US)** — sending SMS without documented opt-in carries $500–1,500 per message in fines; mitigation: implement double opt-in at booking for US phone numbers and store opt-in timestamps in the database

## Dark Factory Readiness
**Ready:** Partial
**Notes:** Booking page, service catalog, client management, and email reminders are factory-ready. Google Calendar OAuth and Twilio SMS/WhatsApp require account credentials and API keys before the factory can wire them up. Resolve vertical focus and staff multi-user questions first to avoid schema redesign mid-build.
