# Breach Alert Monitor for SMB Email Lists

## Tagline
Know the moment any of your employees' emails appear in a data breach — before attackers do.

## Target Market
IT managers and operations leads at small and medium businesses (10–200 employees) who lack enterprise security tooling budgets.

## Problem
SMB employees reuse passwords across personal and work accounts, meaning a breach of any consumer site can compromise corporate credentials. Most businesses only discover a breach months later via news coverage or after an actual attack. Manually checking each email on HaveIBeenPwned is impractical at team scale.

## Solution
A SaaS dashboard where businesses upload or sync their employee email list and receive instant alerts whenever any email appears in a newly reported breach, with a per-employee summary of which services were compromised and what data types were exposed.

## Core Features (MVP)
- CSV or Google Workspace directory email import
- Automated daily breach scan via HaveIBeenPwned API
- Email + Slack alert on new breach detection
- Per-employee breach history and exposed data-type summary
- Remediation checklist (force password reset, enable MFA) per alert

## API Used
- HaveIBeenPwned API (Domain Search + Breach endpoints) — returns all breaches associated with a given email or domain, including breach date, data classes exposed, and breach description

## Monetization
Per-seat SaaS — $2/employee/month, minimum 10 seats ($20/month); annual billing at 20% discount.

## Tech Stack Suggestion
Next.js + Supabase + Resend (email alerts) + Inngest (scheduled jobs) + Vercel.

## MVP Scope
Included in v1: email list import, daily scheduled scans, breach alerts via email and Slack, breach history dashboard, remediation checklist.
Out of scope: Active Directory sync, SSO, SIEM integrations, custom scan frequency on free tier.
