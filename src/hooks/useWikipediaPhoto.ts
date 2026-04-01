// ═══════════════════════════════════════════════════════════
// Bharat Lens — Wikipedia Photo Hook
// Fetches representative photos from Wikipedia Commons API
// ═══════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';

const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php';

interface PhotoResult {
  photoUrl: string | null;
  loading: boolean;
  error: boolean;
}

// In-memory cache to avoid redundant API calls
const photoCache = new Map<string, string | null>();

/**
 * Fetches a representative photo from Wikipedia's MediaWiki API
 * Uses the pageimages prop for reliable thumbnail extraction
 */
export function useWikipediaPhoto(
  name: string | undefined,
  existingPhotoUrl: string | null | undefined,
  enabled = true
): PhotoResult {
  const [photoUrl, setPhotoUrl] = useState<string | null>(existingPhotoUrl || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // If we already have a photo URL, use it
    if (existingPhotoUrl) {
      setPhotoUrl(existingPhotoUrl);
      setLoading(false);
      return;
    }

    if (!name || !enabled || name === '—') {
      setLoading(false);
      return;
    }

    // Check cache first
    if (photoCache.has(name)) {
      setPhotoUrl(photoCache.get(name) || null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(false);

    const fetchPhoto = async () => {
      try {
        // Clean up the name for Wikipedia search
        // Remove prefixes like "N.", "M. K.", "A." etc.
        const cleanName = name
          .replace(/^(Dr\.|Smt\.|Shri)\s+/i, '')
          .trim();

        const params = new URLSearchParams({
          action: 'query',
          titles: cleanName,
          prop: 'pageimages',
          format: 'json',
          pithumbsize: '200',
          origin: '*',
        });

        const response = await fetch(`${WIKIPEDIA_API}?${params}`, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error('Wikipedia API error');

        const data = await response.json();
        const pages = data.query?.pages;

        if (pages) {
          const pageId = Object.keys(pages)[0];
          const thumbnailUrl = pages[pageId]?.thumbnail?.source || null;

          photoCache.set(name, thumbnailUrl);
          setPhotoUrl(thumbnailUrl);
        } else {
          photoCache.set(name, null);
          setPhotoUrl(null);
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          photoCache.set(name, null);
          setPhotoUrl(null);
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPhoto();

    return () => {
      controller.abort();
    };
  }, [name, existingPhotoUrl, enabled]);

  return { photoUrl, loading, error };
}

/**
 * Batch fetch Wikipedia photos for multiple representatives
 * Returns a Map of name → photoUrl
 */
export async function fetchWikipediaPhotoBatch(
  names: string[]
): Promise<Map<string, string | null>> {
  const results = new Map<string, string | null>();
  const uncachedNames: string[] = [];

  // Check cache first
  names.forEach((name) => {
    if (photoCache.has(name)) {
      results.set(name, photoCache.get(name) || null);
    } else {
      uncachedNames.push(name);
    }
  });

  if (uncachedNames.length === 0) return results;

  // Wikipedia API supports batching up to 50 titles
  const batches: string[][] = [];
  for (let i = 0; i < uncachedNames.length; i += 50) {
    batches.push(uncachedNames.slice(i, i + 50));
  }

  for (const batch of batches) {
    try {
      const params = new URLSearchParams({
        action: 'query',
        titles: batch.join('|'),
        prop: 'pageimages',
        format: 'json',
        pithumbsize: '200',
        origin: '*',
      });

      const response = await fetch(`${WIKIPEDIA_API}?${params}`);
      if (!response.ok) continue;

      const data = await response.json();
      const pages = data.query?.pages;

      if (pages) {
        // Map page titles back to our names
        const titleToUrl = new Map<string, string | null>();
        Object.values(pages).forEach((page: unknown) => {
          const p = page as { title?: string; thumbnail?: { source: string } };
          if (p.title) {
            titleToUrl.set(p.title.toLowerCase(), p.thumbnail?.source || null);
          }
        });

        batch.forEach((name) => {
          const url = titleToUrl.get(name.toLowerCase()) || null;
          photoCache.set(name, url);
          results.set(name, url);
        });
      }
    } catch {
      // Skip failed batches
      batch.forEach((name) => {
        results.set(name, null);
      });
    }
  }

  return results;
}
