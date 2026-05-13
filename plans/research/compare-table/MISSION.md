# Mission

## What This Builds

A web/PWA comparison tool that lets users build structured multi-item tables with weighted scoring criteria. Users add items (products, candidates, options) as columns and define criteria as rows with importance weights. Each cell gets a score; the app computes a weighted total. An AI assistant (Claude API) can suggest relevant criteria based on what the user is comparing. Finished comparisons can be shared via a shareable encoded URL or exported to PDF.

## Primary Users

People making considered purchase decisions (laptops, SaaS tools, apartments), hiring managers comparing candidates, teams evaluating vendors, or anyone who wants to move beyond gut feel into structured reasoning. Solves the problem of mentally juggling multiple variables across multiple options without a framework.

## In Scope (Factory Can Build)

- Comparison table UI — items as columns, criteria as rows, score cells (1–10)
- Importance weight per criterion (1–5 stars or numeric)
- Weighted total score calculation, auto-ranked column highlighting
- AI criteria suggestions via Claude API (triggered by user, not auto-run)
- Pre-built comparison templates (laptops, job offers, apartments, SaaS tools, etc.)
- Share via public encoded URL (all data encoded in URL, no server)
- PDF export (client-side, jsPDF or Pdfmake)
- Local SQLite storage (sql.js) — all comparisons stored in browser
- Freemium: Free tier = max 3 saved comparisons; Pro = unlimited
- Bug fixes, tests, documentation

## Out of Scope (Never Build)

- Backend server or API of any kind (AI calls go directly from frontend to Claude API)
- User accounts or authentication
- Storing comparison data on any server — local only
- Real-time collaboration or shared editing
- Exporting to formats other than PDF (no Excel, no Google Sheets integration)
- Embedding or iframe sharing
- Payment processing or subscription management (billing handled externally)

## Immutable Constraints (Cannot Change, Ever)

- Governance files (MISSION.md, CLAUDE.md, FACTORY_RULES.md) are human-only — agents must never modify them
- All comparison data must remain local-only — never sent to any server except as encoded URL fragment
- `VITE_ANTHROPIC_API_KEY` is dev-only; production deployments must use a backend proxy — agents must add a `TODO: use proxy in prod` comment wherever the key is used directly
- The share link must use URL fragment (`#data=...`) not query params — fragments are never sent to servers
- Free tier limit (3 comparisons) must be enforced client-side and never bypassed without Pro flag
- PDF export must run entirely client-side — no server-side rendering
