# PLAN: ChefConnect
_Status: Draft — Resolve open questions before starting implementation_

> **For Claude in next session:** Read the open questions below and ask the user to resolve them one at a time before writing any code. Mark each resolved one with ✅.

## Overview
ChefConnect is a two-sided marketplace connecting home chefs with food lovers, with third-party delivery integration. The opportunity is in the $6B home food market that now has legal coverage across all 50 US states, yet Shef only operates in a handful of metros — leaving most of the country underserved. A niche ethnic cuisine focus and chef retention tools differentiate from the incumbent.

## Recommended Stack
- **Frontend:** Vue 3 + Quasar with Capacitor (mobile-first; ordering is a mobile use case)
- **Backend:** NestJS with REST API; Bull/Redis queue for order processing and delivery dispatch
- **Database:** PostgreSQL (users, chef_profiles, menus, orders, subscriptions, reviews)
- **Auth:** Clerk with Google/Apple social login
- **Payments:** Stripe Connect (marketplace payouts to chefs, deposit splits, subscription billing)
- **AI:** Claude API — menu description generation, dietary tag extraction from ingredient lists, chef profile copywriting

## MVP Scope
- Chef onboarding with profile, menu listings, food handler cert upload, and availability windows
- Customer browse by location, cuisine type, and dietary preference
- Order placement with pickup or delivery selection; DoorDash Drive API for delivery fulfillment
- Mutual reviews post-order
- Basic chef income dashboard (orders, revenue, ratings)

## Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] NestJS monorepo with PostgreSQL; schema: users, chef_profiles, menus, menu_items, orders, reviews
- [ ] Clerk auth with Google/Apple; role-based: customer vs. chef
- [ ] Chef onboarding flow: profile, food handler cert upload (S3), service area selection
- [ ] State eligibility check: build lookup table for cottage food law rules by state (hot meals allowed Y/N)
- [ ] Vue 3 + Quasar mobile scaffold with Capacitor packaging

### Phase 2 — Core Features (Week 3–5)
- [ ] Menu management: items with photos, prices, portion sizes, dietary tags, daily availability
- [ ] AI menu description generation via Claude API from item name + ingredients
- [ ] Customer browse: location radius filter, cuisine type, dietary filter, pickup vs. delivery toggle
- [ ] Order flow: cart, checkout via Stripe, pickup time or delivery address
- [ ] DoorDash Drive API integration for on-demand delivery dispatch
- [ ] Redis + Bull order processing queue: status updates (placed → confirmed → ready → picked up)
- [ ] Mutual review system post-order completion

### Phase 3 — Launch Prep (Week 6–8)
- [ ] Chef income dashboard: daily/weekly earnings, order history, payout schedule
- [ ] Subscription meal plan feature: customers subscribe to a chef for weekly recurring orders
- [ ] Chef marketing kit: shareable profile link, social-ready menu card image generation
- [ ] Stripe Connect onboarding for chef payouts with 1099 reporting
- [ ] Push notifications: order confirmed, delivery dispatched, new review
- [ ] Legal review: state-specific onboarding restrictions, terms of service, foodborne illness liability disclaimer

## Open Questions ❓
> Resolve these before implementation. Ask one at a time.

- [ ] ❓ **Launch geography:** Start in one US city (validate supply + demand density) or Philippines first (lower legal complexity, strong home cook culture)?
- [ ] ❓ **Delivery model:** DoorDash Drive API only, or also build an in-house delivery option for chefs who have their own drivers?
- [ ] ❓ **Chef verification depth:** Food handler cert upload (self-reported) or active verification with county health departments?
- [ ] ❓ **Cuisine niche:** Launch as general marketplace or anchor on one cuisine vertical (e.g., Filipino food) to drive initial supply density?
- [ ] ❓ **Subscription meal plans:** In MVP or Phase 2 feature? Adds complexity but is the key chef retention differentiator.
- [ ] ❓ **Insurance requirement:** Require chefs to carry food liability insurance before listing, or provide embedded insurance per transaction via a partner?

## Top Risks
1. **Legal and compliance overhead kills solo execution** — state-by-state cottage food rules and foodborne liability make this the highest legal risk in the set; mitigation: launch in one jurisdiction with a lawyer on retainer before expanding
2. **Supply-side cold start** — no chefs means no customers means no chefs; mitigation: recruit 20–30 chefs manually before public launch in target city; offer 0% commission for first 3 months

## Dark Factory Readiness
**Ready:** Partial
**Notes:** Marketplace architecture is buildable, but state-specific legal onboarding logic and DoorDash Drive API integration add significant complexity. Founder must resolve launch geography and legal strategy before handing to the factory. Insurance and verification decisions gate the chef onboarding flow design.
