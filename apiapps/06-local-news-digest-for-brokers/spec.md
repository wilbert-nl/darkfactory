# Local News Digest for Brokers

## Tagline
A curated daily news briefing on local developments that affect your real estate or insurance portfolio.

## Target Market
Independent real estate brokers and small property/insurance agencies managing assets in specific metro areas.

## Problem
Brokers need to stay informed about local news — zoning changes, business openings, crime reports, infrastructure projects — that directly affect property values and client decisions. Monitoring local news manually across multiple sources is time-consuming and easy to miss. Generic national news aggregators do not provide the neighborhood-level insight brokers need.

## Solution
The app monitors selected local news sources via keyword and location filters, curates the most relevant articles daily, and delivers a clean digest to the broker's inbox each morning. Brokers can tag articles to client accounts for follow-up.

## Core Features (MVP)
- Location and keyword-based news filter setup (city, neighborhood, topics)
- Daily digest email with top 5-10 relevant articles
- In-app news feed with article preview and source attribution
- Article tagging and saving for client follow-up
- Custom alert for breaking news matching high-priority keywords

## API Used
- NewsAPI — provides access to real-time news articles from thousands of sources, filterable by keyword, language, and date

## Monetization
Subscription — $39/month per user for daily digests across up to 3 locations; agency plan at $99/month for 5 users and 10 locations.

## Tech Stack Suggestion
Next.js + Supabase + Resend

## MVP Scope
Included in v1: keyword/location filter, daily digest email, in-app feed, article saving.
Out of scope: CRM integration, automated client email forwarding, sentiment analysis, social media monitoring.
