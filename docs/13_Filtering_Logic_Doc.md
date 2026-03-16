# Atlas of Art — Filtering Logic Doc

## Purpose
This document defines the simple filtering rules for the MVP.

## Timeline filter
The timeline filter is the primary active filter in the MVP.

### Rule
An artwork is visible if the active timeline year falls within:
- `year_start` and `year_end`
or
- matches the single `year` value

### Simple implementation rule
Prefer:
- `year_start <= activeYear <= year_end`

If `year_start` and `year_end` are not meaningfully different, they may both equal `year`.

## Related works logic
Related works should use simple metadata-based scoring.

### Priorities
Give preference to artworks that share:
1. same region
2. same culture
3. same medium
4. overlapping tags
5. similar time period

## Suggested scoring approach
Use a lightweight score such as:
- +3 same region
- +3 same culture
- +2 same medium
- +1 per overlapping tag
- +2 if within the same century

Then sort descending and return up to 6 items.

## Rules
- Do not build a recommendation engine.
- Do not use AI for related works in the MVP.
- Do not fetch anything from external services for related logic.

## Selection edge case
If the selected artwork is filtered out by the timeline:
- reset selection
- close the drawer if needed
- keep behavior simple and consistent
