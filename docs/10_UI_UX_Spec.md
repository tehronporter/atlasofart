# Atlas of Art — UI / UX Spec

## Purpose
This document defines the visual and interaction direction for the MVP.

## Experience goal
Atlas of Art should feel:
- dark
- elegant
- museum-like
- modern
- minimal
- discovery-driven

## Primary screen
The main screen should include:
- a full-screen map
- minimal branding or page title
- a bottom control area for the timeline
- a detail drawer for selected artworks

## Layout principles
- Let the map be the hero.
- Avoid clutter.
- Keep controls compact and obvious.
- Use strong spacing and clear visual hierarchy.
- Preserve a polished feel on desktop and mobile.

## Visual direction
- dark background tones
- restrained typography
- subtle borders or overlays
- limited accent color use
- elegant motion only where helpful

## Main interface parts

### 1. Map area
Purpose:
- display the world
- show artwork markers
- allow selection

Rules:
- the map should dominate the screen
- markers must be easy to see
- selected marker state must be obvious

### 2. Bottom control area
Purpose:
- hold the timeline filter
- show active year or range state clearly

Rules:
- compact
- anchored cleanly
- does not compete with the map

### 3. Artwork drawer
Purpose:
- reveal selected artwork details without leaving the map context

Content:
- title
- image
- date
- medium
- culture
- place created
- current museum
- short description
- related works

Rules:
- elegant and readable
- easy to close
- should not feel oversized on desktop
- should be mobile-friendly

## Marker behavior
- markers must be clickable
- selected marker should update the drawer
- clicking another marker should swap the selected work
- closing the drawer should clear selection if consistent with implementation

## Timeline behavior
- changing the timeline should update visible artworks
- the active year or period should be clear
- timeline should remain simple and demo-stable

## Mobile expectations
- drawer should stack well
- controls should remain tappable
- timeline should not crowd the screen
- map should still feel primary

## Desktop expectations
- map should feel immersive
- drawer width should stay readable
- controls should not float awkwardly

## What to avoid
Do not add:
- complex dashboards
- crowded filter panels
- multiple sidebars
- over-animated interactions
- decorative elements that distract from the map
