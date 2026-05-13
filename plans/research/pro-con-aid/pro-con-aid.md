# ProConAid — Research Brief

## What It Is
A weighted decision-making assistant where users list options, assign importance weights to criteria, score each option, and receive a ranked recommendation — with an AI Devil's Advocate mode that flags overlooked factors, cognitive biases, and pre-scored foregone conclusions.

## Competitors
| Name | Description |
|------|-------------|
| Genvalo | Free web tool; weighted scoring + AI summary; no paid tier, no app, unmonetized |
| Klover.ai | Group decision voting tool; collaborative but no weighted scoring |
| Notion Decision Matrix | DIY template; no intelligence, no persistence, no sharing |
| ChatGPT / Claude | Indirect competitor; freeform advice but no structured scoring or outcome tracking |

## Market Size
Productivity apps market $30.85B by 2034. No dedicated "decision tools" vertical is tracked, signaling an underserved niche. Genvalo's existence (and non-monetization) is a demand signal: users are actively searching for this, but no one has captured it commercially. HR/coaching/consulting orgs run decision frameworks manually — a B2B licensing angle exists on top of the consumer product.

## MVP Features
1. Decision canvas: name the decision, add 2–6 options
2. Criteria builder with weight sliders (scale 1–10 per criterion)
3. Scoring grid: rate each option against each weighted criterion
4. Weighted score leaderboard with bar chart visualization
5. AI Devil's Advocate mode: flags overlooked criteria, surfaced biases, and pre-decided patterns
6. Shareable read-only link and PDF export of the full decision report
7. Decision history log for registered users

## Differentiators
1. AI bias detection — flags when scoring patterns suggest the user already decided before starting; surfaces blind spots
2. Decision outcome journal — rate your decision 3 or 6 months later; builds a personal track record of decision quality
3. Collaborative anonymous scoring — team members score independently before results are revealed, preventing groupthink

## Profitability
**Model:** Freemium (5 saved decisions free) → Pro $5–8/mo (unlimited + history + collab + PDF export) → Team $20/mo/seat → B2B licensing to HR/coaching/consulting platforms at $500–2K/mo per org
**Estimate:** 10K users × 5% paid × $6/mo = $3K MRR / $36K ARR at early scale. B2B licensing channel can add $10–50K ARR per anchor client. Path to $150K+ ARR with 20 B2B clients + healthy consumer base.

## Build Ease: 5/5
Highest AI leverage of any idea in this set. Scoring, weighted recommendation, bias detection, report generation, and Devil's Advocate commentary are all Claude-native tasks. Frontend is a scoring grid and bar charts — no complex infrastructure. Zero regulated data. No payments complexity beyond a simple Stripe subscription. Estimated time-to-MVP: 4–6 weeks.

## Legal Risks
- Advice disclaimer — must clearly state decisions are the user's own; not financial, medical, or legal advice; add to onboarding and PDF exports
- GDPR — decision content may contain sensitive personal information (career choices, health options, relationship decisions); implement at-rest encryption and right-to-deletion
