# Atlas of Art

A beautiful, interactive map exploring art history across time and space.

## Features

- **Interactive Map**: Dark-themed world map with artwork markers
- **Timeline Filtering**: Filter artworks by time period (2500 BCE - 1832 CE)
- **Search & Filter**: Search by title, culture, region, medium, or tags
- **Artwork Details**: Click markers to view detailed information
- **Related Works**: Discover connected artworks based on culture, region, medium, and more
- **Responsive Design**: Works beautifully on desktop and mobile

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Map**: Mapbox GL via react-map-gl
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Mapbox access token (included in `.env.local.example`)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_token_here
```

## Project Structure

```
atlasofart-app/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main homepage
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── map/
│   │   ├── MapShell.tsx   # Map container
│   │   └── ArtworkMarker.tsx # Marker component
│   ├── drawer/
│   │   └── ArtworkDrawerShell.tsx # Detail panel
│   ├── controls/
│   │   └── TimelineShell.tsx # Timeline filter
│   └── search/
│       └── SearchBar.tsx  # Search & filters
├── data/
│   └── artworks.ts        # Seeded artwork data (25 items)
├── types/
│   └── artwork.ts         # TypeScript types
├── lib/
│   ├── utils.ts           # Utility functions
│   └── related-works.ts   # Related artworks logic
└── hooks/
    └── useFilteredArtworks.ts # Filtering hook
```

## MVP Scope

This is Phase 1-10 of the Atlas of Art MVP:

- ✅ Phase 1: App Shell
- ✅ Phase 2: Data Model + Seed Data
- ✅ Phase 3: Live Mapbox
- ✅ Phase 4: Artwork Markers
- ✅ Phase 5: Timeline Filtering
- ✅ Phase 6: Related Works Logic
- ✅ Phase 7: Responsive Polish
- ✅ Phase 8: Search & Filter UI
- ✅ Phase 9: Performance Optimization
- ✅ Phase 10: Vercel Deployment Prep

## License

MIT
