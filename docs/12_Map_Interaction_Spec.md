# Atlas of Art — Map Interaction Spec

## Purpose
This document defines how the user interacts with the map in the MVP.

## Core interaction flow
1. User opens the app.
2. User sees a world map with visible artwork markers.
3. User clicks a marker.
4. The selected state updates.
5. The artwork drawer opens with the selected work.
6. User can close the drawer or select another marker.
7. User can move the timeline and see visible markers change.

## Initial map behavior
- Show a world view on first load.
- Start at a zoom level that makes multiple regions visible.
- Do not overfit to one region.

## Marker interactions
- Markers must be clearly clickable.
- Clicking a marker selects that artwork.
- Clicking a new marker replaces the previous selection.
- Selected marker styling should be visually obvious.

## Drawer interactions
- Opening the drawer should not navigate away from the map.
- The drawer should display the selected artwork immediately.
- Closing the drawer should be simple and obvious.

## Timeline interactions
- Moving the timeline should update visible artworks.
- Selection behavior should stay stable where possible.
- If the selected artwork becomes filtered out, the UI may either:
  - close the drawer
  - or reset the selected state
- Keep the implementation simple and predictable.

## UX principles
- The map remains the primary surface.
- The user should always understand what is selected.
- The user should not lose context when exploring.
- Interactions should feel lightweight and direct.

## What not to add
Do not add yet:
- route lines
- heatmaps
- spider clusters
- historical borders
- map search
- 3D globe behavior
