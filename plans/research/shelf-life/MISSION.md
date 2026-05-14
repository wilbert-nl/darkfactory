# Mission

## What This Builds

A privacy-first web app (installable PWA) that helps people stop wasting food. Users log items in their fridge, freezer, and pantry with a best-before date; the app ranks everything by urgency, reminds them before food spoils, suggests what to cook from items about to expire, and tracks money and weight saved versus wasted. All data stays on the device — no account, no server, no cloud sync.

## Primary Users

Households that want to cut grocery waste and spend — people who routinely find spoiled food at the back of the fridge and want a low-effort way to see what needs using first. Also useful for shared flats coordinating a communal kitchen and for budget-conscious shoppers tracking the real cost of waste.

## In Scope (Factory Can Build)

- Add, edit, and remove food items (name, category, quantity, unit, storage location, best-before date)
- Urgency-sorted item list with expired / expiring / fresh color coding
- Local reminders before an item's best-before date (Web Notifications)
- Mark an item Used or Wasted; both feed the analytics log
- "Use It Up" suggestions matching urgent items against a bundled local recipe set
- Waste & savings dashboard (money and weight, 30/90-day windows)
- Storage-location filtering and search
- Device-to-device export/import of the pantry as a JSON file
- localStorage persistence for all data
- Bug fixes, tests, documentation

## Out of Scope (Never Build)

- Backend server or API
- User accounts, authentication, or cloud sync
- Barcode scanning or any external product database
- Recipe content fetched from a third-party service
- AI model calls of any kind
- Monetization wiring, payment processing, or ads
- Analytics, telemetry, or crash reporting
- Any network request that transmits a user's pantry data
- Presenting the app as a food-safety authority (it tracks dates, it does not certify safety)

## Immutable Constraints (Cannot Change, Ever)

- Governance files (MISSION.md, CLAUDE.md, FACTORY_RULES.md) are human-only — agents must never modify them
- All user data stays on the device — no network request may carry pantry contents
- A health disclaimer must be present and reachable: best-before dates are guidance, not a safety guarantee
- Web Notification permission must be requested with a human-readable explanation and must degrade gracefully when denied
- The app must remain fully functional offline
- No account system, ever — the app must never gate features behind a login
- Money and weight figures shown to the user are estimates entered by the user — never invent or fetch pricing data
</content>
