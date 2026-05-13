# Mission

## What This Builds

A Chrome/Firefox browser extension that reads YouTube comments aloud using the browser's Web Speech API (TTS). Users activate playback with a single click, select from available voices, control speed, and navigate comments via skip/pause/replay. Optionally, comments can be grouped by sentiment so users can hear positives first, skip negatives, or listen by tone.

## Primary Users

YouTube heavy users — commuters, multitaskers, visually impaired users, or anyone who wants to consume comment sections hands-free without watching the screen. Solves the problem of dense comment threads being inaccessible or inconvenient to read manually.

## In Scope (Factory Can Build)

- One-click TTS play button injected into YouTube comment section
- Voice selection from available browser speech synthesis voices
- Playback speed control (0.5×–2×)
- Skip forward/back by comment, pause/resume controls
- Sentiment grouping toggle (positive / neutral / negative ordering)
- Comment DOM reading — no YouTube API calls, reads rendered page content only
- Extension popup UI with playback queue and settings
- Keyboard shortcuts for play/pause/skip
- Settings persistence via `chrome.storage.local`
- Bug fixes, tests, docs

## Out of Scope (Never Build)

- YouTube API integration of any kind
- Any form of user data collection, analytics, or telemetry
- Uploading or syncing comments to any external server
- Auto-playing without an explicit user gesture
- Modifying or posting comments on behalf of the user
- Reading content outside of YouTube (no cross-site injection)
- Account system or login
- In-app purchases or paywalls (this is a free extension)

## Immutable Constraints (Cannot Change, Ever)

- Governance files (MISSION.md, CLAUDE.md, FACTORY_RULES.md) are human-only — agents must never modify them
- Extension manifest must remain Manifest V3
- Auto-play is strictly prohibited without a user gesture (click/keyboard)
- No data collection — zero telemetry, zero analytics, zero external requests
- Read YouTube DOM only — never call `youtube.com` APIs or any external API
- Content Security Policy must not be weakened in manifest.json
- `host_permissions` must be scoped to `*://*.youtube.com/*` only — never broadened
