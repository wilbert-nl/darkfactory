# Court Case Tracker for Legal Firms

## Tagline
Monitor case dockets and new filings across federal courts automatically — so nothing slips through the cracks.

## Target Market
Small law firms and solo attorneys (1–15 lawyers) practicing federal litigation, appellate work, or legal research who need to track case developments without a full-time docket clerk.

## Problem
Attorneys managing federal litigation must monitor court dockets for new filings, orders, and hearing dates — but this requires manually checking PACER or CourtListener for every active case, which is time-consuming and easy to miss during busy periods. A missed motion deadline or unnoticed adverse ruling can have serious consequences for clients and the firm's malpractice exposure.

## Solution
A case monitoring dashboard where attorneys add federal case citations they want to track and receive immediate alerts whenever a new docket entry, opinion, or filing appears via the CourtListener API — with a unified timeline view of all active cases, deadline reminders, and case document storage.

## Core Features (MVP)
- Case search and add by case name, citation, or CourtListener case ID
- Automated docket monitoring: alerts on new filings, orders, and opinions
- Unified case timeline across all tracked cases
- Deadline reminders (configurable days before hearing/filing dates)
- Case document storage: save downloaded filings with notes

## API Used
- CourtListener API — provides access to federal court dockets, opinions, oral arguments, and case metadata from PACER and direct court feeds across all US federal circuits and district courts

## Monetization
Per-case SaaS — $5/case/month monitored; Firm plan at $99/month for unlimited cases and up to 10 user seats.

## Tech Stack Suggestion
Next.js + Supabase + CourtListener API + Inngest (daily docket polling) + Resend + Vercel.

## MVP Scope
Included in v1: case search and tracking, docket change alerts, unified timeline, deadline reminders, document storage with notes.
Out of scope: PACER direct integration (relies on CourtListener), state court monitoring, billing/time tracking, AI legal research.
