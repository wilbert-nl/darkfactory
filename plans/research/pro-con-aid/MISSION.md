# Mission

## What This Builds

A structured decision-making assistant where users define a decision, list options, set weighted criteria, and score each option against each criterion. An AI "Devil's Advocate" mode (powered by Claude API) challenges the user's assumptions and surfaces overlooked risks for whichever option is leading. Finished decisions are saved locally and can be shared as read-only encoded URLs. Users can journal the outcome after the fact to close the loop.

## Primary Users

Individuals and teams facing considered decisions — career moves, product bets, vendor selections, life choices — who want more rigor than a pros/cons list but less overhead than a formal decision matrix spreadsheet. The Devil's Advocate mode helps avoid confirmation bias. Solves the problem of making important decisions based on gut instinct while convincing yourself you've been analytical.

## In Scope (Factory Can Build)

- Decision canvas: name a decision, add options and weighted criteria
- Score each option against each criterion (1–10), importance weights per criterion
- Weighted score totals with ranked option highlighting
- AI Devil's Advocate: send the leading option to Claude API for critical analysis — surfaces blind spots, challenges assumptions
- Decision outcome journal: mark a decision as made, log what actually happened later
- Share as read-only encoded URL (all data in URL fragment, no server)
- PDF export (client-side, jsPDF)
- Freemium: Free = 3 active decisions; Pro = unlimited + AI Devil's Advocate unlimited
- Local storage (sql.js)
- Bug fixes, tests, documentation

## Out of Scope (Never Build)

- Backend server or API
- User accounts or authentication
- Storing decision data on any server
- Real-time collaboration
- Formats other than PDF for export
- Team decision boards or shared editing
- Payment processing (handled externally)

## Immutable Constraints (Cannot Change, Ever)

- Governance files (MISSION.md, CLAUDE.md, FACTORY_RULES.md) are human-only — agents must never modify them
- All decision data stored locally only — never sent to any server except Anthropic API for AI features
- Share link must use URL fragment (`#data=...`) not query params — fragments never sent to servers
- `VITE_ANTHROPIC_API_KEY` is dev-only — production must use a backend proxy; always add `TODO: use proxy in prod` comment where key is used
- Free tier limit (3 active decisions) must be enforced via `proStore` — never hardcode bypass
- Devil's Advocate AI calls must be user-triggered only — never run automatically
- PDF export must be entirely client-side
