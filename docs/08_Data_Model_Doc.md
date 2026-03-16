# Atlas of Art — Data Model Doc

## Purpose
This document defines the core artwork data structure for the MVP.

## Core record
Each artwork should follow this shape:

```ts
type Artwork = {
  id: string;
  title: string;
  year: number;
  year_start: number;
  year_end: number;
  region: string;
  culture: string;
  medium: string;
  lat: number;
  lng: number;
  image_url: string;
  description: string;
  current_museum: string;
  place_created: string;
  tags: string[];
};
```

## Field definitions

### `id`
Unique identifier for the artwork record.

### `title`
Human-readable title.

### `year`
Primary display year.
Use the most representative single year.

### `year_start`
Start of a range if approximate or spanning years.

### `year_end`
End of a range if approximate or spanning years.

### `region`
Broad geographic category.
Examples:
- Europe
- Middle East
- East Asia
- South Asia
- North Africa
- Mesoamerica

### `culture`
More specific cultural context.
Examples:
- Safavid
- Roman
- Edo-period Japan
- Renaissance Italian

### `medium`
The artwork medium.
Examples:
- manuscript
- sculpture
- painting
- ceramic
- textile

### `lat`
Latitude of the artwork’s place of creation.

### `lng`
Longitude of the artwork’s place of creation.

### `image_url`
Image used in the drawer.
For the MVP, this may be:
- a placeholder image
- a remote sample image
- a local asset path

### `description`
Short summary for the user.

### `current_museum`
Museum or collection currently holding the piece.

### `place_created`
Human-readable place of creation.

### `tags`
Keyword list for simple related-works matching.

## MVP data rules
- Every record must have valid coordinates.
- Every record must be usable on the map immediately.
- Every record must have enough metadata for related works.
- Keep descriptions short and readable.
- Keep the schema flat.

## Filtering logic expectations
The timeline uses:
- `year`
or
- `year_start` / `year_end`

Related works uses:
- `region`
- `culture`
- `medium`
- `tags`
- time proximity

## Future fields, not needed yet
Do not add yet:
- provenance history arrays
- IIIF manifests
- external authority IDs
- route/trade network IDs
- source confidence scores
- historical border references
