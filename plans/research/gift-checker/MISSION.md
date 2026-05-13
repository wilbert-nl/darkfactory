# MISSION.md — gift-checker

## What This Builds

A two-way gift tracking app where users maintain wishlists, log gifts given and received, and coordinate within groups to prevent duplicate gifts. Group members can claim/reserve wishlist items without the recipient knowing who claimed what. Claude Haiku powers AI gift suggestions for Pro users.

## Primary Users

- Families and friend groups coordinating gifts for birthdays, holidays, or special events
- Individuals who want to track gifts received and avoid re-gifting

## In Scope

- User profiles with event types (birthday, holiday, anniversary) and wishlists
- Wishlist items with name, URL, price range, priority
- Mark items as received
- Group invite system with expiring invite links (7-day expiry)
- Claimed/reserved flag: group members mark items they intend to buy
- Visibility rules: wishlist owners never see who claimed their items (surprise preserved)
- AI gift suggestions via Claude Haiku (Pro) — suggestions visible only to the requester, never to the recipient
- Push notifications for upcoming events and claim conflicts (@capacitor/push-notifications)
- Free tier: 1 group, 10 wishlist items
- Pro tier ($3.99/mo via Stripe): unlimited groups, AI suggestions, reminder notifications
- Backend required for real-time claimed-flag sync across group members

## Out of Scope

- Public wish registries or shareable links to non-group members
- Purchasing or affiliate checkout flows
- Product search or price comparison
- Social feeds or discovery features
- Secret Santa random assignment (may be added later as a separate issue)

## Immutable Constraints

1. Wishlist owners must never be able to see who has claimed their items — this is a core privacy invariant; claimed flags are visible to group members only, never to the recipient.
2. AI gift suggestions must not reveal the identity of the requester or gift intent if the recipient views their own profile.
3. Group invite links expire in exactly 7 days — no extension mechanism allowed.
4. Claimed flag sync requires the backend — local-only claimed state for shared groups is not permitted.
5. Pro pricing ($3.99/mo) is hardcoded — agents must never change it.
