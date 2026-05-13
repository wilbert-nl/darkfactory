# AudioSwap — Research Brief

## What It Is
A focused web tool for replacing, swapping, or dubbing audio in video files — letting creators mute original audio, drop in replacement music or voiceovers, and re-export without a full video editor.

## Competitors
| Name | Description |
|------|-------------|
| Kapwing | Full online video editor with a Replace Audio tool; free tier + Pro $16/mo |
| VEED.io | Browser-based video editor with audio replacement, dubbing, and subtitles; from $18/mo; widely used by creators |
| InVideo AI | AI-powered video creation with dubbing and voice translation; from $20/mo |
| LALAL.AI | Stem separation and voice cloning for dubbing; usage-based pricing |
| YouTube Studio | Built-in audio swap for royalty-free music from YouTube's own library; no export for external use |

## Market Size
Video editing software market at $2.5B in 2025, 8% CAGR. YouTube dubbing and localization is an exploding use case. YouTube's own Gemini-powered dubbing tool (2024) has poor user reviews, signaling a quality gap. "Replace audio in video" gets 40K–60K monthly Google searches. Multilingual content creators in SEA, LatAm, and India are the primary demand driver for audio dubbing tools.

## MVP Features
1. Import video via URL or file upload
2. Mute or detach original audio with one click
3. Upload replacement audio (MP3/WAV) or record a live voiceover in-browser
4. Auto-sync audio length to video (stretch/compress or trim to fit)
5. Royalty-free music library for background music replacement
6. Preview with adjustable audio levels and fade in/out controls
7. Export final MP4/MOV with merged audio track

## Differentiators
1. YouTube URL to instant audio swap workflow: competitors require uploading the full video file; paste URL, swap audio, re-export is dramatically faster for creators
2. AI voice matching for dubbing: ElevenLabs or Cartesia voice cloning maintains the creator's vocal identity when recording in other languages
3. Stem separation built-in: keep background music, remove only the voice track, then re-record a cleaner voiceover — competitors charge separately for this

## Profitability
**Model:** Usage-based plus subscription. Free: 5 exports/mo with watermark. Creator: $12/mo unlimited up to 30 minutes. Pro: $29/mo with AI dubbing and voice cloning. Strong SEO opportunity for "replace audio in video online."
**Estimate:** 10K–50K free users × 3–5% paid conversion = $4K–20K MRR in 12–18 months. Mid-tier SaaS ceiling of approximately $5M ARR as a standalone product.

## Build Ease: 5/5
FFmpeg handles all video and audio manipulation server-side. S3 plus Lambda or a queue worker manages processing jobs. AI adds value through Whisper for transcription, ElevenLabs API for voice cloning, and intelligent audio sync logic. No frontier AI research required — all mature APIs. Most technically tractable idea in this batch; hardest part is the URL-based video import workflow and DMCA compliance.

## Legal Risks
- DMCA liability: users replacing copyrighted music with other copyrighted music and re-uploading to YouTube — requires strict ToS, DMCA takedown process, and music rights verification before export
- Deepfake audio and voice cloning misuse for fraud and impersonation — consent agreement required before any voice cloning feature is activated
- YouTube ToS violation risk if URL import downloads videos server-side — safer approach is requiring users to upload their own video files
- DMCA safe harbor under Section 512 requires formal registration and a designated agent
