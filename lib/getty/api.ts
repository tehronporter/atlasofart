// lib/getty/api.ts - Getty Museum Open Content API client
// Phase 12: Getty API Integration

import { upsertArtwork, getArtworkByObjectId } from '../supabase/queries';

const GETTY_BASE_URL = 'https://www.getty.edu/public/collections/v1/api';

/**
 * Getty API response types
 */
interface GettyObject {
  id: number;
  objectID: string;
  title: string;
  artistDisplay: string;
  objectDate: string;
  objectDateStart?: number;
  objectDateEnd?: number;
  city?: string;
  country?: string;
  region?: string;
  culture?: string;
  medium?: string;
  dimensions?: string;
  repository?: string;
  primaryImage?: string;
  thumbnailImage?: string;
  objectUrl?: string;
  description?: string;
}

interface GettySearchResult {
  totalRecords: number;
  objects: GettyObject[];
}

/**
 * Fetch artworks from Getty API with pagination
 */
export async function fetchGettyArtworks(
  page = 0,
  pageSize = 100,
  filters?: {
    hasImage?: boolean;
    hasCoordinates?: boolean;
    dateRange?: [number, number];
  }
) {
  const params = new URLSearchParams({
    size: pageSize.toString(),
    page: page.toString(),
  });

  if (filters?.hasImage) {
    params.append('hasImage', 'true');
  }

  const url = `${GETTY_BASE_URL}/objects?${params}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Getty API error: ${response.statusText}`);
    }

    const data: GettySearchResult = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching from Getty API:', error);
    throw error;
  }
}

/**
 * Fetch single artwork by Getty object ID
 */
export async function fetchGettyObject(objectID: string): Promise<GettyObject | null> {
  try {
    const url = `${GETTY_BASE_URL}/objects/${objectID}`;
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data: GettyObject = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching Getty object ${objectID}:`, error);
    return null;
  }
}

/**
 * Parse date string to year range
 */
export function parseGettyDate(dateString: string): {
  date: string;
  dateStart?: number;
  dateEnd?: number;
} {
  if (!dateString) {
    return { date: '' };
  }

  // Handle various date formats
  const result: { date: string; dateStart?: number; dateEnd?: number } = {
    date: dateString,
  };

  // Try to extract year ranges like "1500-1550" or "c. 1500"
  const rangeMatch = dateString.match(/(\d{4})\s*-\s*(\d{4})/);
  if (rangeMatch) {
    result.dateStart = parseInt(rangeMatch[1], 10);
    result.dateEnd = parseInt(rangeMatch[2], 10);
    return result;
  }

  // Try to extract single year like "c. 1500" or "1500"
  const yearMatch = dateString.match(/(\d{4})/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1], 10);
    result.dateStart = year;
    result.dateEnd = year;
    return result;
  }

  // Handle BCE dates like "500 BC" or "500 BCE"
  const bceMatch = dateString.match(/(\d+)\s*(?:BC|BCE)/i);
  if (bceMatch) {
    const year = -parseInt(bceMatch[1], 10);
    result.dateStart = year;
    result.dateEnd = year;
    return result;
  }

  return result;
}

/**
 * Normalize Getty artwork to our database schema
 */
export function normalizeGettyArtwork(gettyObj: GettyObject): {
  object_id: string;
  title: string;
  artist_display: string | null;
  date: string | null;
  date_start: number | null;
  date_end: number | null;
  region: string | null;
  culture: string | null;
  medium: string | null;
  dimensions: string | null;
  latitude: number | null;
  longitude: number | null;
  image_url_primary: string | null;
  image_url_thumbnail: string | null;
  description: string | null;
  repository: string | null;
  place_created: string | null;
  tags: string[];
  getty_url: string;
  is_from_getty: boolean;
} {
  const dateInfo = parseGettyDate(gettyObj.objectDate || '');

  // Extract location coordinates if available
  // Note: Getty API doesn't always provide coordinates, may need geocoding
  let latitude: number | null = null;
  let longitude: number | null = null;

  // Build tags from available fields
  const tags: string[] = [];
  if (gettyObj.culture) tags.push(gettyObj.culture);
  if (gettyObj.medium) tags.push(gettyObj.medium);
  if (gettyObj.region) tags.push(gettyObj.region);

  return {
    object_id: gettyObj.objectID.toString(),
    title: gettyObj.title || 'Untitled',
    artist_display: gettyObj.artistDisplay || null,
    date: gettyObj.objectDate || null,
    date_start: dateInfo.dateStart || null,
    date_end: dateInfo.dateEnd || null,
    region: gettyObj.region || gettyObj.country || gettyObj.city || null,
    culture: gettyObj.culture || null,
    medium: gettyObj.medium || null,
    dimensions: gettyObj.dimensions || null,
    latitude,
    longitude,
    image_url_primary: gettyObj.primaryImage || null,
    image_url_thumbnail: gettyObj.thumbnailImage || gettyObj.primaryImage || null,
    description: gettyObj.description || null,
    repository: gettyObj.repository || null,
    place_created: gettyObj.city || null,
    tags,
    getty_url: gettyObj.objectUrl || `https://www.getty.edu/art/collection/objects/${gettyObj.objectID}`,
    is_from_getty: true,
  };
}

/**
 * Ingest a single Getty artwork into Supabase
 */
export async function ingestGettyArtwork(gettyObj: GettyObject) {
  try {
    // Check if already exists
    const existing = await getArtworkByObjectId(gettyObj.objectID.toString());
    
    if (existing) {
      // Update existing record
      const normalized = normalizeGettyArtwork(gettyObj);
      const result = await upsertArtwork({
        ...normalized,
        id: existing.id,
        updated_at: new Date().toISOString(),
      });
      return { ...result, isNew: false };
    }

    // Insert new record
    const normalized = normalizeGettyArtwork(gettyObj);
    const result = await upsertArtwork(normalized);
    return { ...result, isNew: true };
  } catch (error) {
    console.error(`Error ingesting Getty object ${gettyObj.objectID}:`, error);
    throw error;
  }
}

/**
 * Batch ingest Getty artworks
 */
export async function batchIngestGettyArtworks(
  batchSize = 100,
  maxPages = 10
): Promise<{
  added: number;
  updated: number;
  errors: string[];
}> {
  const added: number[] = [];
  const updated: number[] = [];
  const errors: string[] = [];

  for (let page = 0; page < maxPages; page++) {
    try {
      console.log(`Fetching Getty page ${page + 1}/${maxPages}...`);
      
      const result = await fetchGettyArtworks(page, batchSize, { hasImage: true });
      
      if (result.objects.length === 0) {
        console.log('No more objects to fetch');
        break;
      }

      console.log(`Processing ${result.objects.length} objects...`);

      for (const obj of result.objects) {
        try {
          const ingestResult = await ingestGettyArtwork(obj);
          if (ingestResult.isNew) {
            added.push(1);
          } else {
            updated.push(1);
          }
        } catch (error) {
          errors.push(`Object ${obj.objectID}: ${error}`);
        }
      }

      // Rate limiting - Getty API allows reasonable requests
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      errors.push(`Page ${page}: ${error}`);
      break;
    }
  }

  return {
    added: added.length,
    updated: updated.length,
    errors,
  };
}
