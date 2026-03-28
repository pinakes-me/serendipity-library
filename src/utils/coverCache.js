/**
 * Dual-layer cover image cache (in-memory + localStorage).
 * Prevents duplicate Naver API calls for previously-fetched book covers.
 */

const STORAGE_KEY = 'serendipity_cover_cache';
const MAX_ENTRIES = 500; // prevent localStorage from growing unbounded

// Hydrate in-memory map from localStorage on module load
const memoryCache = new Map();

try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    Object.entries(parsed).forEach(([key, value]) => {
      memoryCache.set(key, value);
    });
  }
} catch {
  // localStorage unavailable or corrupted — start fresh
}

/**
 * Persist the in-memory map to localStorage.
 */
const persistToStorage = () => {
  try {
    const obj = Object.fromEntries(memoryCache);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch {
    // quota exceeded or unavailable — silent fail
  }
};

/**
 * Return a cached cover URL for the given title, or null.
 */
export const getCachedCover = (title) => {
  if (!title) return null;
  return memoryCache.get(title) || null;
};

/**
 * Store a cover URL for the given title in both layers.
 */
export const setCachedCover = (title, url) => {
  if (!title || !url) return;

  // Evict oldest entries when limit is reached
  if (memoryCache.size >= MAX_ENTRIES) {
    const firstKey = memoryCache.keys().next().value;
    memoryCache.delete(firstKey);
  }

  memoryCache.set(title, url);
  persistToStorage();
};
