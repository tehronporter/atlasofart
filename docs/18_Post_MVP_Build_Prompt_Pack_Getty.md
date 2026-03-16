# Atlas of Art — Post-MVP Build Prompt Pack (Getty + Full Product)

## Purpose
This document extends the original MVP prompt pack with post-MVP phases for building the full Atlas of Art product, including Getty Museum Collection API integration, normalization, syncing, search, richer discovery, and production hardening.

## Important context for these phases
Use these prompts only after the MVP is stable.

Current Getty platform notes to respect:
- Getty’s collection API is exposed as both a REST API and a SPARQL API.
- The collection API is based on Linked.Art, uses ActivityStreams to track changes, and uses IIIF for image links/manifests.
- The API provides links to images via Getty’s IIIF API, but does not provide the image files themselves directly.
- Getty currently does **not** provide a built-in way to list all objects or download the entire collection dataset; both are described as roadmap items.

## Post-MVP guardrails
Before each phase:
- read `AGENTS.md` first
- preserve working MVP behavior
- avoid broad refactors unless the phase explicitly requires them
- prefer small, testable increments
- explain major file changes
- list files changed
- give the exact next terminal command

---

## Prompt 11 — Getty Integration Architecture
Read `AGENTS.md` and begin Phase 11 for Atlas of Art.

Goal:
Design and implement the first safe architecture step for Getty-backed data ingestion without breaking the working MVP.

Requirements:
- inspect the current MVP codebase first
- design how Getty data will enter the app
- keep the current seeded data working as a fallback
- introduce a clear separation between:
  - external source fetching
  - normalization/mapping
  - app-facing Atlas artwork records
- prefer server-side ingestion utilities over client-side direct API coupling
- keep the implementation simple and future-ready

Create or update files if useful:
- `lib/getty/`
- `lib/getty/client.ts`
- `lib/getty/types.ts`
- `lib/getty/normalize.ts`
- `docs/` notes only if necessary

Do not add yet:
- full ingestion of everything
- frontend search UI changes
- Supabase writes unless clearly required in this phase
- unrelated refactors

Task:
1. inspect the current codebase
2. design the Getty integration boundary
3. implement the minimal scaffolding for Getty source support
4. preserve the existing local data path
5. explain major file changes
6. list files changed
7. tell me the exact next command to run

---

## Prompt 12 — Getty Object Discovery / Index Bootstrap
Read `AGENTS.md` and begin Phase 12 for Atlas of Art.

Goal:
Create a practical strategy to discover and maintain a usable Getty object index despite Getty not currently offering a simple “list all objects” or full collection dump endpoint.

Requirements:
- inspect the current codebase first
- build a pragmatic index bootstrap approach
- support one or more of these strategies if appropriate:
  - curated seed list of Getty object URLs/IDs
  - SPARQL-based discovery queries
  - revision/change tracking based discovery
  - manual/curated import batches for high-quality demo coverage
- keep the implementation honest about the current Getty limitations
- store discovered records in a clean intermediate format

Create or update files if useful:
- `lib/getty/discovery.ts`
- `scripts/getty-bootstrap-index.ts`
- `data/getty-index.json`
- `docs/getty-ingestion-notes.md`

Do not add yet:
- full production cron syncing unless required
- frontend UI changes
- unrelated data providers

Task:
1. inspect the current codebase
2. implement the first object discovery/index bootstrap flow
3. make the strategy reproducible
4. explain major file changes
5. list files changed
6. tell me the exact next command to run

---

## Prompt 13 — Getty Fetch + Normalization Pipeline
Read `AGENTS.md` and begin Phase 13 for Atlas of Art.

Goal:
Fetch Getty object records and normalize them into the Atlas artwork shape used by the app.

Requirements:
- inspect the current codebase first
- fetch Getty records from the chosen discovery/index source
- normalize them into a clean Atlas-facing structure
- map as many of these fields as possible:
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
- where Getty fields do not map cleanly, create sensible fallbacks
- keep normalization deterministic and readable
- preserve seeded data fallback behavior

Create or update files if useful:
- `lib/getty/fetchObject.ts`
- `lib/getty/normalize.ts`
- `types/artwork.ts`
- `scripts/getty-import-sample.ts`
- `data/getty-sample-artworks.ts` or `data/getty-sample-artworks.json`

