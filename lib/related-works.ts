// lib/related-works.ts - Related artworks logic (generic)
// Phase 13: Works with both seed and Supabase data

interface AnyArtwork {
  id: string;
  title: string;
  year: string;
  year_start: number;
  year_end: number;
  culture: string | null;
  region: string | null;
  medium: string | null;
  place_created: string | null;
  tags: string[] | null;
}

interface RelatedWorksOptions {
  maxResults?: number;
  minScore?: number;
}

/**
 * Calculate relatedness score between two artworks
 */
export function calculateRelatednessScore(a: AnyArtwork, b: AnyArtwork): number {
  let score = 0;

  const cultureA = a.culture || '';
  const cultureB = b.culture || '';
  if (cultureA === cultureB && cultureA !== '') score += 3;

  const regionA = a.region || '';
  const regionB = b.region || '';
  if (regionA === regionB && regionA !== '') score += 2;

  const mediumA = a.medium || '';
  const mediumB = b.medium || '';
  if (mediumA === mediumB && mediumA !== '') score += 2;

  const aTags = a.tags || [];
  const bTags = b.tags || [];
  const sharedTags = aTags.filter(tag => bTags.includes(tag));
  score += sharedTags.length * 1.5;

  const timeDiff = Math.abs(
    ((a.year_start + a.year_end) / 2) - ((b.year_start + b.year_end) / 2)
  );
  if (timeDiff < 100) score += 2;
  else if (timeDiff < 500) score += 1;

  const placeA = a.place_created || '';
  const placeB = b.place_created || '';
  if (placeA === placeB && placeA !== '') score += 1.5;

  return score;
}

/**
 * Find related artworks for a given artwork
 */
export function findRelatedWorks(
  artwork: AnyArtwork,
  allArtworks: AnyArtwork[],
  options: RelatedWorksOptions = {}
): AnyArtwork[] {
  const { maxResults = 4, minScore = 0.5 } = options;

  const others = allArtworks.filter(a => a.id !== artwork.id);

  const scored = others.map(related => ({
    artwork: related,
    score: calculateRelatednessScore(artwork, related),
  }));

  const filtered = scored
    .filter(item => item.score >= minScore)
    .sort((a, b) => b.score - a.score);

  return filtered.slice(0, maxResults).map(item => item.artwork);
}

/**
 * Get relationship reasons between two artworks
 */
export function getRelationshipReasons(a: AnyArtwork, b: AnyArtwork): string[] {
  const reasons: string[] = [];

  const cultureA = a.culture || '';
  const cultureB = b.culture || '';
  if (cultureA === cultureB && cultureA !== '') {
    reasons.push(`Same ${cultureA} culture`);
  }

  const regionA = a.region || '';
  const regionB = b.region || '';
  if (regionA === regionB && regionA !== '') {
    reasons.push(`Same region: ${regionA}`);
  }

  const mediumA = a.medium || '';
  const mediumB = b.medium || '';
  if (mediumA === mediumB && mediumA !== '') {
    reasons.push(`Same medium: ${mediumA}`);
  }

  const aTags = a.tags || [];
  const bTags = b.tags || [];
  const sharedTags = aTags.filter(tag => bTags.includes(tag));
  if (sharedTags.length > 0) {
    reasons.push(`Shared tags: ${sharedTags.join(', ')}`);
  }

  const timeDiff = Math.abs(
    ((a.year_start + a.year_end) / 2) - ((b.year_start + b.year_end) / 2)
  );
  if (timeDiff < 100) {
    reasons.push('Created within 100 years of each other');
  } else if (timeDiff < 500) {
    reasons.push('Created within 500 years of each other');
  }

  return reasons;
}
