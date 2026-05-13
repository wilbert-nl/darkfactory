# MISSION.md — audio-swap

## What This Builds

A web tool for replacing, swapping, and dubbing audio tracks in video files using server-side FFmpeg processing. Users import a video (via URL or file upload), detach the original audio, and replace it with a recorded voiceover, uploaded audio file, or a track from a curated royalty-free music library. Output is exported with adjustable audio levels and fade controls.

## Primary Users

Content creators, YouTubers, podcasters, educators, and small business owners who need to replace background music, add voiceovers, or re-dub video content without a full video editing suite.

## In Scope

- Video import via file upload (MP4/MOV/WebM) or public URL (direct video links only — no YouTube/social platform downloads)
- Mute or detach original audio track
- Upload replacement audio file (MP3/WAV/AAC)
- Record voiceover directly in browser (MediaRecorder API)
- Royalty-free music library (curated local collection, no third-party API)
- Adjustable audio levels per track (original, voiceover, music)
- Fade in / fade out controls per track
- Server-side FFmpeg processing (audio-only swap, no video re-encode)
- Export with adjusted audio mix
- Stripe freemium billing (free: 5-min/480p; Pro $4.99/mo: 60-min/1080p + commercial license on royalty-free tracks)

## Out of Scope

- Downloading videos from YouTube, Instagram, TikTok, or any platform with terms-of-service restrictions
- Video editing (trimming, splicing, color grading, subtitles)
- AI-generated voices or text-to-speech
- Video re-encoding or format conversion (audio stream swap only)
- Native mobile apps
- Batch processing multiple videos simultaneously
- User-generated royalty-free library submissions

## Immutable Constraints

1. **FFmpeg binary is pinned to a specific version.** The binary path and version are defined in `api/src/ffmpeg/ffmpeg.config.ts`. Agents must never update the FFmpeg binary, change the version pin, or modify FFmpeg execution logic.
2. **Output must swap audio only — never re-encode the video stream.** FFmpeg commands must always include `-c:v copy`. Agents must not change this flag.
3. **Pro pricing is hardcoded at $4.99/month.** Agents must never alter Stripe pricing constants or price IDs.
4. **Free tier upload cap is 500MB; Pro cap is 2GB.** Agents must not relax these limits.
5. **No YouTube or platform video downloads.** Any feature that fetches video from social platforms is an automatic reject.
6. **Royalty-free library lives exclusively in `api/src/royalty-free-library/`.** Agents must not add, remove, or modify tracks outside this path.
7. **FFmpeg logic lives exclusively in `api/src/ffmpeg/`.** Agents must not invoke FFmpeg from any other module.
