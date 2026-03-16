# Atlas of Art — Build Phases / Sprint Plan

## Goal
Complete a demoable Atlas of Art MVP in a tightly scoped sprint.

## MVP Outcome
By the end of the sprint, the product should allow a user to:
1. open the app
2. see a world map
3. view artwork markers
4. select a marker
5. open a detail drawer
6. move the timeline
7. see filtered results
8. view related works

## Phase 0 — Setup
### Objective
Create the project foundation.

### Tasks
- create project folder
- add AGENTS.md
- initialize Next.js + TypeScript + Tailwind project
- verify local development works
- set up `.env.local` for Mapbox token

### Deliverable
Working project scaffold.

## Phase 1 — App Shell
### Objective
Create the base visual layout.

### Tasks
- build dark museum-style page shell
- create full-screen homepage layout
- define main map area
- define bottom controls area

### Deliverable
Responsive app shell with placeholders.

## Phase 2 — Data Model + Seed Data
### Objective
Create the content layer for the MVP.

### Tasks
- define artwork types
- create 20–30 seeded artwork records
- cover multiple regions, cultures, mediums, and centuries
- add simple helper utilities if needed

### Deliverable
Usable local data layer.

## Phase 3 — Map Integration
### Objective
Replace placeholder with a live Mapbox map.

### Tasks
- add Mapbox dependency if needed
- create reusable map component
- render a world map in the homepage shell
- pull token from environment variables

### Deliverable
Interactive world map on the page.

## Phase 4 — Artwork Markers
### Objective
Place artworks onto the map.

### Tasks
- render markers from local data
- support click/tap selection
- store selected artwork state

### Deliverable
Clickable artwork markers.

## Phase 5 — Artwork Detail Drawer
### Objective
Turn marker clicks into detailed discovery.

### Tasks
- create detail drawer component
- show image and metadata
- allow drawer close/reset behavior

### Deliverable
Working detail view for selected artwork.

## Phase 6 — Timeline Filter
### Objective
Enable time-based exploration.

### Tasks
- build simple timeline UI
- connect timeline state to marker filtering
- keep interaction stable and readable

### Deliverable
Visible artworks update based on selected time.

## Phase 7 — Related Works
### Objective
Deepen exploration.

### Tasks
- add related works helper logic
- prioritize same region, century, medium, culture
- display up to 6 related works in drawer

### Deliverable
Related works section inside drawer.

## Phase 8 — Polish Pass
### Objective
Make the MVP demo-ready.

### Tasks
- improve spacing consistency
- refine drawer sizing
- improve readability
- improve marker visibility
- check mobile responsiveness

### Deliverable
Clean, stable MVP presentation.

## Phase 9 — Final Verification
### Objective
Check the full flow and fix blockers only.

### Checklist
- app loads
- map renders
- markers render
- selection works
- drawer opens and closes
- timeline filters correctly
- related works display
- no major blocking errors

### Deliverable
Verified MVP.

## Phase 10 — Git + Deploy Prep
### Objective
Save and prepare the project for deployment.

### Tasks
- initialize git if needed
- commit code
- push to GitHub
- prepare for Vercel deployment

### Deliverable
Project ready for handoff or deployment.

## Rules for the Sprint
- do not add non-MVP features
- do not introduce backend complexity early
- do not start Getty integration yet
- do not over-refactor
- prioritize completion over abstraction

## Recommended Build Order
1. setup
2. shell
3. data
4. map
5. markers
6. drawer
7. timeline
8. related works
9. polish
10. verify
11. deploy prep
