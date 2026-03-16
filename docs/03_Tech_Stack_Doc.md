# Atlas of Art — Tech Stack Doc

## Purpose
This document locks the chosen tools for the MVP so the build can move quickly without re-deciding the stack midstream.

## Final MVP Stack
- Next.js
- TypeScript
- Tailwind CSS
- Mapbox GL JS
- local seeded data
- GitHub
- Vercel
- Supabase available for later phases
- Claude Code as primary builder
- Hermes as optional fallback

## Why This Stack Was Chosen
The stack prioritizes:
- speed of MVP completion
- modern frontend developer experience
- strong visual results quickly
- easy deployment
- low complexity for the first version

## Frontend Framework — Next.js
### Why
- fast project setup
- app routing built in
- flexible server/client architecture
- easy deployment to Vercel
- strong ecosystem and documentation

### Role in Atlas of Art
- app shell
- page routing
- homepage rendering
- component integration
- future API routes if needed

## Language — TypeScript
### Why
- safer data modeling
- better long-term maintainability
- improves consistency across components and helpers

### Role in Atlas of Art
- artwork types
- props and state typing
- filtering and related-work helpers

## Styling — Tailwind CSS
### Why
- fast UI building
- easy to maintain consistent spacing and typography
- ideal for a minimal museum-style interface

### Role in Atlas of Art
- layout
- spacing
- visual hierarchy
- drawer styling
- timeline styling
- typography and dark theme implementation

## Mapping — Mapbox GL JS
### Why
- fast polished setup for MVP
- attractive basemaps out of the box
- smooth map rendering
- easy integration for markers and interactions
- less assembly work than an open renderer + external basemap stack

### Role in Atlas of Art
- render the world map
- place artwork markers
- support selection behavior
- support future interactions like fly-to or highlighted states

## Data — Local Seed Data First
### Why
- removes backend dependency during the initial sprint
- lets the UI and discovery loop be proven first
- keeps the first version reliable and fast to build

### Role in Atlas of Art
- simulate the artwork collection
- drive map markers
- power timeline filtering
- power related-works logic

## Deployment — Vercel
### Why
- easiest deployment path for a Next.js project
- easy GitHub integration
- good fit for MVP hosting

### Role in Atlas of Art
- preview deployments
- production deployment

## Source Control — GitHub
### Why
- version control
- backup
- easy Vercel connection
- team readiness later

### Role in Atlas of Art
- repo hosting
- branch history
- deployment trigger source

## Database / Backend — Supabase (Later, Not Initial MVP)
### Why
- already available to the project
- strong option for database-backed content later
- useful for later Getty ingestion and saved data

### Current Role
Not required for the first local-data MVP.

### Future Role
- artworks table
- places table
- normalized origin records
- saved collections if needed later

## Primary Builder — Claude Code
### Why
- current quota available
- stronger than local models on the current hardware
- ideal for a fast multi-file MVP sprint

### Role in Atlas of Art
- scaffolding
- code generation
- file editing
- debugging
- phased execution

## Secondary Builder — Hermes
### Why
- available as backup
- can be useful later if needed
- terminal-native workflow option

### Current Role
Optional fallback only.

## Environment Variables Expected
For MVP:
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`

Later if Supabase is added:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Stack Decisions We Are Not Using for the MVP
- MapLibre for this first fast demo
- live Getty API integration
- runtime AI features inside the product
- paid analytics tools
- auth-first architecture

## Final Stack Rule
Do not change the stack during MVP implementation unless a blocker makes completion impossible.
