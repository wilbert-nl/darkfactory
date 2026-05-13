# MISSION.md — synthetic-summer

## What This Builds

A web wellness platform for people living in cold, dark climates. It delivers a virtual summer experience through ambient beach soundscapes, warm-light CSS overlays, curated tropical content, seasonal mood tracking, and Pomodoro work sessions themed around summer energy. Pro users get Spotify and Apple Music playlist sync.

## Primary Users

- People in high-latitude or cold-climate regions experiencing seasonal mood dips (SAD-adjacent)
- Remote workers seeking focus and warmth during grey winter months
- Wellness-conscious users who track mood and light exposure
- Spotify or Apple Music subscribers who want ambient + music integration

## In Scope

- Ambient soundscapes (beach, rainforest, tropical storm) served as static audio files
- Warm-light color overlay implemented in CSS — no hardware required
- Curated tropical photo and video content feed
- Seasonal wellness plan generator with daily mood log and light exposure tracking
- Pomodoro timer with summer-themed sessions and break screens
- Spotify Web Playback SDK integration (requires user's Spotify Premium account)
- Apple Music via MusicKit JS integration
- Mood tracking stored locally first; synced to backend for Pro users
- Free tier: 3 soundscapes, basic mood log (local only)
- Pro ($4.99/mo): full soundscape library, wellness plan, Spotify/Apple Music sync

## Out of Scope

- Hardware light therapy device control or Bluetooth integration
- Clinical mood disorder screening or treatment recommendations
- Native mobile app (web-only in MVP)
- Social or community features
- Video call or group wellness sessions
- Wearable device data import (Fitbit, Apple Watch, etc.)

## Immutable Constraints

1. **"Not a substitute for medical light therapy" disclaimer** must appear on the wellness plan page and any mood recommendation UI — agents must never remove, shorten, or soften it.
2. **Spotify OAuth credentials must never appear in the frontend bundle** — use PKCE flow; token exchange handled server-side.
3. **Apple Music developer token must be generated server-side** — never hardcoded in client code.
4. **Mood data is sensitive** — encrypted at rest, never shared with third parties, never used for advertising targeting.
5. **Pro pricing ($4.99/mo) and free tier limits (3 soundscapes) are hardcoded** — agents must never alter these values.
