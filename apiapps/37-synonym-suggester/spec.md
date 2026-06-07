# Synonym Suggester for Non-Native Writers

## Tagline
Write with confidence in English — get context-aware synonym suggestions that sound natural to native speakers.

## Target Market
Non-native English-speaking professionals and freelancers — particularly in Europe and Southeast Asia — who write business emails, content, or proposals in English and want to avoid repetition and sound more natural.

## Problem
Non-native English writers often over-rely on a limited vocabulary and repeat the same words, making their writing feel monotonous or unnatural. Standard thesaurus tools return word lists without context, leading to awkward substitutions that native speakers immediately notice. There is no tool that explains the nuance between synonyms and recommends the most natural choice for a given context.

## Solution
A web app where users paste a sentence or paragraph, highlight a word, and receive synonym suggestions ranked by naturalness in that specific context — with a brief explanation of the nuance difference between each option (e.g., "use 'obtain' in formal writing, 'get' in casual communication").

## Core Features (MVP)
- Word highlight and synonym fetch from pasted text
- Synonyms ranked by usage frequency and contextual fit
- Nuance explanation for top 3 synonyms (formality level, connotation note)
- One-click word replacement in the text editor
- Formality mode toggle (business email vs. casual vs. academic)

## API Used
- Merriam-Webster Thesaurus API — provides synonym lists with sense groupings, antonyms, and related words with editorial context notes for natural language guidance

## Monetization
Freemium — 30 synonym lookups/day free; Pro at $9/month for unlimited lookups, nuance explanations, formality mode, and text history.

## Tech Stack Suggestion
Next.js + Supabase + OpenAI API (for nuance explanations)

## MVP Scope
In scope: text editor with highlight-to-lookup, synonym list, nuance notes, one-click replacement, formality toggle. Out of scope: full grammar/spell check, browser extension, real-time as-you-type suggestions, multi-language support in v1.
