# Comic Book Release Tracker for Comic Shops

## Tagline
Never miss a new issue — give your comic shop customers automated pull list alerts powered by Marvel's official data.

## Target Market
Independent comic book shops that operate pull list services and want to reduce manual effort and improve customer retention through automated notifications.

## Problem
Comic shop owners manually compile weekly new release lists and notify pull list customers by phone, email, or handwritten notes — a process that is time-intensive and error-prone. Customers miss issues when shops forget to notify them, leading to returns, frustration, and lost sales. There is no purpose-built pull list management tool connected to official publisher release data.

## Solution
The app syncs with the Marvel API to track upcoming and newly released issues by character, series, and creator. Customers register their pull lists and receive automated email alerts when their titles are released. Shop staff get a consolidated weekly pull list dashboard to prepare orders efficiently.

## Core Features (MVP)
- Marvel API-powered series and character browser
- Customer pull list registration (self-service via shareable shop link)
- Automated weekly new release email alerts per customer pull list
- Staff weekly pull dashboard (who gets what, grouped by customer)
- Release calendar view for the next 4 weeks

## API Used
- Marvel API — comic series, issue metadata, release dates, character data, and creator information

## Monetization
SaaS subscription — $49/month per shop (unlimited pull list customers + automated alerts + dashboard).

## Tech Stack Suggestion
Next.js + Supabase + Resend + Vercel Cron + Tailwind CSS.

## MVP Scope
Included in v1: Marvel API series browser, customer pull list self-registration, weekly email alerts, staff dashboard, release calendar.
Out of scope: DC/Image Comics integration, online ordering, payment processing, inventory management, loyalty rewards.
