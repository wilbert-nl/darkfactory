# PLAN: DateMatch
_Status: Draft — Resolve open questions before starting implementation_

> **For Claude in next session:** Read the open questions below and ask the user to resolve them one at a time before writing any code. Mark each resolved one with ✅.

## Overview
DateMatch is a relationship compatibility app using structured questionnaires to generate compatibility scores, conversation starters, and coaching guidelines — for both new matches and existing couples. The opportunity is that the $2B couples apps market grows at 12.5% CAGR, yet most dating apps abandon users after the match. DateMatch continues the relationship from match through long-term compatibility coaching.

## Recommended Stack
- **Frontend:** Vue 3 + Quasar with Capacitor for iOS/Android packaging (dating apps are mobile-first)
- **Backend:** NestJS with REST API; WebSocket for real-time chat prompts
- **Database:** PostgreSQL (profiles, questionnaire responses, match scores, prompt history)
- **Auth:** Clerk with Apple/Google social login (App Store requires Apple Sign-In)
- **Payments:** RevenueCat for in-app purchases on iOS/Android + Stripe for web
- **AI:** Claude API — generates compatibility narratives, conversation starters, daily prompts, and coaching guidelines from questionnaire gap analysis

## MVP Scope
- Onboarding questionnaire (values, attachment style, love languages, lifestyle, dealbreakers)
- Compatibility score with 4–5 category breakdowns and AI-generated narrative
- Match feed with conversation starters tailored to compatibility gaps
- Couples mode: two existing partners link accounts and receive joint coaching
- Daily prompt delivery to maintain engagement post-match

## Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] NestJS backend with PostgreSQL; schema: users, questionnaire_responses, matches, prompts, couples
- [ ] Auth with Clerk (Apple + Google sign-in required for App Store)
- [ ] Questionnaire engine: define 40–60 questions across 5 categories; scoring rubric with Claude assistance
- [ ] Profile creation flow with photo upload (S3/Cloudflare R2)
- [ ] Vue 3 + Quasar mobile scaffold wrapped with Capacitor

### Phase 2 — Core Features (Week 3–5)
- [ ] Compatibility scoring engine: weighted category scores → overall percentage
- [ ] Claude API integration: generate compatibility narrative and conversation starters from score + gap analysis
- [ ] Match feed: browse compatible profiles with score preview and starter prompt
- [ ] Couples mode: invite partner via link; linked accounts receive joint daily prompts
- [ ] Daily prompt scheduler (NestJS cron + push notification via OneSignal or Expo)
- [ ] Saved matches and match history

### Phase 3 — Launch Prep (Week 6–8)
- [ ] Subscription paywall via RevenueCat (define free tier limits vs. paid features)
- [ ] Safety features: block, report, and content moderation on user-generated content
- [ ] Legal review: ToS must disclaim clinical/therapy positioning; "coaching" language only
- [ ] GDPR/CCPA: explicit consent for sensitive personal data; full deletion cascade
- [ ] App Store and Play Store submission prep (screenshot set, review guidelines compliance)
- [ ] Onboarding A/B test: questionnaire length (short 20q vs. full 60q) to optimize completion rate

## Open Questions ❓
> Resolve these before implementation. Ask one at a time.

- [ ] ❓ **Primary audience:** Singles seeking matches, existing couples seeking coaching, or both from day 1? Each requires different marketing and onboarding.
- [ ] ❓ **Questionnaire depth:** 20 quick questions (higher completion) vs. 60 deep questions (better accuracy)? eHarmony uses 150+ but that was 2000s behavior.
- [ ] ❓ **Matching algorithm:** Pure compatibility score ranking, or swipe/like mechanic layered on top of score?
- [ ] ❓ **Monetization model:** Subscription only, or freemium with limited matches/prompts before paywall?
- [ ] ❓ **Geography focus:** Philippines-first (strong demand for relationship apps) or global English from day 1?
- [ ] ❓ **Couples mode pricing:** Same subscription as singles, or a higher-priced couples plan (two accounts, one bill)?

## Top Risks
1. **Regulatory creep into mental health territory** — if users treat the app as therapy, platform liability increases; mitigation: legal review of all AI-generated text, strict "coaching not therapy" disclaimers throughout
2. **Questionnaire drop-off before first match** — long onboarding kills conversion; mitigation: progressive profiling (show partial results after 10 questions, unlock full score at 40)

## Dark Factory Readiness
**Ready:** Yes
**Notes:** Highest AI leverage of all six ideas — Claude generates all compatibility content end-to-end. Questionnaire scoring rubric must be defined by the founder before implementation begins. App Store compliance (Apple Sign-In, in-app purchases via RevenueCat) needs to be scoped before Phase 3.
