# AnimeWedding — Research Brief

## What It Is
AnimeWedding converts wedding videos into anime-style animated clips using AI video style transfer. Couples and videographers upload footage and receive shareable reels in Ghibli-inspired, Shonen, Manhwa, or other anime art styles.

## Competitors
| Name | Description |
|------|-------------|
| DomoAI | Leading video-to-anime platform, $69.99/mo, supports multiple anime styles, general-purpose |
| Krikey AI | Video-to-anime conversion marketed explicitly for weddings and personal videos |
| Reface / Luma AI | General-purpose AI video style transfer, not wedding-specific |
| Pollo AI | AI wedding video generation from prompts and clips, early stage |
| Runway ML / Kling | Foundational video AI APIs used by most competitors; available as infrastructure |

## Market Size
Global anime market: $34.9B (2026) → $68B by 2034. AI video generator market: $847M (2026) → $3.35B by 2034 (18.8% CAGR). Wedding videography: ~$10B/year globally. Organic TikTok and Instagram demand for anime-style wedding content is especially strong in East and Southeast Asia where anime aesthetics are mainstream consumer culture. Wedding-specific positioning reduces direct competition with general tools while commanding a premium price.

## MVP Features
1. Video upload (3–5 minutes maximum per conversion)
2. 4–6 art style presets: Ghibli-inspired, Shonen action, Manhwa webtoon, Makoto Shinkai-style, Chibi, Classic cel animation
3. AI processing pipeline with real-time progress indicator
4. Preview before download (watermarked, low-res)
5. MP4 export in Instagram/TikTok vertical format + full-resolution download
6. Optional styled text overlay — couple names and date in anime calligraphy font

## Differentiators
1. Wedding-specific framing only — interface, copy, and output optimized for weddings vs general-purpose video tools that require the user to do their own framing
2. Scene intelligence — auto-detects key wedding moments (first dance, kiss, vow exchange) and prioritizes them in the styled output
3. Shareable 60-second highlight reel auto-exported in Instagram/TikTok format — optimized for organic social sharing that drives word-of-mouth growth

## Profitability
**Model:** Pay-per-video for couples ($15–30/conversion) + monthly subscription for wedding photographers and videographers ($79–149/mo unlimited) + platform partnerships
**Estimate:** 500 conversions/mo × $20 = $10K/mo ($120K ARR). Photographer subscriptions at $99/mo × 200 subscribers = $237.6K ARR. Partnership upsells via The Knot and WeddingWire add distribution revenue.

## Build Ease: 3/5
The AI video style transfer pipeline is the core product, requiring GPU-intensive diffusion models (Stable Video Diffusion, AnimateDiff). Using API access to Runway ML, Kling AI, or Luma AI avoids ML engineering but inference costs run $0.50–2.00 per minute of video, which compresses margins significantly. Claude handles all surrounding app logic but core AI processing is compute-heavy and vendor-dependent.

## Legal Risks
- Art style copyright — mimicking "Studio Ghibli style" is a legal grey area; Ghibli has been aggressive about IP; avoid trademarked studio names in all style descriptions and marketing copy
- Deepfake and biometric consent — processing video of real identifiable people triggers GDPR Article 9 (biometric data) and BIPA in Illinois (US); explicit consent flow required at upload
- Content moderation — platform could receive non-wedding content including nudity or minors; upload content policy and automated moderation required
- Source video deletion — delete source files after processing and delivery to reduce storage liability and limit exposure under data breach scenarios
