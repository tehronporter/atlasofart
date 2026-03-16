// lib/utils.ts - Timeline and filtering utilities
// Phase 13: Generic types

interface AnyArtwork {
  year_start: number;
  year_end: number;
  title?: string;
  culture?: string | null;
  region?: string | null;
  medium?: string | null;
  tags?: string[] | null;
  description?: string | null;
}

export function filterArtworksByYear(artworks: AnyArtwork[], yearRange: [number, number]): AnyArtwork[] {
  const [startYear, endYear] = yearRange;
  return artworks.filter(a => a.year_start <= endYear && a.year_end >= startYear);
}

export function getYearRange(artworks: AnyArtwork[]): [number, number] {
  if (artworks.length === 0) return [-3000, 2000];
  const years = artworks.flatMap(a => [a.year_start, a.year_end]);
  return [Math.min(...years), Math.max(...years)];
}

export function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year)} BCE`;
  if (year === 0) return '1 BCE/1 CE';
  return `${year} CE`;
}

export function searchArtworks(artworks: AnyArtwork[], query: string): AnyArtwork[] {
  if (!query.trim()) return artworks;
  const q = query.toLowerCase();
  return artworks.filter(a => 
    (a.title || '').toLowerCase().includes(q) ||
    (a.culture || '').toLowerCase().includes(q) ||
    (a.region || '').toLowerCase().includes(q) ||
    (a.medium || '').toLowerCase().includes(q) ||
    (a.tags || []).some((tag: string) => tag.toLowerCase().includes(q)) ||
    (a.description || '').toLowerCase().includes(q)
  );
}

export function filterArtworksByRegion(artworks: AnyArtwork[], region: string | null): AnyArtwork[] {
  if (!region) return artworks;
  return artworks.filter(a => a.region === region);
}

export function filterArtworksByMedium(artworks: AnyArtwork[], medium: string | null): AnyArtwork[] {
  if (!medium) return artworks;
  return artworks.filter(a => a.medium === medium);
}
