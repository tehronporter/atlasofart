# Atlas of Art — QA / Verification Checklist

## Purpose
This checklist defines when the MVP is actually complete enough to demo.

## Core flow
- [ ] App loads without a blocking runtime error
- [ ] Homepage renders correctly
- [ ] Map renders
- [ ] Map token is being read correctly
- [ ] Seeded artworks are available in the app
- [ ] Markers render at expected locations
- [ ] Marker click selects the artwork
- [ ] Detail drawer opens on selection
- [ ] Drawer displays artwork details correctly
- [ ] Drawer can be closed
- [ ] Timeline control renders
- [ ] Timeline changes visible markers
- [ ] Related works display for a selected artwork
- [ ] Related work selection works if implemented
- [ ] Layout is usable on desktop
- [ ] Layout is usable on mobile
- [ ] No obvious broken spacing or overflow
- [ ] No blocking TypeScript errors
- [ ] Production build succeeds

## Demo readiness
- [ ] The app feels visually coherent
- [ ] The map is the primary focus
- [ ] The drawer feels polished enough to show
- [ ] The timeline is understandable
- [ ] The related works section feels connected and useful

## Nice to verify manually
- [ ] Change the selected marker multiple times
- [ ] Filter to a year with fewer results
- [ ] Verify selection reset behavior when filtered out
- [ ] Test the app after refreshing the page
