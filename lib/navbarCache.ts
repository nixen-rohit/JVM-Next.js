// lib/navbarCache.ts

type Project = {
  id: string;
  name: string;
  slug: string;
  status: string;
};

let cachedProjects: Project[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 2 * 60 * 1000; // 5 minutes

// Track if there are pending changes
let hasPendingChanges = false;

export function getCachedProjects(): Project[] | null {
  const now = Date.now();
  
  // If there are pending changes, return null to force refresh
  if (hasPendingChanges) {
    return null;
  }
  
  // Return cached data if still fresh
  if (cachedProjects && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedProjects;
  }
  
  return null;
}

export function setCachedProjects(projects: Project[]) {
  cachedProjects = projects;
  cacheTimestamp = Date.now();
  hasPendingChanges = false;
}

export function markProjectsChanged() {
  hasPendingChanges = true;
  // Dispatch event to notify components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('projectsChanged'));
  }
}

export function clearCache() {
  cachedProjects = null;
  cacheTimestamp = 0;
  hasPendingChanges = false;
}