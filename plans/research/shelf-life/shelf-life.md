# ShelfLife — Research Brief

## What It Is
A privacy-first pantry tracker that tells you what food to eat before it spoils. Users log items in the fridge, freezer, and pantry with a best-before date; the app ranks everything by urgency, reminds them ahead of time, suggests recipes built from the items about to expire, and tracks money and weight saved versus wasted. All data stays on the device — no account, no cloud.

## Competitors
| Name | Description |
|------|-------------|
| NoWaste | Pantry/fridge inventory with expiry notifications; ~$7/yr premium; account-based |
| Fridgely | Barcode scanning auto-fills item name and estimates an expiry date; iOS-focused |
| KitchenPal | Barcode scanning, expiry alerts, recipe suggestions, auto shopping lists |
| Best Before | Expiry tracker and home inventory organizer with reminder notifications |
| Your Food | Manual expiry entry with push notifications; pantry + smart shopping list |
| Kitche | Links to a supermarket loyalty card to auto-import purchases and remind on expiry |

## Market Size
Households are the single largest source of food waste — ~631M tonnes/year, roughly 60% of the global total (UNEP Food Waste Index 2024). US households waste an estimated ~$1,800 of food per year; the EU figure is close to €1,700. Global food loss and waste costs the economy upward of $1 trillion annually. The dedicated food-waste-management software market is still small (~$137M in 2025, ~5.9% CAGR) — the consumer category is fragmented with no dominant brand owning the "what's expiring" query.

## MVP Features
1. Add/edit/remove items: name, category, quantity, unit, storage location, best-before date
2. Urgency-sorted list with expired / expiring-soon / fresh color coding
3. Local reminder notifications a configurable number of days before best-before
4. Mark item Used or Wasted — both feed a waste/savings log
5. "Use It Up" recipe suggestions matched from a bundled local recipe set
6. Waste & savings dashboard (money + weight, 30/90-day windows)
7. JSON export/import to move a pantry between devices

## Differentiators
1. Local-first, no account — every competitor of note is account-based and cloud-synced; ShelfLife works fully offline and never transmits pantry data, which is a clear trust and onboarding-speed advantage
2. No barcode dependency — barcode flows break on loose produce, leftovers, and non-US products; ShelfLife's fast manual quick-add plus category presets covers the items barcodes miss
3. Waste-as-money framing — most apps stop at reminders; ShelfLife closes the loop with a savings dashboard that turns "use it up" into a visible running total, which is the behavior-change hook competitors lack

## Profitability
**Model:** One-time unlock ($3.99) for the savings dashboard, multi-location filtering, and JSON sync; core tracking and reminders stay free forever. No subscription, no ads — the privacy-first positioning rules both out. Optional later: a paid recipe pack expansion.

**Estimate:** A reminder utility with a viral "I saved $X" share card can plausibly reach 150K installs in 18 months; at a 6% unlock rate × $3.99 that is ~$36K, with a recipe-pack attach adding modest upside. This is a portfolio/credibility piece more than a venture-scale bet — strong as a flagship privacy-first utility.

## Build Ease: 5/5
Pure client-side CRUD over localStorage, date math, a static recipe-ingredient match, and the Web Notifications API — all well-trodden. No backend, no third-party API, no auth. The only real care points are notification permission UX and timezone-safe date comparisons.

## Legal Risks
- Food-safety liability — best-before dates are quality guidance, not safety guarantees; the app must carry a visible disclaimer and never imply it certifies whether food is safe to eat
- Notifications — must request permission with a clear explanation and degrade gracefully when denied; no dark patterns
- Data — keeping everything on-device sidesteps GDPR/CCPA data-controller obligations; this must stay true, so no analytics or telemetry may be added
- Recipe content — the bundled recipe set must be original or properly licensed; do not scrape recipe sites
</content>
