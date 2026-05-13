# DateMatch — Research Brief

## What It Is
A relationship compatibility app that uses structured questionnaires to generate compatibility scores, conversation starters, and coaching guidelines for both new matches and existing couples.

## Competitors
| Name | Description |
|------|-------------|
| eHarmony | $2B+ lifetime revenue; questionnaire-based matching but expensive and aging UX |
| Hinge | 23M users; prompt-based but no formal compatibility scoring or coaching |
| Lasting | 1M+ couples; structured relationship counseling app, subscription-based |
| Couple Game / Desire | Gamified couples prompts; no compatibility engine or coaching layer |

## Market Size
Couples apps market: $2B (2024) growing to $5.77B by 2033 at 12.5% CAGR. Online dating overall: $4.3B by 2034. Combined addressable market covers both single users (matching) and couples (coaching), making the TAM meaningfully larger than either segment alone.

## MVP Features
1. Onboarding questionnaire covering values, attachment style, love languages, lifestyle
2. Compatibility score with category breakdown (communication, values, lifestyle, intimacy)
3. Match feed with AI-generated conversation starters tailored to shared gaps
4. Relationship guidelines surfaced from compatibility gaps (not generic advice)
5. Saved profiles and match history
6. Daily prompts to maintain engagement post-match

## Differentiators
1. Post-match compatibility coaching — most dating apps stop at the match; this starts there
2. Couples mode for existing relationships, doubling the addressable audience
3. Attachment theory as the core UX layer — not a bolt-on; it structures the entire scoring model

## Profitability
**Model:** Subscription — $15–25/mo or $100/yr; no freemium complexity needed at launch
**Estimate:** 100K subscribers × $100/yr = $10M ARR. Couples mode justifies higher willingness to pay vs. standard dating apps.

## Build Ease: 5/5
Highest AI leverage of any idea in this set. Claude generates questionnaire scoring rubrics, compatibility narratives, conversation starters, and coaching text end-to-end. No novel infrastructure needed — standard auth, profiles, and content delivery.

## Legal Risks
- Dating safety liability: harm between matched users; requires reporting tools and clear ToS
- Avoid clinical mental health claims: must not position as therapy or diagnosis; "coaching" framing only
- Sensitive personal data (GDPR/CCPA): attachment style, relationship history, and intimacy preferences require explicit consent and robust deletion
- Right to deletion: matched profiles referencing a deleted user must be cleanly handled
