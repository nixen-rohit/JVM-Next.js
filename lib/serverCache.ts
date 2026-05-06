// lib/serverCache.ts

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class ServerCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  del: any;
  
  get<T>(key: string, maxAgeMs: number): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > maxAgeMs) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }
  
  invalidate(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

export const serverCache = new ServerCache();