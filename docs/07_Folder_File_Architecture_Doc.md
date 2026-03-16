# Atlas of Art — Folder / File Architecture Doc

## Purpose
This document defines the intended project structure before the codebase grows.

## Architecture goals
- Keep the project small and readable.
- Separate UI, data, and helpers clearly.
- Avoid over-engineering.
- Keep Claude Code and Hermes aligned on where files belong.

## Proposed structure

```text
atlas-of-art/
  app/
    page.tsx
    layout.tsx
    globals.css

  components/
    map/
      AtlasMap.tsx
      ArtworkMarker.tsx
    drawer/
      ArtworkDrawer.tsx
      RelatedWorks.tsx
    controls/
      TimelineSlider.tsx

  data/
    artworks.ts

  lib/
    filters.ts
    relatedWorks.ts

  types/
    artwork.ts

  public/
    images/

  .env.local
  AGENTS.md
```

## Folder responsibilities

### `app/`
Use for:
- Next.js app router files
- page shell
- layout
- global styles

### `components/`
Use for:
- reusable UI components only

#### `components/map/`
Use for:
- map wrapper
- marker rendering
- map-specific UI

#### `components/drawer/`
Use for:
- selected artwork drawer
- related works section

#### `components/controls/`
Use for:
- timeline slider
- simple control UI

### `data/`
Use for:
- local seeded dataset for the MVP

### `lib/`
Use for:
- pure helper logic
- filters
- related item scoring
- lightweight utilities

### `types/`
Use for:
- TypeScript data models
- shared type definitions

### `public/`
Use for:
- any local static assets needed later

## Rules
- Do not create folders unless needed.
- Do not create a backend folder for the first MVP.
- Do not introduce stores, hooks, services, or API routes unless clearly necessary.
- Keep the project intentionally small.

## MVP-first principle
The goal is not a full production architecture.
The goal is a clean enough structure to support:
- map
- markers
- drawer
- timeline
- related works
