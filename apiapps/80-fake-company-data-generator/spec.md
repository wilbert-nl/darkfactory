# Fake Company Data Generator for QA Teams

## Tagline
Generate complete, realistic fake company datasets in seconds so your QA team can test every edge case without touching production data.

## Target Market
QA engineers and developer teams at SaaS companies who need structured, realistic company and employee test data for staging environments, load tests, and demo databases.

## Problem
QA teams either use production data (a privacy and compliance risk) or hand-craft fake datasets that are unrealistic, lack diversity, and fail to expose edge cases. Building and maintaining custom data factories is a recurring engineering burden with no long-term value. There is no dedicated tool that generates structured company datasets — not just individual user records.

## Solution
The app combines RandomUser API (for employee profiles) with Faker.js-style synthetic company data to generate complete organizational datasets: company name, address, industry, employee roster with roles and departments, and contact details. Output is configurable and exportable in multiple formats ready for immediate use in test environments.

## Core Features (MVP)
- Company profile generation (name, industry, size, address, phone, website, founding year)
- Employee roster generation using RandomUser API (configurable count, department, role)
- Organizational structure output (hierarchy: CEO > managers > staff)
- Export as JSON, CSV, or SQL INSERT (with schema options)
- Saved dataset templates for repeatable test scenarios

## API Used
- RandomUser API — realistic employee profile data (name, email, avatar, address, phone)
- Faker.js (server-side) — synthetic company names, industries, addresses, and business metadata

## Monetization
Freemium — Free (1 company, up to 25 employees, 3 exports/day); $19/month (unlimited companies + 500 employees per dataset + all export formats + saved templates).

## Tech Stack Suggestion
Next.js + Supabase + @faker-js/faker (server-side) + Tailwind CSS.

## MVP Scope
Included in v1: company profile generation, employee roster, org hierarchy, JSON/CSV/SQL export, dataset templates.
Out of scope: real company data import, database connector (direct DB push), mock API server, compliance data masking (PII), team sharing, webhooks.
