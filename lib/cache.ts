// lib/cache.ts - NEW FILE
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in seconds
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  
  set<T>(key: string, data: T, ttlSeconds: number = 60): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds,
    });
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    const ageSeconds = (now - entry.timestamp) / 1000;
    
    if (ageSeconds > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  invalidate(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
  
  // Get cache stats for monitoring
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const serverCache = new MemoryCache();

// Helper for slides caching
export const SLIDES_CACHE_KEY = 'all-slides';
export const ACTIVE_SLIDES_CACHE_KEY = 'active-slides';
export const SLIDE_CACHE_PREFIX = 'slide-';

export function getSlideCacheKey(id: string): string {
  return `${SLIDE_CACHE_PREFIX}${id}`;
}