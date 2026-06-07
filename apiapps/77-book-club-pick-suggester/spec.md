# Book Club Pick Suggester for Libraries

## Tagline
Help library book clubs choose their next read in minutes with data-driven suggestions tailored to their group's tastes.

## Target Market
Public libraries and community library branches that run book club programs and need to keep selections fresh, diverse, and appropriate for their audience.

## Problem
Library book club coordinators struggle to find new titles that match the group's reading history, preferred genres, and appropriate complexity level. Manually browsing catalogs is time-consuming and often produces the same well-known titles. There is no tool designed for library coordinators that links book discovery directly to in-library availability data.

## Solution
Coordinators input past picks and genre preferences; the app queries Open Library API for matching titles and surfaces suggestions with cover art, author bio, subject tags, and reading level signals. The coordinator saves a shortlist, shares it with club members for a vote, and logs the final pick in the club's history.

## Core Features (MVP)
- Genre and theme preference input
- Book suggestions from Open Library API based on subject/genre search
- Book detail view (cover, author, synopsis, subject tags, publication year)
- Shortlist builder with member voting link (shareable URL)
- Club reading history log

## API Used
- Open Library API — book metadata including titles, authors, subjects, cover images, and edition data

## Monetization
SaaS subscription — Free for single book clubs; $29/month per library branch (multiple clubs + history + member voting).

## Tech Stack Suggestion
Next.js + Supabase + Resend (voting link emails) + Tailwind CSS.

## MVP Scope
Included in v1: genre/theme input, book suggestions, book detail view, shortlist builder, member voting link, reading history.
Out of scope: library catalog availability check, e-book integration, AI-generated discussion questions, patron-facing app, acquisition recommendations.
