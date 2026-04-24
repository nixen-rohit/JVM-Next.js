// lib/invalidateCache.ts

import { serverCache } from './serverCache';

export function invalidateProjectCache() {
  // Clear server cache
  serverCache.invalidate('navbar-projects');
  serverCache.invalidate('all-projects');
  
  // Trigger client-side revalidation via SWR
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('projectsCacheInvalidated'));
  }
}


 