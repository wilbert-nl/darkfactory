# Password Strength Checker Widget

## Tagline
Embed a real-world breach-aware password strength meter into any app in one script tag.

## Target Market
Small SaaS founders and indie developers who need a production-ready password UX component without building it from scratch.

## Problem
Built-in browser password meters only check character rules and ignore whether a password has actually been compromised in a data breach. Developers either skip strength feedback entirely or ship naive rule-based meters that give a false sense of security. Integrating HaveIBeenPwned checks from scratch requires CORS-safe k-anonymity hashing that most small teams get wrong.

## Solution
A hosted JavaScript widget that developers embed with a single script tag, providing real-time password strength scoring combined with a k-anonymity HaveIBeenPwned lookup to flag genuinely compromised passwords — with a visual meter, messaging, and a customizable color theme.

## Core Features (MVP)
- Drop-in embeddable script tag widget
- Real-time strength scoring (zxcvbn algorithm)
- HaveIBeenPwned k-anonymity API check on blur (no full password sent)
- Customizable color theme via data attributes
- React and vanilla JS NPM packages alongside the CDN version

## API Used
- HaveIBeenPwned Pwned Passwords API — checks whether a password hash prefix has appeared in known breach datasets without exposing the full password

## Monetization
Usage-based SaaS — free up to 10,000 checks/month; Growth at $19/month for 250,000 checks; Business at $79/month for unlimited checks and white-label branding removal.

## Tech Stack Suggestion
Next.js (docs site) + Cloudflare Workers (edge proxy for HIBP API) + Stripe + npm package.

## MVP Scope
Included in v1: CDN script, React NPM package, strength meter, HIBP check, theme customization, usage dashboard.
Out of scope: Vue/Angular packages, SSO, team seats, audit log exports.
