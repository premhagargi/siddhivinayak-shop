/**
 * Server-side in-memory cache for homepage config.
 * Avoids hitting Firestore on every navigation.
 * Uses globalThis to survive Next.js HMR in dev.
 */

const globalForCache = globalThis as unknown as {
  _homepageCache?: any;
  _homepageCacheTs?: number;
};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function getHomepageCache(): { data: any; fresh: boolean } {
  const now = Date.now();
  if (globalForCache._homepageCache && now - (globalForCache._homepageCacheTs || 0) < CACHE_TTL_MS) {
    return { data: globalForCache._homepageCache, fresh: true };
  }
  return { data: globalForCache._homepageCache || null, fresh: false };
}

export function setHomepageCache(data: any) {
  globalForCache._homepageCache = data;
  globalForCache._homepageCacheTs = Date.now();
}

export function invalidateHomepageCache() {
  globalForCache._homepageCache = null;
  globalForCache._homepageCacheTs = 0;
}