Do not add yet:
- broad UI redesigns
- advanced recommendation logic
- unrelated refactors

Task:
1. inspect the current codebase
2. implement the Getty fetch + normalization pipeline
3. import a small sample of normalized Getty-backed artworks
4. verify the app can consume them cleanly
5. explain major file changes
6. list files changed
7. tell me the exact next command to run

---

## Prompt 14 — Geographic Enrichment for Getty Records
Read `AGENTS.md` and begin Phase 14 for Atlas of Art.

Goal:
Improve place-of-origin usability for Getty-backed artworks so they can be plotted reliably on the map.

Requirements:
- inspect the current codebase first
- identify how Getty place/origin data is represented in normalized records
- enrich missing or incomplete map coordinates using a controlled, auditable approach
- prefer authority-backed or curated mappings over fuzzy guessing
- keep a clear distinction between:
  - source values from Getty
  - enriched coordinate mappings used by Atlas
- support confidence-aware enrichment if helpful

Create or update files if useful:
- `lib/geo/placeMappings.ts`
- `lib/getty/enrichPlace.ts`
- `data/place-coordinate-map.json`
- `scripts/verify-getty-coordinates.ts`

Do not add:
- opaque AI-only geocoding
- fragile one-off hacks
- unrelated frontend changes

Task:
1. inspect the current codebase
2. implement a reliable place enrichment strategy
3. improve coordinate coverage for Getty-backed records
4. explain major file changes
5. list files changed
6. tell me the exact next command to run

---

## Prompt 15 — Supabase Migration for Persistent Artwork Storage
Read `AGENTS.md` and begin Phase 15 for Atlas of Art.

Goal:
Move from local-only Getty-backed records into persistent storage so the product can scale beyond static seed files.

Requirements:
- inspect the current codebase first
- design a minimal Supabase schema for persistent artwork storage
- preserve compatibility with the current app-facing artwork shape
- create clear write/read boundaries
- support:
  - artworks
  - source metadata
  - sync timestamps
  - optional raw source payload storage if useful
- keep the schema simple and scalable

Create or update files if useful:
- `supabase/migrations/`
- `lib/supabase/`
- `lib/getty/persist.ts`
- `types/db.ts`
- `.env.local.example` if needed

Do not add yet:
- user auth features unless required elsewhere
- full admin product UI
- unrelated refactors

Task:
1. inspect the current codebase
2. design and implement the minimal Supabase persistence layer
3. support importing normalized Getty records into storage
4. explain major file changes
5. list files changed
6. tell me the exact next command to run

---

## Prompt 16 — Sync Jobs, Change Tracking, and Refresh Pipeline
Read `AGENTS.md` and begin Phase 16 for Atlas of Art.

Goal:
Create a sustainable sync pipeline so Getty-backed data can be refreshed over time without manual re-import every time.

Requirements:
- inspect the current codebase first
- use Getty change/revision concepts where useful
- support incremental refreshes where practical
- track:
  - last sync time
  - source revision/change markers when available
  - sync errors
  - skipped/incomplete records
- keep the workflow safe and resumable
- support local/dev execution first
- optionally prepare for cron/Vercel scheduled jobs later

Create or update files if useful:
- `scripts/getty-sync.ts`
- `lib/getty/sync.ts`
- `lib/getty/revisions.ts`
- `supabase/migrations/` for sync tracking tables if needed

Do not add:
- overbuilt job orchestration
- unrelated UI changes

Task:
1. inspect the current codebase
2. implement the first stable Getty sync pipeline
3. make the refresh flow resumable and inspectable
4. explain major file changes
5. list files changed
6. tell me the exact next command to run

---

## Prompt 17 — Getty-Backed Search and Advanced Filters
Read `AGENTS.md` and begin Phase 17 for Atlas of Art.

Goal:
Expand the product from MVP timeline-only discovery into real collection exploration with search and richer filters backed by persistent data.

Requirements:
- inspect the current codebase first
- add search for at least:
  - artwork title
  - place
  - culture
  - medium
- add filters for at least:
  - region
  - culture
  - medium
  - century or time period
- keep the interface elegant and map-first
- preserve the existing timeline and drawer behavior
- avoid dashboard clutter

