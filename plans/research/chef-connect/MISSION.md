# MISSION.md — chef-connect

## What This Builds

A two-sided marketplace connecting home chefs with food lovers in local communities. Chefs list their menus, set availability, and receive orders. Customers browse chef profiles, place orders with pickup or delivery options, and pay via Stripe Connect. Delivery is dispatched through the DoorDash Drive API. The platform takes a 15% commission on every order. Chef Pro ($9.99/mo) unlocks a featured listing and analytics dashboard.

## Primary Users

- **Home chefs:** Passionate home cooks who want to monetize their cooking, build a local customer base, and manage orders without operational overhead.
- **Food lovers:** Local customers looking for authentic, home-cooked food as an alternative to restaurants.

## In Scope

- Chef profiles with photo, bio, menu items, dietary tags, and availability schedule
- Menu management (item name, description, price, dietary flags: vegan, halal, gluten-free, etc.)
- Order placement with pickup or delivery option
- DoorDash Drive API integration for delivery dispatch
- Stripe Connect for split payments (chef payout + platform commission)
- 15% platform commission on every order (hardcoded, never modified by agents)
- Chef verification: food handler certification upload + admin review workflow
- Chef must have verified status before accepting orders
- Pre-order scheduling (order placed in advance for future pickup/delivery)
- Chef Pro tier ($9.99/mo): featured listing in search results, order analytics dashboard
- Food safety disclaimer displayed on all pages
- Customer reviews and ratings (post-delivery)

## Out of Scope

- Restaurant or commercial kitchen accounts (home chefs only)
- Grocery or ingredient delivery
- Catering for events over 50 people
- Native mobile apps (Capacitor shell is web-only PWA)
- In-app messaging between chef and customer
- Subscription meal plans
- Multi-city or franchise expansion tooling
- Chef background checks beyond food handler certification

## Immutable Constraints

1. **Commission rate is 15% — hardcoded forever.** The commission calculation lives in `api/src/payments/commission.service.ts`. Agents must never modify this file or the commission rate constant for any reason.
2. **No chef may accept orders without verified status.** Verification status is checked server-side in the order guard. Agents must not weaken, bypass, or conditionalize this check.
3. **Chef verification documents are stored encrypted.** Plaintext certificate files must never be stored. Encryption logic lives in `api/src/verification/`. Agents must not modify it.
4. **DoorDash Drive credentials are never in the frontend.** All DoorDash Drive API calls are made exclusively from `api/src/delivery/`. Agents must not expose DoorDash keys to the client.
5. **Stripe Connect payout logic must not be modified without human approval.** Logic lives in `api/src/payments/`. Agents must not change the payout split, transfer timing, or Stripe Connect configuration.
6. **Food safety disclaimer is mandatory on all pages.** Agents must not remove or conditionalize the disclaimer component.
7. **Chef Pro pricing is hardcoded at $9.99/month.** Agents must never alter Stripe pricing constants or price IDs.
