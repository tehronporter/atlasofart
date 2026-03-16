# Atlas of Art — MVP Scope Doc

## Scope Purpose
This document defines exactly what is included in the first Atlas of Art MVP and what is intentionally excluded.

## MVP Objective
Ship a working demo that proves users can discover artworks through geography and time.

## In-Scope Features

### 1. Full-Screen Interactive Map
- world map displayed on the homepage
- map serves as the main interaction surface
- map must be usable on desktop and acceptable on mobile

### 2. Seeded Artwork Dataset
- local mock dataset
- approximately 20 to 30 artworks
- varied regions, cultures, mediums, and centuries
- enough data to demonstrate filtering and discovery

### 3. Artwork Markers
- one marker per artwork
- markers placed using stored latitude/longitude
- markers clickable/tappable
- selected marker state supported

### 4. Artwork Detail Drawer
When an artwork is selected, show:
- title
- image
- date
- medium
- culture
- place created
- current museum
- short description

### 5. Timeline Filter
- simple control to change visible artworks by year or year range
- timeline updates marker visibility on the map
- timeline must be understandable and stable

### 6. Related Works
Related works should use simple metadata-based logic:
- same region
- same century
- same medium
- same culture

### 7. Basic Responsiveness
- layout should hold together on laptop and mobile sizes
- detail drawer and timeline should remain readable

## Out-of-Scope Features
The MVP will not include:
- user login
- accounts or profiles
- saved favorites
- public sharing
- comments
- AI chat
- in-product LLM features
- live Getty API ingestion
- real geocoding pipeline
- trade route overlays
- historical border layers
- provenance lines
- clustering if it slows progress
- advanced filters beyond basic MVP needs
- analytics integrations
- admin dashboard

## MVP Design Constraints
- dark museum-style visual language
- minimal controls
- strong spacing
- low visual noise
- avoid over-animation
- map remains the hero

## MVP Engineering Constraints
- build with local data first
- keep architecture simple
- do not add libraries unless clearly necessary
- do not refactor unrelated files during feature work
- optimize for completion speed over abstraction

## Completion Definition
The MVP is complete when the following flow works end to end:
1. app loads
2. map renders
3. seeded artwork markers appear
4. user selects a marker
5. detail drawer opens
6. user moves timeline
7. visible markers update
8. related works display for the selected artwork

## Nice-to-Haves (Only If Time Remains)
- slightly more refined marker styling
- simple selected-marker highlight
- nicer empty-state messages
- smoother drawer transitions

## Hard Scope Rule
If a task does not directly improve the core discovery loop, it should be deferred until after the MVP is complete.
