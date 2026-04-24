// hooks/useProjects.ts

import useSWR from 'swr';
import { useCallback } from 'react';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

// Cache for different endpoints
export function useNavbarProjects() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/projects/navbar',
    fetcher,
    {
      revalidateOnFocus: false,        // Don't refetch on window focus
      revalidateOnReconnect: false,    // Don't refetch on reconnect
      dedupingInterval: 60000,          // Deduplicate requests within 60s
      refreshInterval: 0,               // No auto refresh
      fallbackData: [],                 // Empty array as fallback
    }
  );

  return {
    projects: data || [],
    isLoading,
    error,
    refreshProjects: mutate,  // Manual refresh when needed
  };
}

// For single project data
export function useProject(slug: string) {
  const { data, error, isLoading, mutate } = useSWR(
    slug ? `/api/projects/slugs/${slug}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
      refreshInterval: 0,
    }
  );

  return {
    project: data,
    isLoading,
    error,
    refreshProject: mutate,
  };
}