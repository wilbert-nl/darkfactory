# CommentsReader — Research Brief

## What It Is
CommentsReader is a browser extension that reads YouTube comments aloud using text-to-speech, letting creators and super-fans browse comment sections hands-free while multitasking. No equivalent YouTube-native TTS product exists.

## Competitors
| Name | Description |
|------|-------------|
| Speechify | General-purpose TTS Chrome extension, 1M+ downloads, reads any webpage but not YouTube-comment-aware |
| Read Aloud / TTSReader | Chrome extensions for selected page text, no YouTube-native UX, requires manual text selection |
| Speak Subtitles for YouTube | Reads video captions/subtitles only, not comments |
| ElevenReader | High-quality TTS for articles and documents, not structured around comments |

No product exists specifically designed around the YouTube comment section experience.

## Market Size
YouTube: 2.7B+ monthly active users. TTS app market growing rapidly (Speechify valued at $1B+). Target micro-niche: YouTube creators monitoring their own comments and power-viewer super-fans who engage deeply with comment sections. Low total addressable market but browser extension revenue at small scale is well-proven. Extensions with 50K–200K active users can generate $100K–500K ARR on freemium models.

## MVP Features
1. Chrome and Firefox extension with one-click "Play Comments" button on any YouTube video page
2. Selectable sort order — Top Comments, Newest First, Creator Replies only
3. Natural TTS voice selection — 3–4 voice options via Web Speech API (free) or ElevenLabs (premium)
4. Playback speed control (0.75x, 1x, 1.25x, 1.5x, 2x)
5. Skip, pause, and replay individual comments; continuous queue playback
6. Filter options — minimum like threshold, hide comments under 10 words, hide replies

## Differentiators
1. YouTube-native structure awareness — understands comment nesting, handles pinned comments first, reads reply threads as conversations not flat text
2. Creator mode — creators listen to their own comment sections hands-free; auto-groups by sentiment (positive, negative, questions) using Claude classification
3. Podcast-style continuous playback — "Comment Podcast" reads the top 50 comments from a creator's recent playlist or channel, enabling passive consumption

## Profitability
**Model:** Freemium (20 comments/session free) → Pro $4.99/mo or $39/yr → Creator tier $9.99/mo with sentiment analytics → One-time lifetime $19.99 → B2B brand monitoring $99/mo
**Estimate:** 2K Pro subscribers × $4.99/mo = $120K ARR. 100 Creator subscribers × $9.99/mo adds $12K ARR. Lifetime deal launch on AppSumo can generate $30–80K in upfront revenue for early cash flow.

## Build Ease: 5/5
Browser extension using YouTube Data API v3 for comment fetching and Web Speech API or ElevenLabs for TTS. Small, well-scoped project with no infrastructure complexity. Claude generates the majority of extension code in a few focused sessions. Fastest path to an MVP of all six ideas — estimated 2–4 weeks for a solo developer.

## Legal Risks
- YouTube Terms of Service — API Terms prohibit building a "competing service"; a TTS reader could be challenged depending on how YouTube interprets competitive impact; must review carefully before monetizing
- YouTube DOM scraping violates ToS if API quotas are exceeded and the extension falls back to scraping; must stay within API quota limits
- GDPR edge case — routing public YouTube comment text through a third-party TTS API (ElevenLabs) may require disclosure in privacy policy
- Copyright of comments — comment text is technically authored by users; commercial TTS reproduction is an untested legal edge case; terms of service must address this clearly
