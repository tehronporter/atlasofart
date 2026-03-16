# Atlas of Art — Component Spec

## Purpose
This document defines the main UI components for the MVP and what each one is responsible for.

## Component list

### `AtlasMap`
Purpose:
- render the Mapbox map
- receive visible artworks
- render clickable markers
- manage map display area

Inputs:
- artworks
- selectedArtworkId
- onSelectArtwork

Notes:
- keep this component focused on map rendering
- do not overload it with drawer or filter logic

---

### `ArtworkMarker`
Purpose:
- display a single artwork on the map
- support selected and unselected states
- handle click interaction

Inputs:
- artwork
- isSelected
- onClick

Notes:
- keep the marker visually simple
- selected state should be clearly visible

---

### `ArtworkDrawer`
Purpose:
- show the selected artwork’s information
- allow the user to close the drawer
- contain the related works section

Inputs:
- artwork
- relatedWorks
- onClose
- onSelectRelatedWork

Notes:
- should work cleanly on desktop and mobile
- should not assume complex navigation

---

### `RelatedWorks`
Purpose:
- display a small list of related artworks
- help the user jump to similar items

Inputs:
- items
- onSelectItem

Notes:
- compact layout
- max 6 items
- focus on readability over complexity

---

### `TimelineSlider`
Purpose:
- control the currently active year or time state
- trigger filtering of visible artworks

Inputs:
- value
- min
- max
- onChange

Notes:
- keep it simple and stable
- do not overdesign the control for the MVP

## Optional helper components
Only create these if clearly useful:
- `MapShell`
- `DrawerHeader`
- `EmptyState`

## Component rules
- Components should have a single clear responsibility.
- Avoid creating components too early.
- Avoid abstracting simple markup into tiny components unless reuse is obvious.
- Keep prop surfaces small.
