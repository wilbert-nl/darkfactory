# ChefConnect — Research Brief

## What It Is
A two-sided marketplace connecting home chefs who list and sell meals with food lovers who order them, fulfilled via pickup or third-party delivery integration.

## Competitors
| Name | Description |
|------|-------------|
| Shef | YC-backed, $100M+ raised from a16z; leading US home food marketplace; operates in major metros |
| DishDivvy | Similar model, smaller scale, community-focused |
| Goldbelly | Artisan food brand shipping; not local/fresh meals |
| Foodnome | CA-only cottage food law compliance platform; niche regulatory focus |

## Market Size
$6B home restaurant market operating within the $1T US restaurant industry. All 50 US states now have cottage food laws (as of 2023), removing the primary legal barrier. Shef's $100M raise signals VC confidence in the category despite no clear market leader outside major metros.

## MVP Features
1. Chef profiles with menu listings, dietary tags, and pricing
2. Order placement with pickup or delivery option
3. DoorDash Drive API integration for on-demand delivery fulfillment
4. Customer and chef mutual reviews
5. Chef verification with food handler certificate upload
6. Pre-order scheduling (meals available on set days/windows)

## Differentiators
1. Niche ethnic cuisine focus — surface cuisines underrepresented in restaurants (Filipino, West African, regional Indian, etc.)
2. Subscription meal plans directly with a chef — recurring revenue for chefs, loyalty for customers
3. Chef income dashboard and marketing kit — retention tool that competitors underinvest in

## Profitability
**Model:** 15–25% marketplace commission on GMV; subscription meal plans add predictable volume
**Estimate:** 1,000 active chefs × $500/wk GMV = $500K/wk gross; at 20% take rate = ~$5M ARR

## Build Ease: 3/5
AI handles menu description generation, dietary filtering, and cuisine tagging well. Hard parts: food safety compliance workflows, DoorDash Drive integration, and state-by-state legal onboarding for chefs (cottage food rules, hot meal restrictions).

## Legal Risks
- Cottage food laws vary by state: hot cooked meals remain illegal for home sale in some states; must build state-specific chef eligibility logic
- Foodborne illness liability: platform may bear reputational and legal exposure even if indemnified contractually
- Commercial kitchen requirements: some states require certified kitchen even for cottage food; verification is operationally costly
- Insurance: chefs need food liability coverage; platform may need to provide or mandate it
