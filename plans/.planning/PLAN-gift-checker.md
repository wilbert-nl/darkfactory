# PLAN: GiftChecker
_Status: Draft — Resolve open questions before starting implementation_

> **For Claude in next session:** Read the open questions below and ask the user to resolve them one at a time before writing any code. Mark each resolved one with ✅.

## Overview
GiftChecker is a two-way gift tracking app where users log gifts given and received across life events, and groups share wishlists with "already received" and "reserved by someone" flags. The opportunity is the trust gap in group gifting — duplicate gifts and awkward "what do you want?" conversations are a universal pain, yet no product tracks both sides of the exchange with social awareness.

## Recommended Stack
- **Frontend:** Vue 3 + Quasar (PWA-first; installable on mobile without native app complexity)
- **Backend:** NestJS with REST + WebSocket for real-time reserved-flag updates
- **Database:** PostgreSQL (relational graph for users → groups → events → gifts)
- **Auth:** Supabase Auth or Clerk (social login via Google/Apple is essential for this audience)
- **Payments:** Stripe (for premium subscription billing)
- **AI:** Claude API — gift suggestion prompts based on recipient profile, past gifts, and budget; receipt OCR parsing for auto-log

## MVP Scope
- User profiles, event creation, and group invite system
- Wishlist per event with item links and price targets
- "Already received" and "reserved by giver" flags with privacy guardrails
- Gift history log (given + received) with basic search
- AI-powered gift suggestions based on recipient's wishlist gaps and budget

## Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] Set up NestJS monorepo with PostgreSQL; define schema: users, groups, events, gift_items, gift_logs
- [ ] Auth with Google/Apple social login via Clerk or Supabase
- [ ] User profile CRUD and event creation flow
- [ ] Group invite system with email + link-based invites
- [ ] Vue 3 + Quasar PWA scaffold with mobile-first navigation

### Phase 2 — Core Features (Week 3–5)
- [ ] Wishlist per event — add items with URL, price, notes, photo
- [ ] "Already received" flag — only visible to group members, not the recipient
- [ ] "Reserved" flag — visible only to the reserver and hidden from recipient
- [ ] Privacy model: define and enforce visibility rules across all states
- [ ] Gift history log — log a gift given with recipient, event, item, amount
- [ ] AI gift suggestion panel using Claude API with recipient profile context

### Phase 3 — Launch Prep (Week 6–8)
- [ ] Receipt/order confirmation scan-to-log (Claude vision or OCR)
- [ ] Freemium gate: define what's free vs. paid; Stripe subscription flow
- [ ] Affiliate link wrapper for wishlist items (Amazon, etc.) with FTC disclosure
- [ ] Email/push notifications: group invite, item reserved, wishlist updated
- [ ] Polish onboarding for first-time users with empty state guidance
- [ ] GDPR/CCPA: consent banner, data export, account deletion

## Open Questions ❓
> Resolve these before implementation. Ask one at a time.

- [ ] ❓ **Platform:** PWA-first or native mobile app (Capacitor)? PWA is faster to ship but some users expect App Store presence.
- [ ] ❓ **Recipient privacy model:** Can a wishlist owner see who reserved which item, or is all reservation data hidden from them entirely?
- [ ] ❓ **Group structure:** Can one user belong to multiple overlapping groups (e.g., family AND friends seeing the same event), or are groups event-scoped only?
- [ ] ❓ **Monetization timing:** Charge from day 1 (freemium) or grow free users first and introduce paid later?
- [ ] ❓ **Affiliate partnerships:** Start with Amazon affiliate only, or build a universal link wrapper from the start?
- [ ] ❓ **Target market:** Philippines-first (local gifting culture is strong) or global English from day 1?

## Top Risks
1. **Privacy bug causes spoiling** — a recipient sees their reserved gift; mitigation: dedicated privacy model review and automated tests for all visibility rules before launch
2. **Low retention after major gift events** — users log gifts for Christmas then disappear; mitigation: year-round engagement via birthdays, anniversaries, and daily gift idea prompts

## Dark Factory Readiness
**Ready:** Yes
**Notes:** Standard CRUD + social graph with well-defined data model. AI integration is prompt-only (no fine-tuning). Privacy rules need to be fully specified in open questions before handing off.