Create or update files if useful:
- `components/controls/SearchBar.tsx`
- `components/controls/FilterPanel.tsx`
- `lib/filters.ts`
- `app/page.tsx`
- any server query helpers needed

Do not add:
- social features
- auth-first workflows
- unrelated redesigns

Task:
1. inspect the current codebase
2. implement search and richer filters
3. preserve the map as the hero
4. explain major file changes
5. list files changed
6. tell me the exact next command to run

---

## Prompt 18 — Smarter Related Works + Provenance/Journey Layer
Read `AGENTS.md` and begin Phase 18 for Atlas of Art.

Goal:
Deepen discovery by improving related works logic and adding the first provenance/journey storytelling layer where data quality allows.

Requirements:
- inspect the current codebase first
- improve related works scoring using a richer combination of:
  - region
  - culture
  - medium
  - tags
  - time proximity
  - current museum / place-of-creation relationship where useful
- add a lightweight provenance/journey concept only if the available data supports it cleanly
- keep the UI elegant and educational, not overloaded

Create or update files if useful:
- `lib/relatedWorks.ts`
- `components/drawer/RelatedWorks.tsx`
- `components/map/RouteOverlay.tsx` only if justified
- `lib/provenance.ts`

Do not add:
- fake provenance
- speculative paths without clear labeling
- unrelated UI clutter

Task:
1. inspect the current codebase
2. improve related works logic
3. add the first clean provenance/journey experience if justified
4. explain major file changes
5. list files changed
6. tell me the exact next command to run

---

## Prompt 19 — Getty Media, IIIF, and Asset Handling
Read `AGENTS.md` and begin Phase 19 for Atlas of Art.

Goal:
Handle Getty image/media references correctly and efficiently using Getty-provided image links / IIIF-compatible flows.

Requirements:
- inspect the current codebase first
- work with Getty image links and IIIF manifests/URLs where available
- avoid assuming direct downloadable originals
- improve image rendering, loading, and fallback behavior
- optionally introduce light caching/proxy behavior if truly needed
- keep rights/availability uncertainty in mind and degrade gracefully

Create or update files if useful:
- `lib/getty/media.ts`
- `components/drawer/ArtworkImage.tsx`
- `next.config.*` for approved remote image domains if needed
- image fallback helpers

Do not add:
- unauthorized asset scraping
- overbuilt media pipelines too early
- unrelated refactors

Task:
1. inspect the current codebase
2. implement clean Getty media handling
3. improve drawer/gallery image behavior
4. explain major file changes
5. list files changed
6. tell me the exact next command to run

---

## Prompt 20 — Full Product Verification, Ops, and Deployment Hardening
Read `AGENTS.md` and begin Phase 20 for Atlas of Art.

Goal:
Take Atlas of Art from a working MVP-plus product to a stable, deployable Getty-backed production candidate.

Requirements:
- inspect the current codebase first
- verify the full user flow end-to-end
- verify fallback behavior if Getty-backed content is incomplete
- verify sync scripts and storage behavior
- verify search, filters, map, drawer, timeline, and related works together
- prepare the app for stable Vercel deployment
- identify and fix only the highest-priority production blockers

Areas to verify:
- environment variables
- build stability
- type safety
- remote image handling
- Supabase queries and policies if present
- map behavior in production
- graceful error handling for missing Getty fields
- responsiveness on desktop and mobile

Create or update files if useful:
- `docs/production-readiness.md`
- `scripts/verify-production.ts`
- deployment/config files only if needed

Do not add:
- new major features
- broad redesigns
- speculative refactors

Task:
1. inspect the current codebase
2. identify the highest-risk production blockers
3. fix only those blockers
4. summarize production readiness status
5. list files changed
6. tell me the exact next command to run

---

## Getty-specific guardrail prompt
Pause feature work and return to source-truth discipline.

Rules:
- do not invent Getty fields that are not present
- clearly separate source data from enriched Atlas fields
- label fallbacks and assumptions conservatively
- do not assume Getty offers a full object list or full dataset download
- do not scrape image files beyond documented Getty image/IIIF usage
- preserve seeded/local fallback behavior until persistent Getty ingestion is verified
- prefer reversible, auditable data transformations

Please restate the current task, then complete only that task.
