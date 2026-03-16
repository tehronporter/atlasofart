# Atlas of Art — Build Prompt Pack

## Purpose
This document stores the exact prompt sequence for building the MVP with Claude Code or Hermes.

## Prompt 1 — Setup
Read AGENTS.md and begin Phase 0 for Atlas of Art.

Goal:
Set up this project for a focused MVP build using Next.js, TypeScript, Tailwind, and Mapbox.

Constraints:
- preserve AGENTS.md
- keep setup minimal
- no extra features
- no unnecessary dependencies
- do not refactor unrelated files

Task:
1. inspect the current folder
2. initialize a Next.js + TypeScript + Tailwind app here if needed
3. preserve AGENTS.md
4. keep setup clean and minimal
5. explain all major files created or changed
6. list files changed
7. tell me the exact next command to run

---

## Prompt 2 — App Shell
Read AGENTS.md and begin the app shell phase for Atlas of Art.

Goal:
Create the base app shell and visual foundation.

Requirements:
- dark museum-style interface
- full-screen homepage layout
- map area
- bottom controls area
- responsive enough for demo

Constraints:
- MVP only
- no extra features
- do not refactor unrelated files

Task:
1. inspect the current codebase
2. create the homepage shell
3. prepare a full-screen map area
4. prepare a bottom controls area
5. explain major file changes
6. list files changed
7. tell me the exact next command to run

---

## Prompt 3 — Data Model + Seed Data
Read AGENTS.md and begin the data model and seed data phase for Atlas of Art.

Goal:
Create the local artwork type and seed dataset.

Requirements:
- create a strong artwork type definition
- create 20 to 30 seeded artworks
- include multiple regions, cultures, mediums, and time periods
- keep the data realistic enough for a polished demo

Task:
1. inspect the current codebase
2. create artwork types
3. create the seeded dataset
4. create simple helpers if needed
5. explain major file changes
6. list files changed
7. tell me the exact next command to run

---

## Prompt 4 — Map Integration
Read AGENTS.md and begin the map integration phase for Atlas of Art.

Goal:
Replace the map placeholder with a real interactive world map using Mapbox GL JS.

Requirements:
- use Mapbox GL JS
- use the Mapbox token from environment variables
- keep the implementation simple and stable
- do not hardcode secrets

Task:
1. inspect the current codebase
2. add map dependencies only if necessary
3. build a reusable AtlasMap component
4. render the map in the homepage shell
5. keep layout responsive and stable
6. explain major file changes
7. list files changed
8. tell me the exact next command to run

---

## Prompt 5 — Marker Rendering
Read AGENTS.md and begin the marker rendering phase for Atlas of Art.

Goal:
Render artwork markers from the local seeded dataset on the Mapbox map.

Requirements:
- use the local seed dataset
- plot markers by lat/lng
- markers should be visible and clickable
- support selection state

Task:
1. inspect the current codebase
2. render markers from the seeded dataset
3. support selected artwork state
4. explain major file changes
5. list files changed
6. tell me the exact next command to run

---

## Prompt 6 — Artwork Drawer
Read AGENTS.md and begin the artwork drawer phase for Atlas of Art.

Goal:
Create a clean artwork detail drawer that opens when a marker is selected.

Requirements:
- drawer should feel minimal and museum-like
- show title, image, date, medium, culture, place created, current museum, description
- allow close
- connect to selected artwork state

Task:
1. inspect the current codebase
2. build the drawer
3. connect it to marker selection
4. explain major file changes
5. list files changed
6. tell me the exact next command to run

---

## Prompt 7 — Timeline Filter
Read AGENTS.md and begin the timeline phase for Atlas of Art.

Goal:
Add a simple timeline slider that filters visible artworks by time.

Requirements:
- add timeline control in bottom controls area
- visible markers should update when timeline changes
- active year should be clear

Task:
1. inspect the current codebase
2. build the timeline component
3. connect filtering logic
4. explain major file changes
5. list files changed
6. tell me the exact next command to run

---

## Prompt 8 — Related Works
Read AGENTS.md and begin the related works phase for Atlas of Art.

Goal:
Add a Related Works section inside the artwork drawer.

Requirements:
- use metadata-based matching only
- show up to 6 related works
- support selecting a related work if reasonable

Task:
1. inspect the current codebase
2. implement related works helper logic
3. render the section in the drawer
4. explain major file changes
5. list files changed
6. tell me the exact next command to run

---

## Prompt 9 — Polish
Read AGENTS.md and begin the polish phase for Atlas of Art.

Goal:
Do a focused MVP polish pass without adding new features.

Improve:
- spacing
- readability
- responsiveness
- drawer sizing
- marker visibility
- timeline clarity

Task:
1. inspect the current codebase
2. identify highest-impact polish issues
3. fix only those issues
4. explain major file changes
5. list files changed
6. tell me the exact next command to run

---

## Prompt 10 — Final Verification
Read AGENTS.md and begin the final verification phase for Atlas of Art.

Goal:
Do a final MVP verification pass and fix only blocking issues.

Main user flow:
1. open app
2. view map
3. see markers
4. click marker
5. open drawer
6. move timeline
7. see filtered results
8. view related works

Task:
1. inspect the current codebase
2. identify blocking issues
3. fix only those issues
4. summarize final project status
5. list files changed
6. tell me the exact next command to run

## Guardrail prompt
Pause broad refactoring.

Return to the Atlas of Art MVP scope in AGENTS.md.

Rules:
- do not refactor unrelated files
- do not add non-MVP features
- make the minimum changes needed for the current task
- preserve working behavior
- explain changes clearly

Please restate the current task, then complete only that task.
