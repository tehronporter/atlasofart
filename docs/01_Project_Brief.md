# Atlas of Art — Project Brief

## Project Name
Atlas of Art

## One-Line Description
Atlas of Art is a map-based art discovery web app that lets users explore artworks by place and time.

## Core Product Promise
Atlas of Art helps users answer three simple questions:
- Where was this artwork made?
- When was it made?
- What other works connect to that place, era, or culture?

## Problem
Museum collections often present artworks as isolated records. Users can view titles, dates, and images, but they do not easily understand the geographic and historical relationships between works.

## Solution
Atlas of Art places artworks onto an interactive world map using place-of-origin data. Users can move through time, tap artworks on the map, and discover related works connected by region, century, medium, and culture.

## Target User
Primary users for the MVP:
- curious general users who enjoy art, history, and geography
- students or educators who want a more visual way to explore art history
- design-minded users who enjoy interactive cultural discovery products

## MVP Goal
Build a focused, demoable MVP that proves the core experience:
1. user opens the app
2. user sees a world map
3. user browses artworks by place
4. user filters artworks by time
5. user taps an artwork
6. user sees details and related works

## Core MVP Features
- full-screen world map
- seeded artwork dataset
- clickable artwork markers
- artwork detail drawer
- timeline filter
- related works section

## Non-MVP Features
The following are explicitly out of scope for the first MVP:
- user accounts
- saved collections
- Getty live ingestion
- geocoding pipeline
- AI-generated summaries inside the product
- provenance arcs
- historical trade-route overlays
- Street View
- AR
- social features

## Experience Principles
- simple
- visual
- elegant
- museum-like
- educational without clutter
- fast to understand

## Success Criteria
The MVP is successful if it can reliably demonstrate:
- a world map experience with artworks visible on the map
- working time-based filtering
- a meaningful detail view for each artwork
- a related works loop that encourages continued exploration

## Tech Direction
The current build direction is:
- Next.js
- TypeScript
- Tailwind CSS
- Mapbox GL JS
- local seeded data first
- Supabase later if needed after the local MVP works
- Vercel for deployment

## Current Build Strategy
This product will be built fast using:
- Claude Code as the primary builder
- Hermes available as a fallback tool
- a strict MVP-first phased build plan
