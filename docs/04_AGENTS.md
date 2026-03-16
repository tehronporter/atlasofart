# Atlas of Art — AGENTS.md

## Product
Atlas of Art is a focused MVP web app that lets users explore artworks by place and time.

## Core MVP Features
Build only:
1. Full-screen world map
2. Seeded artwork markers
3. Artwork detail drawer
4. Timeline filter
5. Related works section

## Tech Stack
- Next.js
- TypeScript
- Tailwind CSS
- Mapbox GL JS
- Local seed data first
- No extra libraries unless necessary

## UX Direction
- Dark museum-style interface
- Minimal controls
- Strong whitespace
- Mobile-friendly
- Desktop polished enough for demo

## Map Rules
- Use Mapbox GL JS for the MVP
- Keep map implementation simple
- Use a polished dark basemap
- Focus on reliable marker rendering and selection
- Do not add advanced map features outside MVP scope

## Build Rules
- Do not refactor unrelated files
- Build one feature at a time
- Explain major files changed
- Keep architecture simple
- Use local seed data only for MVP
- No extra features outside scope

## Data Fields
Each artwork should support:
- id
- title
- year
- year_start
- year_end
- region
- culture
- medium
- lat
- lng
- image_url
- description
- current_museum
- place_created
- tags

## Output Style
For each task:
1. inspect current code
2. implement only requested feature
3. list files changed
4. explain what changed
5. tell me exact next command to run
