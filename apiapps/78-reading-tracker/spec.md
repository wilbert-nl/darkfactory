# Reading Tracker for Schools

## Tagline
Give students a motivating, structured place to log their reading — and give teachers instant visibility into progress.

## Target Market
Primary and secondary schools, and independent tutoring centers, looking for a simple reading log tool that replaces paper-based systems without requiring a full LMS.

## Problem
Teachers spend significant time collecting and reviewing paper reading logs and have no real-time visibility into whether students are on track with reading goals. Students lose paper logs, forget to fill them in, and have no engaging way to track their own progress. Existing tools are either over-engineered LMS integrations or consumer apps not designed for school administration.

## Solution
Students log books they are reading or have finished by searching Open Library; the app auto-fills metadata (author, page count, genre) and tracks reading progress. Teachers get a class dashboard showing completion rates, pages read, and genre diversity — accessible without asking students to install an app.

## Core Features (MVP)
- Book search and add via Open Library API (title or ISBN)
- Reading status tracking (reading, finished, want to read) with progress percentage
- Student reading history and stats (books completed, pages read, genre breakdown)
- Teacher class dashboard with per-student and class-wide summaries
- Reading goal setting with progress bar (e.g., 20 books this year)

## API Used
- Open Library API — book metadata including title, author, page count, subjects, and cover images

## Monetization
SaaS subscription for schools — $2/student/month (billed annually per class); $199/month per school (unlimited classes).

## Tech Stack Suggestion
Next.js + Supabase + Tailwind CSS + Resend (weekly progress digest for teachers).

## MVP Scope
Included in v1: book search, reading status and progress tracking, student history and stats, teacher dashboard, reading goal setting.
Out of scope: reading assessments/quizzes, e-book reader integration, parent portal, district-wide reporting, gamification badges.
