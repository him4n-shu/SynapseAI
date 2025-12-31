/**
 * Simple in-memory cache utility
 * Caches data with expiration time
 */

const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes default

/**
 * Get cached data by key
 * @param {string} key - Cache key
 * @returns {any|null} - Cached data or null if expired/not found
 */
export const getCachedData = (key) => {
  const cached = cache.get(key);
  
  if (!cached) {
    return null;
  }
  
  // Check if cache has expired
  if (Date.now() - cached.timestamp > cached.duration) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
};

/**
 * Set data in cache
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} duration - Cache duration in milliseconds (default: 5 minutes)
 */
export const setCachedData = (key, data, duration = CACHE_DURATION) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    duration,
  });
};

/**
 * Clear cache by key or clear all
 * @param {string} key - Cache key to clear (optional)
 */
export const clearCache = (key) => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};

/**
 * Check if cache has data for key
 * @param {string} key - Cache key
 * @returns {boolean} - True if cache has valid data
 */
export const hasCache = (key) => {
  return getCachedData(key) !== null;
};

/**
 * Get all cache keys
 * @returns {string[]} - Array of cache keys
 */
export const getCacheKeys = () => {
  return Array.from(cache.keys());
};

/**
 * Get cache size
 * @returns {number} - Number of items in cache
 */
export const getCacheSize = () => {
  return cache.size;
};

/**
 * Clear expired cache entries
 */
export const clearExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > value.duration) {
      cache.delete(key);
    }
  }
};

// Auto-clear expired cache every 10 minutes
setInterval(clearExpiredCache, 10 * 60 * 1000);

export default {
  get: getCachedData,
  set: setCachedData,
  clear: clearCache,
  has: hasCache,
  keys: getCacheKeys,
  size: getCacheSize,
  clearExpired: clearExpiredCache,
};

