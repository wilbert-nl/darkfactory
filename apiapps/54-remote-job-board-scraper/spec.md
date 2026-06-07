# Remote Job Board Scraper for Niche Industries

## Tagline
A curated remote job feed for specialized industries that generic job boards completely ignore.

## Target Market
Niche staffing agencies and independent recruiters placing candidates in specialized sectors such as legal tech, biotech, climate tech, or edtech.

## Problem
Generic remote job boards aggregate all industries together, making it nearly impossible for niche recruiters to efficiently surface relevant remote roles for their specific vertical. Candidates in specialized fields waste hours filtering irrelevant listings. Recruiters who focus on niche placement have no affordable tool that surfaces only the roles they care about.

## Solution
A filtered remote job feed that pulls listings from Remotive's API, lets users configure industry and keyword filters, and delivers a clean curated digest of matching remote roles. Recruiters can maintain multiple niche feeds for different client specializations and share them as branded job boards.

## Core Features (MVP)
- Remotive job feed with configurable category and keyword filters
- Multiple saved filter profiles for different niche verticals
- Daily or weekly email digest of new matching remote jobs per filter profile
- Shareable branded job board page per filter profile (public URL)
- Bookmark and flag jobs for candidate matching notes

## API Used
- Remotive API — provides structured remote job listings with category, tags, company info, and job description data refreshed regularly

## Monetization
SaaS subscription — $39/month for up to 3 filter profiles; $79/month for unlimited profiles and branded job board pages.

## Tech Stack Suggestion
Next.js + Supabase + Resend

## MVP Scope
**Included in v1:** Remotive feed integration, keyword and category filters, saved filter profiles, daily/weekly digest email, shareable public job board page, bookmarking with notes.
**Out of scope:** Candidate database, ATS sync, resume parsing, direct job application tracking, scraping of non-API job boards.
