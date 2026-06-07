# Sports Score Auto-Post for Sports Bars

## Tagline
Keep your social media buzzing on game day — automatically post live scores and match results the moment they happen.

## Target Market
Sports bars, fan clubs, and sports-focused hospitality venues that want to drive foot traffic and social engagement on game days.

## Problem
Sports venues know that timely social posts on game days drive foot traffic and engagement, but staff are too busy running the floor to post scores manually. Hiring a social media manager just for game day is cost-prohibitive for small venues. Missing the moment of a big goal or final score means losing the viral window.

## Solution
A web app where sports bars select their favorite teams and social accounts, and the app automatically posts live score updates, goal alerts, and final results to their Facebook and Instagram pages — complete with customizable branded templates — the moment events happen.

## Core Features (MVP)
- Team selection across major sports leagues (football, basketball, baseball)
- Social account connection (Facebook Page, Instagram Business)
- Real-time score and event polling via TheSportsDB
- Branded post template editor with logo and color customization
- Configurable post triggers: kickoff, goal/score, halftime, full-time

## API Used
- TheSportsDB API — provides live scores, match events, team data, and league schedules for hundreds of sports leagues worldwide

## Monetization
Subscription — $29/month per venue for up to 3 teams and 2 social accounts; $59/month for unlimited teams and accounts.

## Tech Stack Suggestion
Next.js + Supabase + BullMQ (Redis) + Meta Graph API

## MVP Scope
In scope: team/league selection, Facebook/Instagram posting, score polling, template editor, trigger configuration. Out of scope: Twitter/X integration, video highlight posting, ticket sales CTAs, multi-location management in v1.
