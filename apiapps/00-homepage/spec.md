# 00 — API Apps Homepage

## Purpose
A single-page directory listing all 100 apps in the collection. No API calls are made — all data is inlined as a JS constant (`APPS`). Users can search and filter the full catalog by name, slug, or category, then navigate directly to any app.

## Features
- Full-text search across app name, slug, and category
- Category filter buttons (All, Data & Finance, Weather, Food & Health, Media & Fun, Tools, Travel & Geo)
- Live result count
- Each app card links to its subdirectory (`../<slug>/`)
- Empty state when no results match
- Error toast if a linked app directory returns a non-2xx response
- Fully keyboard-navigable (focus rings on all interactive elements including cards)

## Data
No external API. The `APPS` array (100 entries) is the sole data source, inlined in the `<script>` block. Each entry: `{ num, slug, name, cat }`.

## Categories
| Key | Label |
|-----|-------|
| data | Data & Finance |
| weather | Weather |
| food | Food & Health |
| media | Media & Fun |
| tools | Tools |
| travel | Travel & Geo |

## Layout
Hallmark macrostructure: **Bento Grid** with N5 floating-pill nav.

- Row 1: Header (title, stats)
- Row 2–3 left (cols 1–4): Search input + category filter
- Row 2–3 right (cols 5–12): Scrollable app card grid
- Footer: license note

## Testing targets
- `data-testid="app-grid"` — card container
- `data-testid="app-card"` — individual card
- `data-testid="result-count"` — count display
- `data-testid="empty-state"` — zero-results message
- `#search` — search input
- `.filter-btn[data-cat]` — category filter buttons
